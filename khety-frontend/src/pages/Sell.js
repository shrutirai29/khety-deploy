import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import useEnterNavigation from "../lib/useEnterNavigation";

function Sell() {
  const { registerField, handleEnter } = useEnterNavigation([
    "name",
    "price",
    "location",
    "quantity",
    "unit",
    "availability"
  ]);
  const formatTime = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const getStatusLabel = (request) => {
    if (request.status === "confirmed") {
      return "final confirmed";
    }

    if (request.farmerConfirmed || request.ownerConfirmed) {
      return "waiting for both confirmations";
    }

    return request.status || "pending";
  };

  const getRequestKey = (cropId, ownerId) => `${cropId}-${ownerId}`;
  const isFinalConfirmed = (request) =>
    request?.status === "confirmed" && request?.farmerConfirmed && request?.ownerConfirmed;

  const user = JSON.parse(sessionStorage.getItem("user"));
  const [form, setForm] = useState({
    name: "",
    price: "",
    location: "",
    quantity: "",
    unit: "quintal",
    availability: "Immediate",
    notes: ""
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [myCrops, setMyCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeActionKey, setActiveActionKey] = useState("");

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const loadMyCrops = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/crops");
        const crops = Array.isArray(data) ? data : [];

        setMyCrops(
          crops.filter((crop) => String(crop.farmerId) === String(user._id))
        );
      } catch (err) {
        console.log(err);
        setMyCrops([]);
      } finally {
        setLoading(false);
      }
    };

    loadMyCrops();
  }, [refreshKey, user?._id]);

  const totalRequests = useMemo(
    () => myCrops.reduce((count, crop) => count + (crop.interestedBuyers?.length || 0), 0),
    [myCrops]
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateReplyDraft = (cropId, ownerId, value) => {
    const key = getRequestKey(cropId, ownerId);
    setReplyDrafts((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const submit = async () => {
    const normalizedName = form.name.trim().replace(/\s+/g, " ");
    const normalizedPrice = form.price.trim();
    const normalizedLocation = form.location.trim();

    if (!normalizedName || !normalizedPrice || !normalizedLocation) {
      alert("Please fill all fields");
      return;
    }

    if (!/^[a-zA-Z\s-]+$/.test(normalizedName)) {
      alert("Enter a valid crop name");
      return;
    }

    try {
      await apiFetch("/api/crops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: normalizedName,
          price: normalizedPrice,
          location: normalizedLocation,
          quantity: form.quantity.trim(),
          unit: form.unit,
          availability: form.availability,
          notes: form.notes.trim(),
          farmerId: user._id,
          farmerName: user.name
        })
      });

      setStatusMessage("Your crop listing is live now.");
      setForm({
        name: "",
        price: "",
        location: "",
        quantity: "",
        unit: "quintal",
        availability: "Immediate",
        notes: ""
      });
      setRefreshKey(Date.now());
    } catch (err) {
      alert(err.message);
    }
  };

  const updateRequestStatus = async (cropId, ownerId, status) => {
    const key = getRequestKey(cropId, ownerId);
    const farmerResponse = (replyDrafts[key] || "").trim();
    const crop = myCrops.find((item) => item._id === cropId);
    const buyer = crop?.interestedBuyers?.find((item) => String(item.ownerId) === String(ownerId));
    const reopenReason =
      isFinalConfirmed(buyer) && status !== "confirmed"
        ? window.prompt("This request is already fully confirmed. Enter a reason to reopen and change it.")
        : "";

    if (isFinalConfirmed(buyer) && status !== "confirmed" && !reopenReason?.trim()) {
      return;
    }

    try {
      setActiveActionKey(`${key}-${status}`);

      await apiFetch(`/api/crops/${cropId}/request/${ownerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          farmerResponse,
          actorRole: "farmer",
          reopenReason
        })
      });

      setRefreshKey(Date.now());
    } catch (err) {
      alert(err.message);
    } finally {
      setActiveActionKey("");
    }
  };

  const sendReplyMessage = async (cropId, ownerId) => {
    const key = getRequestKey(cropId, ownerId);
    const text = (replyDrafts[key] || "").trim();
    const crop = myCrops.find((item) => item._id === cropId);
    const buyer = crop?.interestedBuyers?.find((item) => String(item.ownerId) === String(ownerId));

    if (!text) {
      alert("Write a reply first");
      return;
    }

    const reopenReason = isFinalConfirmed(buyer)
      ? window.prompt("This request is already fully confirmed. Enter a reason to reopen the chat.")
      : "";

    if (isFinalConfirmed(buyer) && !reopenReason?.trim()) {
      return;
    }

    try {
      setActiveActionKey(`${key}-message`);

      await apiFetch(`/api/crops/${cropId}/request/${ownerId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          senderId: user._id,
          senderName: user.name,
          senderRole: "farmer",
          text,
          reopenReason
        })
      });

      setReplyDrafts((prev) => ({
        ...prev,
        [key]: ""
      }));
      setRefreshKey(Date.now());
    } catch (err) {
      alert(err.message);
    } finally {
      setActiveActionKey("");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();
          const addr = data.address || {};

          const locationText = [
            addr.suburb,
            addr.village,
            addr.town,
            addr.city,
            addr.county,
            addr.state
          ]
            .filter(Boolean)
            .join(", ");

          setForm((prev) => ({
            ...prev,
            location: locationText || "Location not found"
          }));
        } catch (err) {
          alert("Failed to fetch location");
        }
      },
      () => {
        alert("Location permission denied");
      }
    );
  };

  if (!user || user.role !== "farmer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Only farmers can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-lime-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">
            Farmer Section
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Sell crops, respond to requests, and chat</h1>
          <p className="mt-3 text-slate-600 max-w-3xl">
            List your crops, review owner interest, reply to their requests, and
            confirm the deal once both sides are ready.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1.95fr] gap-8">
          <section className="space-y-6">
            <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900">Add new crop</h2>
              <p className="mt-2 text-slate-500">Create a listing so owners can contact you.</p>

              {statusMessage ? (
                <p className="mt-4 rounded-2xl bg-green-50 text-green-700 px-4 py-3 text-sm font-medium">
                  {statusMessage}
                </p>
              ) : null}

              <div className="mt-5 space-y-4">
                <input
                  name="name"
                  value={form.name}
                  ref={registerField("name")}
                  placeholder="Crop name"
                  onChange={handleChange}
                  onKeyDown={handleEnter("name")}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none"
                />

                <input
                  name="price"
                  value={form.price}
                  ref={registerField("price")}
                  placeholder="Price"
                  onChange={handleChange}
                  onKeyDown={handleEnter("price")}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none"
                />

                <div className="flex gap-2">
                  <input
                    name="location"
                    value={form.location}
                    ref={registerField("location")}
                    placeholder="Location"
                    onChange={handleChange}
                    onKeyDown={handleEnter("location")}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none"
                  />

                  <button
                    type="button"
                    onClick={getLocation}
                    className="location-capture-btn rounded-2xl border border-[#cfe0d3] bg-[linear-gradient(135deg,#f4fbf5_0%,#dff0e3_100%)] px-5 font-semibold text-[#215732] shadow-[0_12px_28px_rgba(33,87,50,0.12)] transition hover:-translate-y-[1px] hover:border-[#94b7a0] hover:bg-[linear-gradient(135deg,#eff9f1_0%,#cfe8d6_100%)]"
                  >
                    Use live
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="quantity"
                    value={form.quantity}
                    ref={registerField("quantity")}
                    placeholder="Quantity available"
                    onChange={handleChange}
                    onKeyDown={handleEnter("quantity")}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none"
                  />

                  <select
                    name="unit"
                    value={form.unit}
                    ref={registerField("unit")}
                    onChange={handleChange}
                    onKeyDown={handleEnter("unit")}
                    className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none"
                  >
                    <option value="quintal">Quintal</option>
                    <option value="kg">Kg</option>
                    <option value="ton">Ton</option>
                    <option value="bag">Bag</option>
                  </select>
                </div>

                <select
                  name="availability"
                  value={form.availability}
                  ref={registerField("availability")}
                  onChange={handleChange}
                  onKeyDown={handleEnter("availability", submit)}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Within 3 days">Within 3 days</option>
                  <option value="Within a week">Within a week</option>
                  <option value="Seasonal stock">Seasonal stock</option>
                </select>

                <textarea
                  name="notes"
                  value={form.notes}
                  rows="3"
                  placeholder="Quality notes, harvest details, moisture, or pickup info"
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-400 outline-none resize-none"
                />

                <button
                  onClick={submit}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition font-semibold"
                >
                  Add crop listing
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg">
                <p className="text-sm uppercase tracking-[0.2em] text-green-300">My listings</p>
                <h3 className="mt-2 text-3xl font-bold">{myCrops.length}</h3>
                <p className="mt-2 text-slate-300">Total crops you have listed for sale.</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
                <p className="text-sm uppercase tracking-[0.2em] text-amber-600">Owner requests</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{totalRequests}</h3>
                <p className="mt-2 text-slate-500">Total incoming requests across all your listed crops.</p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">My crop listings</h2>
              <p className="text-slate-500">Each owner request now has status controls and a chat thread.</p>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow text-slate-500">
                Loading your crop listings...
              </div>
            ) : myCrops.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow text-slate-500">
                No crops listed yet.
              </div>
            ) : (
              <div className="grid xl:grid-cols-2 gap-6">
                {myCrops.map((crop) => (
                  <article
                    key={crop._id}
                    className="bg-white rounded-3xl p-6 shadow-md border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 capitalize">{crop.name}</h3>
                        <p className="mt-1 text-lg font-semibold text-green-700">Rs. {crop.price}</p>
                      </div>
                      <span className="rounded-full bg-green-50 text-green-700 text-xs font-semibold px-3 py-2">
                        {crop.interestedBuyers?.length || 0} requests
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Location: <span className="font-medium text-slate-800">{crop.location}</span>
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p>
                        Quantity: <span className="font-medium text-slate-900">{crop.quantity || "Not specified"} {crop.unit || ""}</span>
                      </p>
                      <p>
                        Availability: <span className="font-medium text-slate-900">{crop.availability || "Immediate"}</span>
                      </p>
                    </div>
                    {crop.notes ? (
                      <p className="mt-3 rounded-xl bg-lime-50 p-3 text-sm text-slate-700">
                        {crop.notes}
                      </p>
                    ) : null}

                    <div className="mt-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Incoming owner requests
                      </h4>

                      {!crop.interestedBuyers?.length ? (
                        <p className="mt-3 text-sm text-slate-400 bg-slate-50 rounded-2xl p-4">
                          No owner requests yet for this crop.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {crop.interestedBuyers.map((buyer, index) => {
                            const key = getRequestKey(crop._id, buyer.ownerId);
                            const chatMessages = buyer.chatMessages || [];
                            const finalConfirmed = isFinalConfirmed(buyer);

                            return (
                              <div
                                key={`${buyer.ownerId}-${index}`}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-slate-900">{buyer.ownerName}</p>
                                    <p className="text-sm text-slate-500 capitalize">
                                      Wants to {buyer.requestType || "chat"}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold capitalize">
                                    {getStatusLabel(buyer)}
                                  </span>
                                </div>

                                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                  <p>Phone: <span className="font-medium text-slate-900">{buyer.ownerPhone || "Not shared"}</span></p>
                                  <p>Email: <span className="font-medium text-slate-900">{buyer.ownerEmail || "Not shared"}</span></p>
                                  <p className="sm:col-span-2">
                                    Location: <span className="font-medium text-slate-900">{buyer.ownerLocation || "Not shared"}</span>
                                  </p>
                                </div>

                                <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
                                  {buyer.message || "No note added by the owner."}
                                </p>

                                {buyer.farmerResponse ? (
                                  <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                                    Your latest response: {buyer.farmerResponse}
                                  </p>
                                ) : null}

                                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
                                  <p className={`rounded-xl px-3 py-2 ${buyer.farmerConfirmed ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>
                                    Farmer confirmation: {buyer.farmerConfirmed ? "done" : "pending"}
                                  </p>
                                  <p className={`rounded-xl px-3 py-2 ${buyer.ownerConfirmed ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>
                                    Owner confirmation: {buyer.ownerConfirmed ? "done" : "pending"}
                                  </p>
                                </div>

                                {buyer.reopenReason ? (
                                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                    Reopened by {buyer.reopenedByRole || "user"}: {buyer.reopenReason}
                                  </p>
                                ) : null}

                                <div className="mt-4 rounded-2xl bg-white border border-slate-100 p-3 space-y-3">
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Chat
                                  </p>

                                  {chatMessages.length === 0 ? (
                                    <p className="text-sm text-slate-400">No chat messages yet.</p>
                                  ) : (
                                    <div className="space-y-2 max-h-56 overflow-y-auto">
                                      {chatMessages.map((chat, chatIndex) => (
                                        <div
                                          key={`${chat.senderId}-${chatIndex}`}
                                          className={`rounded-xl px-3 py-2 text-sm ${
                                            chat.senderRole === "farmer"
                                              ? "bg-green-50 text-green-900"
                                              : "bg-slate-100 text-slate-800"
                                          }`}
                                        >
                                          <p className="font-semibold">
                                            {chat.senderName} <span className="text-xs font-normal uppercase">{chat.senderRole}</span>
                                          </p>
                                          <p className="mt-1">{chat.text}</p>
                                          <p className="mt-1 text-xs opacity-70">{formatTime(chat.createdAt)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <textarea
                                  value={replyDrafts[key] || ""}
                                  onChange={(e) => updateReplyDraft(crop._id, buyer.ownerId, e.target.value)}
                                  rows="3"
                                  placeholder="Reply to the owner or continue the chat..."
                                  className="mt-4 w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-green-400 resize-none"
                                />

                                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                                  <button
                                    onClick={() => sendReplyMessage(crop._id, buyer.ownerId)}
                                    disabled={activeActionKey === `${key}-message`}
                                    className="rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:bg-slate-300"
                                  >
                                    {activeActionKey === `${key}-message` ? "Sending..." : "Send chat message"}
                                  </button>
                <button
                  onClick={() => updateRequestStatus(crop._id, buyer.ownerId, "accepted")}
                  disabled={activeActionKey === `${key}-accepted`}
                  className="rounded-2xl bg-green-600 text-white py-3 font-semibold disabled:bg-slate-300"
                >
                  Accept request
                </button>
                                  <button
                                    onClick={() => updateRequestStatus(crop._id, buyer.ownerId, "rejected")}
                                    disabled={activeActionKey === `${key}-rejected`}
                                    className="rounded-2xl bg-rose-600 text-white py-3 font-semibold disabled:bg-slate-300"
                                  >
                                    Reject request
                                  </button>
                                  <button
                                    onClick={() => updateRequestStatus(crop._id, buyer.ownerId, "confirmed")}
                                    disabled={activeActionKey === `${key}-confirmed` || finalConfirmed || buyer.farmerConfirmed}
                                    className="rounded-2xl bg-amber-500 text-white py-3 font-semibold disabled:bg-slate-300"
                                  >
                                    {finalConfirmed ? "Final confirmed" : "Confirm from farmer side"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Sell;

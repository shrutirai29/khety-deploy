import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

function OwnerMarketplace() {
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

  const user = JSON.parse(sessionStorage.getItem("user"));
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [requestDrafts, setRequestDrafts] = useState({});
  const [chatDrafts, setChatDrafts] = useState({});
  const [activeActionKey, setActiveActionKey] = useState("");
  const [search, setSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState("all");

  useEffect(() => {
    const loadCrops = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/crops");
        setCrops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadCrops();
  }, [refreshKey]);

  const myRequests = useMemo(() => {
    return crops
      .filter((crop) =>
        crop.interestedBuyers?.some(
          (buyer) => String(buyer.ownerId) === String(user?._id)
        )
      )
      .map((crop) => ({
        ...crop,
        myRequest: crop.interestedBuyers.find(
          (buyer) => String(buyer.ownerId) === String(user?._id)
        )
      }));
  }, [crops, user?._id]);

  const myRequestedCropIds = useMemo(
    () => new Set(myRequests.map((item) => item._id)),
    [myRequests]
  );

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const haystack = `${crop.name} ${crop.location} ${crop.farmerName}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [crops, search]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((item) => {
      const matchesStatus =
        requestFilter === "all" || (item.myRequest?.status || "pending") === requestFilter;
      const haystack = `${item.name} ${item.farmerName} ${item.myRequest?.requestType || ""}`.toLowerCase();
      return matchesStatus && haystack.includes(search.trim().toLowerCase());
    });
  }, [myRequests, requestFilter, search]);

  const updateDraft = (cropId, field, value) => {
    setRequestDrafts((prev) => ({
      ...prev,
      [cropId]: {
        requestType: prev[cropId]?.requestType || "chat",
        message: prev[cropId]?.message || "",
        [field]: value
      }
    }));
  };

  const updateChatDraft = (cropId, ownerId, value) => {
    const key = getRequestKey(cropId, ownerId);
    setChatDrafts((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const sendRequest = async (cropId) => {
    const draft = requestDrafts[cropId] || {
      requestType: "chat",
      message: ""
    };

    try {
      setSendingId(cropId);

      await apiFetch(`/api/crops/${cropId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ownerId: user._id,
          ownerName: user.name,
          ownerPhone: user.phone,
          ownerEmail: user.email,
          ownerLocation: user.location,
          requestType: draft.requestType,
          message: draft.message
        })
      });

      setRefreshKey(Date.now());
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingId("");
    }
  };

  const sendChatMessage = async (cropId, ownerId) => {
    const key = getRequestKey(cropId, ownerId);
    const text = (chatDrafts[key] || "").trim();

    if (!text) {
      alert("Write a message first");
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
          senderRole: "owner",
          text
        })
      });

      setChatDrafts((prev) => ({
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

  const updateRequestStatus = async (cropId, ownerId, status) => {
    const key = getRequestKey(cropId, ownerId);

    try {
      setActiveActionKey(`${key}-${status}`);

      await apiFetch(`/api/crops/${cropId}/request/${ownerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          actorRole: "owner"
        })
      });

      setRefreshKey(Date.now());
    } catch (err) {
      alert(err.message);
    } finally {
      setActiveActionKey("");
    }
  };

  if (!user || user.role !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Only owners can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Owner Section
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Farmer listings, negotiation requests, and chat
          </h1>
          <p className="mt-3 text-slate-600 max-w-3xl">
            Browse listed crops, send a request to chat or negotiate, continue the
            conversation, and confirm the deal after the farmer responds.
          </p>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by crop, farmer, or location"
                className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-emerald-400"
              />
              <select
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-emerald-400"
              >
                <option value="all">All request states</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">All farmer crops</h2>
                <p className="text-slate-500">Send a request directly from any listing.</p>
              </div>
              <div className="rounded-full bg-white border border-emerald-100 px-4 py-2 text-sm text-slate-600 shadow-sm">
                {crops.length} listings
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow text-slate-500">
                Loading crop listings...
              </div>
            ) : crops.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow text-slate-500">
                No crops have been listed yet.
              </div>
            ) : (
              <div className="grid xl:grid-cols-2 gap-6">
                {filteredCrops.map((item) => {
                  const draft = requestDrafts[item._id] || {
                    requestType: "chat",
                    message: ""
                  };
                  const alreadyRequested = myRequestedCropIds.has(item._id);

                  return (
                    <article
                      key={item._id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-md p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 capitalize">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-lg text-emerald-700 font-semibold">
                            Rs. {item.price}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-2">
                          {alreadyRequested ? "Request sent" : "Open listing"}
                        </span>
                      </div>

                      <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Farmer</p>
                          <p className="mt-1 font-semibold text-slate-900">{item.farmerName || "Farmer not available"}</p>
                          {item.farmerPhone ? <p className="mt-1 text-xs text-slate-500">{item.farmerPhone}</p> : null}
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                          <p className="mt-1 font-semibold text-slate-900">{item.farmerLocation || item.location || "Location not available"}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Quantity</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {item.quantity || "Not specified"} {item.unit || ""}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Availability</p>
                          <p className="mt-1 font-semibold text-slate-900">{item.availability || "Immediate"}</p>
                        </div>
                      </div>

                      {item.notes ? (
                        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-slate-700">
                          {item.notes}
                        </p>
                      ) : null}

                      <div className="mt-5 space-y-3">
                        <select
                          value={draft.requestType}
                          onChange={(e) => updateDraft(item._id, "requestType", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-emerald-400"
                        >
                          <option value="chat">Request to chat</option>
                          <option value="negotiate">Request to negotiate price</option>
                          <option value="buy">Ready to buy</option>
                        </select>

                        <textarea
                          value={draft.message}
                          onChange={(e) => updateDraft(item._id, "message", e.target.value)}
                          rows="4"
                          placeholder="Write a short note for the farmer..."
                          className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-emerald-400 resize-none"
                        />

                        <button
                          onClick={() => sendRequest(item._id)}
                          disabled={sendingId === item._id}
                          className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 disabled:bg-slate-300"
                        >
                          {sendingId === item._id ? "Sending..." : alreadyRequested ? "Update my request" : "Send request"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">My requests</p>
              <h2 className="mt-2 text-2xl font-bold">{myRequests.length}</h2>
              <p className="mt-2 text-slate-300">
                Continue the conversation after the farmer replies.
              </p>
            </div>

            <div className="space-y-4">
              {myRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-5 shadow text-slate-500">
                  You have not sent any farmer requests yet.
                </div>
              ) : (
                filteredRequests.map((item) => {
                  const key = getRequestKey(item._id, item.myRequest?.ownerId);
                  const chatMessages = item.myRequest?.chatMessages || [];

                  return (
                    <div key={item._id} className="bg-white rounded-2xl p-5 shadow border border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 capitalize">{item.name}</h3>
                          <p className="text-sm text-slate-500">{item.farmerName || "Farmer not available"}</p>
                        </div>
                        <span className="text-xs font-semibold rounded-full bg-amber-50 text-amber-700 px-3 py-1 capitalize">
                          {getStatusLabel(item.myRequest || {})}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-600">
                        Type: <span className="font-semibold capitalize">{item.myRequest?.requestType || "chat"}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Location: <span className="font-semibold">{item.farmerLocation || item.location}</span>
                      </p>
                      <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-xl p-3">
                        {item.myRequest?.message || "No note added."}
                      </p>

                      {item.myRequest?.farmerResponse ? (
                        <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                          Farmer response: {item.myRequest.farmerResponse}
                        </p>
                      ) : null}

                      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
                        <p className={`rounded-xl px-3 py-2 ${item.myRequest?.farmerConfirmed ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>
                          Farmer confirmation: {item.myRequest?.farmerConfirmed ? "done" : "pending"}
                        </p>
                        <p className={`rounded-xl px-3 py-2 ${item.myRequest?.ownerConfirmed ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>
                          Owner confirmation: {item.myRequest?.ownerConfirmed ? "done" : "pending"}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-3 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Chat
                        </p>

                        {chatMessages.length === 0 ? (
                          <p className="text-sm text-slate-400">No chat messages yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {chatMessages.map((chat, index) => (
                              <div
                                key={`${chat.senderId}-${index}`}
                                className={`rounded-xl px-3 py-2 text-sm ${
                                  chat.senderRole === "owner"
                                    ? "bg-emerald-50 text-emerald-900"
                                    : "bg-white text-slate-800"
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
                        value={chatDrafts[key] || ""}
                        onChange={(e) => updateChatDraft(item._id, item.myRequest.ownerId, e.target.value)}
                        rows="3"
                        placeholder="Continue chatting with the farmer..."
                        className="mt-4 w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-emerald-400 resize-none"
                      />

                      <div className="mt-3 grid gap-2">
                        <button
                          onClick={() => sendChatMessage(item._id, item.myRequest.ownerId)}
                          disabled={activeActionKey === `${key}-message`}
                          className="rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:bg-slate-300"
                        >
                          {activeActionKey === `${key}-message` ? "Sending..." : "Send chat message"}
                        </button>

                        <button
                          onClick={() => updateRequestStatus(item._id, item.myRequest.ownerId, "confirmed")}
                          disabled={activeActionKey === `${key}-confirmed`}
                          className="rounded-2xl bg-amber-500 text-white py-3 font-semibold disabled:bg-slate-300"
                        >
                          Confirm from owner side
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default OwnerMarketplace;

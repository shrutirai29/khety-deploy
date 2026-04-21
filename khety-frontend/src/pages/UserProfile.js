import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

const createInitialForm = () => ({
  name: "",
  email: "",
  phone: "",
  role: "",
  location: "",
  birthdate: "",
  gender: "",
  occupation: "",
  preferredLanguage: "",
  farmSize: "",
  primaryCrops: "",
  experienceLevel: "",
  bio: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  accountStatus: "active",
  createdAt: ""
});

function UserProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(createInitialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        const user = data.user;

        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "",
          location: user.location || "",
          birthdate: user.birthdate ? user.birthdate.slice(0, 10) : "",
          gender: user.gender || "",
          occupation: user.occupation || "",
          preferredLanguage: user.preferredLanguage || "",
          farmSize: user.farmSize || "",
          primaryCrops: (user.primaryCrops || []).join(", "),
          experienceLevel: user.experienceLevel || "",
          bio: user.bio || "",
          address: user.address || "",
          emergencyContactName: user.emergencyContactName || "",
          emergencyContactPhone: user.emergencyContactPhone || "",
          accountStatus: user.accountStatus || "active",
          createdAt: user.createdAt || ""
        });

        sessionStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Unable to load your profile." });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profileHighlights = useMemo(
    () => [
      ["Role", form.role ? form.role[0].toUpperCase() + form.role.slice(1) : "User"],
      ["Location", form.location || "Add your working area"],
      ["Language", form.preferredLanguage || "Set preference"],
      ["Status", form.accountStatus === "deactivated" ? "Deactivated" : "Active"]
    ],
    [form]
  );

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setMessage({ type: "", text: "" });

    if (!form.name.trim() || !form.phone.trim() || !form.location.trim()) {
      setMessage({ type: "error", text: "Name, phone, and location are required." });
      return;
    }

    try {
      setSaving(true);
      const data = await apiFetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          location: form.location,
          birthdate: form.birthdate || null,
          gender: form.gender,
          occupation: form.occupation,
          preferredLanguage: form.preferredLanguage,
          farmSize: form.farmSize,
          primaryCrops: form.primaryCrops,
          experienceLevel: form.experienceLevel,
          bio: form.bio,
          address: form.address,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone
        })
      });

      sessionStorage.setItem("user", JSON.stringify(data.user));
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "This will deactivate your account and sign you out immediately. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivating(true);
      await apiFetch("/api/auth/deactivate", {
        method: "PATCH"
      });

      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("siteLanguage");
      navigate("/login");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to deactivate account." });
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f1] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-[#dbe3d9] bg-white p-8 text-sm text-[#5e6b62]">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(200,146,67,0.18),_transparent_25%),linear-gradient(180deg,#f4f7f1_0%,#eef4ec_100%)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_24px_70px_rgba(16,34,23,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            User Detail Page
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-extrabold text-[#102217]">{form.name || "Your profile"}</h1>
              <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
                Keep your working details, emergency info, and extra personal questions in one
                place so the account feels complete when you come back later.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {profileHighlights.map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-[#102217] px-5 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/55">{label}</p>
                  <p className="mt-2 text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {message.text ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              message.type === "error" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#dbe3d9] bg-white p-7 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
              <h2 className="text-2xl font-extrabold text-[#102217]">Basic details</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Full name" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.email} disabled placeholder="Email" className="rounded-2xl border border-[#e2e7e0] bg-[#f3f5f1] px-4 py-3 text-[#6f7b72]" />
                <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Phone number" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.location} onChange={(e) => updateField("location", e.target.value)} placeholder="Location" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input type="date" value={form.birthdate} onChange={(e) => updateField("birthdate", e.target.value)} className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.gender} onChange={(e) => updateField("gender", e.target.value)} placeholder="Gender" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
              </div>
            </div>

            <div className="rounded-[30px] border border-[#dbe3d9] bg-white p-7 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
              <h2 className="text-2xl font-extrabold text-[#102217]">Extra questions</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input value={form.occupation} onChange={(e) => updateField("occupation", e.target.value)} placeholder="Occupation" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.preferredLanguage} onChange={(e) => updateField("preferredLanguage", e.target.value)} placeholder="Preferred language" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.farmSize} onChange={(e) => updateField("farmSize", e.target.value)} placeholder="Farm size or business scale" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.experienceLevel} onChange={(e) => updateField("experienceLevel", e.target.value)} placeholder="Experience level" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.primaryCrops} onChange={(e) => updateField("primaryCrops", e.target.value)} placeholder="Primary crops or products" className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732] md:col-span-2" />
                <textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Tell us a little about yourself" rows={4} className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732] md:col-span-2" />
                <textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Full address" rows={3} className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732] md:col-span-2" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#dbe3d9] bg-white p-7 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
              <h2 className="text-2xl font-extrabold text-[#102217]">Safety contact</h2>
              <div className="mt-6 space-y-4">
                <input value={form.emergencyContactName} onChange={(e) => updateField("emergencyContactName", e.target.value)} placeholder="Emergency contact name" className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
                <input value={form.emergencyContactPhone} onChange={(e) => updateField("emergencyContactPhone", e.target.value)} placeholder="Emergency contact phone" className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]" />
              </div>
            </div>

            <div className="rounded-[30px] border border-[#dbe3d9] bg-white p-7 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
              <h2 className="text-2xl font-extrabold text-[#102217]">Account controls</h2>
              <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
                Member since {form.createdAt ? new Date(form.createdAt).toLocaleDateString("en-IN") : "recently"}.
                Use this section if you want to stop using the account.
              </p>

              <div className="mt-6 space-y-3">
                <button onClick={handleSave} disabled={saving} className="w-full rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24] disabled:bg-[#98aa9d]">
                  {saving ? "Saving profile..." : "Save profile"}
                </button>
                <button onClick={handleDeactivate} disabled={deactivating} className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70">
                  {deactivating ? "Deactivating..." : "Deactivate account"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserProfile;

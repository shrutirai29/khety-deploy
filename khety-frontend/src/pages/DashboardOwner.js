import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

function DashboardOwner() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const formatActivityTime = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleString("en-IN")
      : "Recently updated";
  };

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await apiFetch("/api/dashboard/summary");
        setSummary(data);
      } catch (err) {
        setMessage(err.message || "Unable to load owner summary.");
      }
    };

    loadSummary();
  }, []);

  const metrics = useMemo(
    () => summary?.metrics || {
      totalListings: 0,
      myRequests: 0,
      pendingRequests: 0,
      activeNegotiations: 0
    },
    [summary]
  );

  const actions = [
    {
      title: "Browse Farmer Listings",
      desc: "Search crop listings with better context before you send a request.",
      buttonText: "Open owner section",
      onClick: () => navigate("/owner-marketplace"),
      gradient: "from-emerald-500 to-teal-700"
    },
    {
      title: "Track My Requests",
      desc: "Follow open negotiations, confirmations, and chat progress in one place.",
      buttonText: "View requests",
      onClick: () => navigate("/owner-marketplace"),
      gradient: "from-cyan-500 to-blue-700"
    },
    {
      title: "Browse Inputs",
      desc: "Explore curated agricultural products while staying in the same platform.",
      buttonText: "Open products",
      onClick: () => navigate("/marketplace"),
      gradient: "from-amber-500 to-orange-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border border-cyan-100 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Owner Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-3 text-slate-600 max-w-3xl">
            Your request pipeline, active negotiations, and available farmer listings now sit in one
            operating view instead of separate disconnected pages.
          </p>
        </div>

        {message ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Open listings", metrics.totalListings],
            ["My requests", metrics.myRequests],
            ["Pending", metrics.pendingRequests],
            ["Active negotiations", metrics.activeNegotiations]
          ].map(([label, value]) => (
            <div key={label} className="dashboard-stat-card rounded-3xl border border-cyan-100 bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((item) => (
              <div
                key={item.title}
                className={`dashboard-action-card theme-keeps-gradient rounded-3xl border border-white/10 p-6 text-white bg-gradient-to-br ${item.gradient} shadow-lg`}
              >
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <p className="mt-3 text-white/90 md:min-h-[96px]">{item.desc}</p>

                <button
                  onClick={item.onClick}
                  className="mt-6 rounded-2xl bg-white text-slate-900 px-4 py-3 font-semibold w-full"
                >
                  {item.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="dashboard-panel-card rounded-3xl border border-cyan-100 bg-white p-6 shadow-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Recent Activity
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Latest request movement</h2>

            <div className="mt-6 space-y-4">
              {(summary?.activities || []).length ? (
                summary.activities.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cyan-700">
                      {formatActivityTime(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-cyan-50 p-4 text-sm text-slate-600">
                  Your recent negotiation and request activity will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOwner;

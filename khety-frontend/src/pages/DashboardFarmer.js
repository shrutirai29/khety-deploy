import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

function DashboardFarmer() {
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
        setMessage(err.message || "Unable to load dashboard summary.");
      }
    };

    loadSummary();
  }, []);

  const metrics = useMemo(
    () => summary?.metrics || {
      totalScans: 0,
      healthyScans: 0,
      needsAttention: 0,
      totalListings: 0,
      activeListings: 0,
      totalRequests: 0,
      pendingRequests: 0
    },
    [summary]
  );

  const actions = [
    {
      title: "Run Detection",
      desc: "Upload a fresh crop photo and generate a treatment-ready report.",
      link: "/detect",
      tone: "bg-[#102217] text-white"
    },
    {
      title: "Review Reports",
      desc: "Use saved report history to spot repeated issues and compare health trends.",
      link: "/history",
      tone: "bg-white text-[#102217] border border-[#d9e1d7]"
    },
    {
      title: "Manage Listings",
      desc: "Publish better listings with quantity, availability, and buyer conversation tracking.",
      link: "/sell",
      tone: "bg-[#215732] text-white"
    },
    {
      title: "Browse Inputs",
      desc: "Check curated marketplace products without losing your farmer workflow.",
      link: "/marketplace",
      tone: "bg-[#c89243] text-[#102217]"
    }
  ];

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Farmer Dashboard
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-extrabold text-[#102217]">
                Good to see you, {user?.name}.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
                Your crop health, live listings, and owner activity are now summarized together so
                daily decisions are easier to prioritize.
              </p>
            </div>

            <div className="rounded-3xl bg-[#102217] px-6 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Current role</p>
              <p className="mt-2 text-2xl font-bold">Farmer</p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Total scans", metrics.totalScans],
            ["Healthy", metrics.healthyScans],
            ["Needs attention", metrics.needsAttention],
            ["Listings", metrics.totalListings],
            ["Active listings", metrics.activeListings],
            ["Pending requests", metrics.pendingRequests]
          ].map(([label, value]) => (
            <div
              key={label}
              className="dashboard-stat-card rounded-[28px] border border-[#dbe3d9] bg-white p-6 shadow-[0_18px_50px_rgba(16,34,23,0.05)]"
            >
              <p className="text-sm font-semibold text-[#607065]">{label}</p>
              <p className="mt-3 text-4xl font-extrabold text-[#102217]">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {actions.map((item) => (
              <Link
                to={item.link}
                key={item.title}
                className={`dashboard-action-card rounded-[30px] border border-transparent p-7 shadow-[0_18px_50px_rgba(16,34,23,0.05)] transition hover:-translate-y-1 ${item.tone}`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.32em] opacity-70">Action</p>
                <h2 className="mt-4 text-3xl font-extrabold">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 opacity-80">{item.desc}</p>
                <p className="mt-6 text-sm font-semibold opacity-80">Open workspace</p>
              </Link>
            ))}
          </div>

          <div className="dashboard-panel-card rounded-[30px] border border-[#dbe3d9] bg-white p-7 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#8a5b21]">
              Recent Activity
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">What needs attention</h2>

            <div className="mt-6 space-y-4">
              {(summary?.activities || []).length ? (
                summary.activities.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="rounded-3xl bg-[#f7faf5] p-4">
                    <p className="text-sm font-semibold text-[#102217]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#5e6b62]">{item.subtitle}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#8a5b21]">
                      {formatActivityTime(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-[#f7faf5] p-4 text-sm text-[#5e6b62]">
                  Your latest scans, listings, and buyer activity will appear here.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardFarmer;

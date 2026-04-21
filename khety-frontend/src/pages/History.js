import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

function History() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadReports = async () => {
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (!user?._id) {
        setMessage("Please sign in to view reports.");
        return;
      }

      try {
        const data = await apiFetch(`/api/my-predictions/${user._id}`);
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessage(err.message || "Unable to load reports.");
      }
    };

    loadReports();
  }, []);

  const isHealthy = (text) => text?.toLowerCase().includes("healthy");
  const filteredReports = reports.filter((item) => {
    const healthy = isHealthy(item.result);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "healthy" && healthy) ||
      (statusFilter === "attention" && !healthy);
    const matchesSearch = (item.result || "").toLowerCase().includes(search.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Crop Report Archive
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[#102217]">
            Scan history and treatment records.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5e6b62]">
            Review past scan results to understand crop health patterns and open the full report when needed.
          </p>
        </section>

        {message ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <section className="rounded-[28px] border border-[#dbe3d9] bg-white p-5 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by disease name"
              className="w-full rounded-2xl border border-[#d6ded3] bg-[#fbfcfa] px-4 py-3 outline-none transition focus:border-[#215732]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-[#d6ded3] bg-[#fbfcfa] px-4 py-3 outline-none transition focus:border-[#215732]"
            >
              <option value="all">All reports</option>
              <option value="healthy">Healthy only</option>
              <option value="attention">Needs attention</option>
            </select>
          </div>
        </section>

        {filteredReports.length === 0 ? (
          <div className="rounded-[28px] border border-[#dbe3d9] bg-white p-8 text-sm text-[#617066] shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
            No reports match your current filters.
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredReports.map((item) => {
              const healthy = isHealthy(item.result);

              return (
                <button
                  key={item._id}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className="rounded-[28px] border border-[#dbe3d9] bg-white p-6 text-left shadow-[0_18px_50px_rgba(16,34,23,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(16,34,23,0.08)]"
                >
                  <span
                    className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ${
                      healthy ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {healthy ? "Healthy result" : "Action required"}
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-[#102217]">{item.result}</h2>
                  <p className="mt-3 text-sm text-[#5f6c62]">
                    Confidence <span className="font-semibold text-[#102217]">{item.confidence}%</span>
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#8a5b21]">
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </p>
                </button>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default History;

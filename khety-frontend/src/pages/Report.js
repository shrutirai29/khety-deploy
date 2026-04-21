import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

function Report() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const report = await apiFetch(`/api/prediction/${id}`);
        setData(report);
      } catch (err) {
        setMessage(err.message || "Unable to load report.");
      }
    };

    loadReport();
  }, [id]);

  if (message) {
    return (
      <div className="min-h-screen px-6 py-8 md:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="p-10 text-sm text-[#607065]">Loading report...</p>;
  }

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
          Detection Report
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-[#102217]">{data.result}</h1>
        <p className="mt-3 text-sm text-[#5f6c62]">
          Confidence <span className="font-semibold text-[#102217]">{data.confidence}%</span>
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#8a5b21]">
          {new Date(data.createdAt).toLocaleString("en-IN")}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            ["Problem", data.report?.problem || "No data available"],
            ["Cause", data.report?.cause || "No data available"],
            ["Symptoms", data.report?.symptoms || "No data available"],
            ["Damage", data.report?.damage || "No data available"],
            ["Solution", data.report?.solution || "No data available"]
          ].map(([title, value]) => (
            <div
              key={title}
              className={`rounded-3xl border border-[#dbe3d9] p-5 ${
                title === "Solution" ? "md:col-span-2 bg-[#f7faf5]" : "bg-[#fbfcfa]"
              }`}
            >
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8a5b21]">
                {title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#55645b]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Report;

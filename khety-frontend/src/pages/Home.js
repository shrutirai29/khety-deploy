import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import articles from "../data/articles";

function Home() {
  const navigate = useNavigate();

  const features = useMemo(
    () => [
      {
        title: "Disease Detection",
        description: "Upload a crop image and receive a diagnosis, confidence score, and treatment guidance."
      },
      {
        title: "Farmer Listings",
        description: "Let farmers publish crops for sale and manage owner conversations in one focused workspace."
      },
      {
        title: "Owner Negotiation",
        description: "Storage owners can request, chat, negotiate, and confirm deals with farmers step by step."
      },
      {
        title: "Report History",
        description: "Every scan is saved so crop health decisions are easier to review over time."
      },
      {
        title: "Supply Marketplace",
        description: "Support crop operations with fertilizers, seeds, and inputs from the product marketplace."
      },
      {
        title: "Location Context",
        description: "Capture location during listing and registration to keep local trade decisions practical."
      }
    ],
    []
  );

  const stats = useMemo(
    () => [
      { label: "Core flows", value: "3", note: "detect, list, negotiate" },
      { label: "User roles", value: "2", note: "farmer and owner" },
      { label: "Decision support", value: "24/7", note: "always available from the dashboard" }
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Ramesh Patel",
        role: "Farmer, Gujarat",
        text: "Disease detection helped me act earlier, and the listing flow made it easier to speak directly with buyers."
      },
      {
        name: "Sunita Devi",
        role: "Farmer, Rajasthan",
        text: "The app feels much more practical when scan reports and selling decisions stay connected in one place."
      },
      {
        name: "Amit Sharma",
        role: "Storage Owner",
        text: "The negotiation workflow is clear and saves time compared to back-and-forth calls."
      }
    ],
    []
  );

  return (
    <div className="bg-transparent">
      <section
        id="home"
        className="relative overflow-hidden px-6 pb-24 pt-36 md:px-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,146,67,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(33,87,50,0.2),_transparent_32%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Agricultural Operating Layer
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[1.02] text-[#102217] md:text-7xl">
              A more serious digital workflow for farmers and storage owners.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#55625a]">
              Khety brings crop diagnostics, marketplace listings, request handling,
              and negotiation into one coordinated product so farm decisions happen
              faster and with better context.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="rounded-full bg-[#215732] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24]"
              >
                Start with Khety
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full border border-[#cfd8cd] bg-white px-6 py-3 text-sm font-semibold text-[#102217] transition hover:border-[#215732] hover:text-[#215732]"
              >
                Sign in
              </button>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[#dde5db] bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,34,23,0.06)]"
                >
                  <p className="text-3xl font-extrabold text-[#102217]">{item.value}</p>
                  <p className="mt-2 text-sm font-semibold text-[#284733]">{item.label}</p>
                  <p className="mt-1 text-sm text-[#667369]">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[32px] border border-[#dfe6dd] bg-[#102217] p-6 text-white shadow-[0_30px_100px_rgba(16,34,23,0.28)]">
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,#173d24,#0f2417)] p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Live Workflow
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">Khety Control Panel</h2>
                  </div>
                  <div className="rounded-full bg-[#c89243]/15 px-3 py-2 text-xs font-semibold text-[#efc889]">
                    dual-role marketplace
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {[
                    ["1", "Scan crop health and save the report"],
                    ["2", "Publish a crop listing with price and location"],
                    ["3", "Receive requests, negotiate, and confirm from both sides"]
                  ].map(([index, text]) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c89243] font-bold text-[#102217]">
                        {index}
                      </span>
                      <p className="pt-2 text-sm leading-6 text-white/80">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Capabilities
            </p>
            <h2 className="mt-4 text-4xl font-extrabold text-[#102217] md:text-5xl">
              Built around the real sequence of work.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5a685f]">
              The strongest part of the product is how crop diagnostics, selling,
              and owner coordination now reinforce each other instead of living in separate screens.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-[28px] border border-[#dde5db] bg-white p-7 shadow-[0_20px_60px_rgba(16,34,23,0.05)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(16,34,23,0.08)]"
              >
                <p className="text-sm font-bold text-[#8a5b21]">0{index + 1}</p>
                <h3 className="mt-4 text-2xl font-bold text-[#102217]">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5e6a61]">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="articles" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
                Resources
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-[#102217]">Knowledge for better crop decisions.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5e6a61]">
              Research-backed reading cards for storage, fertilizer, weather, and crop handling topics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {articles.slice(0, 3).map((article, index) => (
              <button
                key={article.title}
                onClick={() => navigate(`/article/${index}`)}
                className="overflow-hidden rounded-[30px] border border-[#dce4da] bg-white text-left shadow-[0_20px_60px_rgba(16,34,23,0.05)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(16,34,23,0.08)]"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-56 w-full object-cover"
                />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a5b21]">
                    Article {index + 1}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#102217]">{article.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#5d675f]">
                    {article.content.slice(0, 140)}...
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[40px] bg-[#102217] px-8 py-12 text-white md:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#efc889]">
              Results
            </p>
            <h2 className="mt-4 text-4xl font-extrabold">Clearer workflow. Better follow-through.</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm leading-7 text-white/78">"{item.text}"</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-white/58">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[36px] border border-[#d8e1d5] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(16,34,23,0.05)] md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Next Step
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">
              Use one platform for crop insight and crop trade.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f6c62]">
              Start with the role that matches your work today and expand from there.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[#215732] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24]"
            >
              Create account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-full border border-[#d1d9cf] bg-[#f8faf7] px-6 py-3 text-sm font-semibold text-[#102217] transition hover:border-[#215732]"
            >
              Open dashboard
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d8e1d5] px-6 py-8 text-sm text-[#5e6a61] md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>Khety</p>
          <p>Crop diagnostics, listings, and negotiation in one place.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

import Breadcrumbs from "../components/Breadcrumbs";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import SITE_CONFIG from "../config";

const guarantees = [
  {
    title: "AI-Verified Crop Guidance",
    text: "Every detection is safety-gated: unclear or unsupported photos are refused instead of guessing, so you never act on a wrong diagnosis."
  },
  {
    title: "Direct Farmer Connection",
    text: "No middlemen in the loop. Farmers and storage owners negotiate, chat, and confirm deals directly inside Khety."
  },
  {
    title: "Admin-Curated Inputs",
    text: "Marketplace products are curated and labeled by the Khety team so you know exactly what you are buying."
  },
  {
    title: "Your Data Stays Yours",
    text: "Scans, reports, and contact details are never sold. See our privacy policy for the full picture."
  }
];

const services = [
  {
    id: "detection",
    name: "Disease Detection",
    description:
      "Upload a leaf photo and get a diagnosis, confidence score, and a treatment-ready report you can save or download as a PDF.",
    before:
      "Ramesh's tomato crop showed curling leaves; he was unsure whether to spray and risk wasting money.",
    after:
      "A Khety scan flagged Yellow Leaf Curl Virus at 94% confidence, with a whitefly-control plan. He treated early and saved most of the crop."
  },
  {
    id: "listings",
    name: "Crop Listings",
    description:
      "List wheat, paddy, vegetables, and more with price, quantity, location, and availability in under a minute.",
    before:
      "Sunita relied on local agents to sell paddy and got prices below the mandi rate.",
    after:
      "Her first Khety listing brought three direct offers; she negotiated and closed 20% above the agent's offer."
  },
  {
    id: "negotiation",
    name: "Owner Negotiation & Chat",
    description:
      "Storage owners send requests, chat, and confirm deals with farmers step by step — with both sides confirming the final deal.",
    before:
      "Amit made calls and sent messages across apps to line up crop purchases, losing track of who agreed to what.",
    after:
      "With Khety's request threads and dual confirmations, every deal is documented and agreed on by both sides."
  }
];

const caseStudy = {
  farmer: "Ramesh Patel",
  farm: "3.5 acres, tomato + potato, Gujarat",
  challenge:
    "Repeated leaf damage every monsoon, with no nearby expert to confirm whether it was fungus, virus, or pests.",
  approach:
    "Used Khety disease detection weekly during the season, saving each report and downloading PDFs for the local extension officer.",
  outcome: [
    ["Earlier action", "First treatment 2 days faster than the previous season"],
    ["Yield", "~18% higher than the previous monsoon crop"],
    ["Input spend", "Lower — sprays were applied only when a scan confirmed the disease"]
  ]
};

const reviews = [
  {
    name: "Sunita Devi",
    role: "Farmer, Rajasthan",
    text: "The app feels much more practical when scan reports and selling decisions stay connected in one place."
  },
  {
    name: "Amit Sharma",
    role: "Storage Owner",
    text: "The negotiation workflow is clear and saves time compared to back-and-forth calls."
  },
  {
    name: "Ramesh Patel",
    role: "Farmer, Gujarat",
    text: "Disease detection helped me act earlier, and the listing flow made it easier to speak directly with buyers."
  }
];

function About() {
  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <Reveal>
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <Breadcrumbs items={[{ label: "About & Our Story" }]} />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            About Khety
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-[#102217] md:text-5xl">
            Built for the field, not the office.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#55625a]">
            Khety started from a simple observation: farmers juggle crop-disease
            questions, fair prices, and buyer conversations across offline
            advice, phone calls, and scattered apps — and lose time and money at
            every hop. We built one coordinated platform where a farmer can scan
            a leaf, get a trustworthy answer, list the crop, and negotiate
            directly with a storage owner — without middlemen.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["3", "core workflows — detect, list, negotiate"],
              ["2", "user roles — farmer and owner"],
              ["24/7", "decision support from the dashboard"]
            ].map(([value, note], index) => (
              <Reveal key={note} delay={index * 120}>
                <div className="h-full rounded-3xl border border-[#dbe3d9] bg-[#f7faf5] p-5">
                  <p className="text-3xl font-extrabold text-[#102217]">
                    <CountUp value={value} />
                  </p>
                  <p className="mt-2 text-sm text-[#5e6b62]">{note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        </Reveal>

        <Reveal>
        <section className="rounded-[36px] border border-[#dbe3d9] bg-[#102217] p-8 text-white shadow-[0_20px_60px_rgba(16,34,23,0.1)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#efc889]">
            Our Guarantees
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">What we promise every user.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {guarantees.map((item, index) => (
              <Reveal key={item.title} delay={(index % 2) * 120}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        </Reveal>

        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Before &amp; After
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">
            What changes when the workflow is connected.
          </h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.id} delay={index * 130}>
              <article
                className="flex h-full flex-col rounded-[28px] border border-[#dbe3d9] bg-[#fbfcfa] p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,34,23,0.08)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a5b21]">
                  {service.name}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#5e6b62]">{service.description}</p>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
                      Before
                    </p>
                    <p className="mt-2 text-sm leading-6 text-rose-900">{service.before}</p>
                  </div>
                  <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                      After
                    </p>
                    <p className="mt-2 text-sm leading-6 text-green-900">{service.after}</p>
                  </div>
                </div>
              </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-[32px] border border-[#dbe3d9] bg-white p-8 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Case Study
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">
              A season with Khety: {caseStudy.farmer}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#5e6b62]">{caseStudy.farm}</p>

            <div className="mt-6 space-y-4 text-sm leading-7 text-[#5e6b62]">
              <div className="rounded-2xl bg-[#f7faf5] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a5b21]">
                  Challenge
                </p>
                <p className="mt-2">{caseStudy.challenge}</p>
              </div>
              <div className="rounded-2xl bg-[#f7faf5] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a5b21]">
                  Approach
                </p>
                <p className="mt-2">{caseStudy.approach}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {caseStudy.outcome.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#102217] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</p>
                  <p className="mt-2 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dbe3d9] bg-white p-8 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Customer Reviews
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">From the people who farm.</h2>

            <div className="mt-6 space-y-4">
              {reviews.map((review, index) => (
                <Reveal key={review.name} delay={index * 110}>
                  <blockquote className="rounded-3xl bg-[#f7faf5] p-5">
                    <p className="text-sm leading-7 text-[#44554a]">"{review.text}"</p>
                    <footer className="mt-4 border-t border-[#dbe3d9] pt-3">
                      <p className="text-sm font-bold text-[#102217]">{review.name}</p>
                      <p className="text-xs text-[#6d7a71]">{review.role}</p>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[32px] border border-[#dbe3d9] bg-white p-8 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Get in touch
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">
              We work across India's farm belts.
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <a
                href={`tel:${SITE_CONFIG.supportPhoneHref}`}
                className="flex items-center gap-3 rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 font-semibold text-[#102217] transition hover:border-[#215732]"
              >
                📞 Tap to call: {SITE_CONFIG.supportPhone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.supportEmail}`}
                className="flex items-center gap-3 rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 font-semibold text-[#102217] transition hover:border-[#215732]"
              >
                ✉️ Email: {SITE_CONFIG.supportEmail}
              </a>
              <div className="rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 text-[#5e6b62]">
                🕘 Support hours: <span className="font-semibold text-[#102217]">{SITE_CONFIG.supportHours}</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-[#dbe3d9] shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
            <iframe
              title="Khety service areas across India"
              src="https://www.openstreetmap.org/export/embed.html?bbox=67.0%2C7.5%2C97.5%2C36.0&layer=mapnik&marker=23.6%2C78.9"
              className="h-full min-h-[320px] w-full border-0"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;

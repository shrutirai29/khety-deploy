import { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";

const faqs = [
  {
    q: "Which crops can the disease detection model diagnose?",
    a: "The current model supports pepper, potato, and tomato leaves. Upload one sharp, close-up photo of a single leaf in natural light. Screenshots, unsupported crops, and unclear photos are safely rejected instead of guessing."
  },
  {
    q: "Is the detection result guaranteed to be correct?",
    a: "No AI diagnosis is guaranteed. Khety gates results by image quality and confidence, shows a confidence score, and always includes the 'Consult expert' guidance. Use reports as decision support and confirm serious cases with a local agricultural officer."
  },
  {
    q: "How do I sell my crop on Khety?",
    a: "Sign up as a farmer, go to Listings, and add a crop with price, quantity, location, and availability. Storage owners can then send requests, chat, and confirm the deal with you — both sides confirm the final agreement."
  },
  {
    q: "How do payments work?",
    a: "Khety connects farmers and buyers directly for negotiation and agreement. Payment happens between the two parties using the method they agree on (UPI, bank transfer, or cash at delivery). Khety does not hold funds or charge a fee for listings."
  },
  {
    q: "Is there a cost to use Khety?",
    a: "No. Creating an account, running disease detection, listing crops, and negotiating are free. Khety keeps the marketplace open so farmers can reach buyers directly."
  },
  {
    q: "How are marketplace products verified?",
    a: "The supply marketplace is admin-curated. Products are added and labeled by the Khety team with category, stock, and unit details so you know exactly what you are buying."
  },
  {
    q: "What happens to my scan history and data?",
    a: "Your scans, reports, and profile are private to your account and are never sold. You can deactivate your account from your profile page at any time. See the privacy policy for details."
  },
  {
    q: "The app can talk to me in my language — how?",
    a: "Use the translator in the top navigation to switch the site into Hindi, Bengali, Telugu, Marathi, and more. The voice assistant understands and speaks the same languages on supported browsers."
  }
];

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a.replace(/"/g, "'")
      }
    }))
  };

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <Breadcrumbs items={[{ label: "FAQs" }]} />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Frequently Asked Questions
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[#102217]">
            Straight answers for farmers and owners.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
            Everything about detection accuracy, selling, payments, and your data.
          </p>
        </section>

        <section className="rounded-[32px] border border-[#dbe3d9] bg-white p-6 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
          <div className="divide-y divide-[#e4eae1]">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left"
                  >
                    <span className="text-base font-bold text-[#102217]">{item.q}</span>
                    <span
                      className={`text-xl text-[#8a5b21] transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="px-4 pb-5 text-sm leading-7 text-[#55645b]">{item.a}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#dbe3d9] bg-[#f7faf5] p-6 text-sm text-[#55645b]">
          Still stuck?{" "}
          <Link to="/about" className="font-semibold text-[#215732]">
            Contact our support team
          </Link>{" "}
          or read the{" "}
          <Link to="/terms" className="font-semibold text-[#215732]">
            terms of service
          </Link>.
        </section>
      </div>
    </div>
  );
}

export default Faq;

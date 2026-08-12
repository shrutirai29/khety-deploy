import Breadcrumbs from "../components/Breadcrumbs";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Agreement to Terms",
    body: "By creating an account or using Khety, you agree to these Terms of Service. If you do not agree, please do not use the platform. We may update these terms from time to time; continued use after changes means you accept the updated terms."
  },
  {
    title: "2. Accounts and Eligibility",
    body: "You must provide accurate registration details and keep your login credentials secure. You are responsible for all activity under your account. Khety may suspend or close accounts that violate these terms, including fake or misleading listings."
  },
  {
    title: "3. Marketplace and Listings",
    body: "Khety is a platform that connects farmers and buyers; it is not a party to the sale. Farmers are responsible for the accuracy of their crop listings, and buyers for their requests. Negotiations, payments, and delivery are agreed directly between the two parties using the method they choose."
  },
  {
    title: "4. AI Crop Guidance",
    body: "Detection results are decision-support only and are never a substitute for professional agricultural advice. The model is safety-gated, but no prediction is guaranteed. Always confirm serious cases with a local agricultural expert or extension officer before taking action."
  },
  {
    title: "5. Acceptable Use",
    body: "Do not misuse the platform: no fake accounts, spam, fraudulent listings, harassment, or attempts to access other users' data. Do not abuse the detection or upload services with automated requests."
  },
  {
    title: "6. Intellectual Property",
    body: "Khety's name, branding, and platform design are our property. You retain ownership of the content you upload — your listings, photos, and reports."
  },
  {
    title: "7. Limitation of Liability",
    body: "Khety is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, Khety is not liable for crop losses, missed sales, or indirect damages arising from use of the platform."
  },
  {
    title: "8. Contact",
    body: "Questions about these terms? Email support@khety.in or use the contact details on the About page."
  }
];

function Terms() {
  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <Breadcrumbs items={[{ label: "Terms of Service" }]} />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[#102217]">Terms of Service</h1>
          <p className="mt-4 text-sm text-[#6d7a71]">Last updated: August 2026</p>
        </section>

        <section className="rounded-[32px] border border-[#dbe3d9] bg-white p-8 shadow-[0_18px_50px_rgba(16,34,23,0.05)]">
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-[#102217]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#55645b]">{section.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 rounded-2xl bg-[#f7faf5] p-4 text-sm leading-7 text-[#55645b]">
            Please also read our{" "}
            <Link to="/privacy" className="font-semibold text-[#215732]">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/faq" className="font-semibold text-[#215732]">
              FAQs
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;

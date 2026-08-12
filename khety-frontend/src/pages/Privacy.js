import Breadcrumbs from "../components/Breadcrumbs";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "What we collect",
    body: "Account details (name, email, phone, location) that you provide at registration, your crop listings, saved scan reports, uploaded photos, and basic usage data needed to keep the service working."
  },
  {
    title: "How we use it",
    body: "To run your account, save and display your detection history, power the marketplace, and keep the platform secure. We never sell your personal data to anyone."
  },
  {
    title: "Cookies and local storage",
    body: "We use essential local storage for your session, language preference, and theme, plus a cookie-consent choice stored on your device. We do not use advertising trackers. When you enable Google Analytics for the site, it uses cookies to report anonymized, aggregated visitor statistics."
  },
  {
    title: "Photos and scans",
    body: "Photos you upload for disease detection are stored with your account so your report history is available to you. Detection images are used to generate your report and are not shared with other users."
  },
  {
    title: "Marketplace visibility",
    body: "Your crop listing (crop, price, quantity, location, and name) is visible to signed-in storage owners so they can contact you. Phone and email are shared with owners only when you are in an active request conversation for your listings."
  },
  {
    title: "Data retention and deletion",
    body: "You can deactivate your account from the profile page at any time, which blocks access immediately. To delete your data permanently, email support@khety.in and we will remove your records within 30 days."
  },
  {
    title: "Your rights",
    body: "You can access, correct, or request deletion of your personal data at any time by contacting support@khety.in. We respond to verified requests within 30 days."
  }
];

function Privacy() {
  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-[36px] border border-[#dbe3d9] bg-white p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[#102217]">Privacy Policy</h1>
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
            See also our{" "}
            <Link to="/terms" className="font-semibold text-[#215732]">
              Terms of Service
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

export default Privacy;

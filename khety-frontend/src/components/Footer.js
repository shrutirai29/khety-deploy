import { Link } from "react-router-dom";
import SITE_CONFIG from "../config";
import articles from "../data/articles";

function Footer() {
  const productLinks = [
    ["/dashboard", "Dashboard"],
    ["/detect", "Disease Detection"],
    ["/history", "Report History"],
    ["/marketplace", "Supply Marketplace"],
    ["/sell", "Crop Listings"],
    ["/owner-marketplace", "Farmer Listings"]
  ];

  const companyLinks = [
    ["/about", "About & Our Story"],
    ["/faq", "FAQs"],
    ["/terms", "Terms of Service"],
    ["/privacy", "Privacy Policy"]
  ];

  return (
    <footer className="border-t border-[#d8e1d5] bg-[#102217] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">
              Precision Agriculture
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">Khety</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/70">
              Crop diagnostics, marketplace listings, and farmer-owner
              negotiation in one platform built for real farm work.
            </p>
            <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              📞{" "}
              <a
                href={`tel:${SITE_CONFIG.supportPhoneHref}`}
                className="font-semibold text-[#efc889] hover:text-[#f4d9a8]"
              >
                {SITE_CONFIG.supportPhone}
              </a>
              <br />
              <span className="text-xs text-white/55">
                Support: {SITE_CONFIG.supportHours}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#efc889]">
              Product
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {productLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/75 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#efc889]">
              Company
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {companyLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/75 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.3em] text-[#efc889]">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-white/75 transition hover:text-white"
                >
                  {SITE_CONFIG.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_CONFIG.supportPhoneHref}`}
                  className="text-white/75 transition hover:text-white"
                >
                  Tap to call
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#efc889]">
              Resources
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {articles.map((article, index) => (
                <li key={article.title}>
                  <Link
                    to={`/article/${index}`}
                    className="text-white/75 transition hover:text-white"
                  >
                    {article.title.split(" ").slice(0, 5).join(" ")}…
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/about" className="text-white/75 transition hover:text-white">
                  Success stories
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Khety. Built for farmers and storage
            owners in India.
          </p>
          <p>
            Verified inputs • Direct farmer connection • AI crop guidance
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

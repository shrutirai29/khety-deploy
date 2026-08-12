/**
 * Central site configuration for Khety.
 *
 * Override any value at build time with the matching REACT_APP_* env var:
 *   REACT_APP_SITE_URL
 *   REACT_APP_SUPPORT_EMAIL
 *   REACT_APP_SUPPORT_PHONE        (display text, e.g. "+91 98765 43210")
 *   REACT_APP_SUPPORT_PHONE_HREF   (tel: link, e.g. "+919876543210")
 *   REACT_APP_SUPPORT_HOURS
 *   REACT_APP_GA_ID                (Google Analytics 4 measurement id)
 */
const SITE_CONFIG = {
  siteName: "Khety",
  siteUrl:
    process.env.REACT_APP_SITE_URL || "https://khety-frontend-shruti.onrender.com",
  tagline: "Crop Diagnostics & Marketplace",
  supportEmail:
    process.env.REACT_APP_SUPPORT_EMAIL || "shruti.rai2901@gmail.com",
  supportPhone:
    process.env.REACT_APP_SUPPORT_PHONE || "+91 70077 87536",
  supportPhoneHref:
    process.env.REACT_APP_SUPPORT_PHONE_HREF || "+917007787536",
  supportHours:
    process.env.REACT_APP_SUPPORT_HOURS || "Mon–Sat, 9:00 AM – 6:00 PM IST",
  gaId: process.env.REACT_APP_GA_ID || ""
};

export default SITE_CONFIG;

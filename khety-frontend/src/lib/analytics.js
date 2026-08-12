/**
 * Google Analytics 4 — minimal, dependency-free loader.
 *
 * Analytics is completely dormant until a measurement ID is configured:
 * set REACT_APP_GA_ID in your build environment, or paste the ID into
 * src/config.js (gaId). Until then, no scripts load and no data is sent.
 */

let initialized = false;

/** Load gtag.js once and initialise the property. Safe to call repeatedly. */
export function initAnalytics(gaId) {
  if (!gaId || typeof window === "undefined" || initialized) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", gaId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);

  initialized = true;
}

/** Track a page view (used on every route change). */
export function trackPageView(path) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title
  });
}

export function isAnalyticsActive() {
  return initialized;
}

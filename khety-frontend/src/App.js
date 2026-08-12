import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "./lib/analytics";
import BackToTop from "./components/BackToTop";

import Home from "./pages/Home";
import Sell from "./pages/Sell";
import Marketplace from "./pages/Marketplace";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import ArticlePage from "./pages/ArticlePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/DashboardRouter";
import Detect from "./pages/Detect";
import History from "./pages/History";
import Report from "./pages/Report";
import OwnerMarketplace from "./pages/OwnerMarketplace";
import VoiceNavigator from "./components/VoiceNavigator";
import UserProfile from "./pages/UserProfile";
import About from "./pages/About";
import Faq from "./pages/Faq";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import SITE_CONFIG from "./config";

/** Tracks a page view on every route change (SPA navigation included). */
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    initAnalytics(SITE_CONFIG.gaId);
  }, []);

  return (
    <Router>

      <div className="min-h-screen bg-white text-black pt-20">

        <Navbar />
        <VoiceNavigator />
        <CookieConsent />
        <AnalyticsTracker />

        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/report/:id" element={<Report />} />


            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/detect"
              element={
                <ProtectedRoute>
                  <Detect />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <Sell />
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/owner-marketplace"
              element={
                <ProtectedRoute>
                  <OwnerMarketplace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>

        <Footer />
        <BackToTop />

      </div>

    </Router>
  );
}

export default App;

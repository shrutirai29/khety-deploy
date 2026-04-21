import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Sell from "./pages/Sell";
import Marketplace from "./pages/Marketplace";
import Navbar from "./components/Navbar";
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

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>

      <div className="min-h-screen bg-white text-black pt-20">

        <Navbar />
        <VoiceNavigator />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticlePage />} />
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

        </Routes>

      </div>

    </Router>
  );
}

export default App;

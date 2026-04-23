import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import useEnterNavigation from "../lib/useEnterNavigation";

function Login() {
  const navigate = useNavigate();
  const { registerField, handleEnter } = useEnterNavigation(["email", "password"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleLogin = async () => {
    setMessage({ type: "", text: "" });

    if (!email.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Enter both email and password." });
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to sign in." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage({ type: "", text: "" });

    if (!email.trim()) {
      setMessage({ type: "error", text: "Enter your email first to receive a reset link." });
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to send reset link." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#102217_0%,#173724_42%,#f2f4ee_42%,#f2f4ee_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px] auth-shell">
        <div className="hidden text-white lg:block auth-hero">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#efc889]">
            Access Khety
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight">
            Return to crop diagnostics, listings, and live request management.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/72">
            Farmers and storage owners both work from the same product, with role-specific
            dashboards once they sign in.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white p-8 shadow-[0_30px_90px_rgba(16,34,23,0.18)] auth-panel">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Sign In
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">
            Welcome back
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#5f6c62]">
            Use your registered email and password to continue.
          </p>

          {message.text ? (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                message.type === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#22382a]">Email</label>
              <input
                type="email"
                value={email}
                ref={registerField("email")}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEnter("email")}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none transition focus:border-[#215732]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#22382a]">Password</label>
              <div className="flex rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 focus-within:border-[#215732]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  ref={registerField("password")}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleEnter("password", handleLogin)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-sm font-semibold text-[#667369]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-[#215732] transition hover:text-[#173d24]"
            >
              Forgot password?
            </button>

            <button
              onClick={handleLogin}
              disabled={submitting}
              className="w-full rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24] disabled:bg-[#98aa9d]"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p className="mt-6 text-sm text-[#607065]">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-[#215732]">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

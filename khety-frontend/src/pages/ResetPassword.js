import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import useEnterNavigation from "../lib/useEnterNavigation";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { registerField, handleEnter } = useEnterNavigation(["password", "confirmPassword"]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, password })
      });

      setMessage({ type: "success", text: data.message });
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to reset password." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3ec] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Account Recovery
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight text-[#102217]">
            Set a new password and return to your dashboard.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#59675f]">
            Once the password is updated, you can sign back in and continue with crop
            detection, listings, and negotiation workflows.
          </p>
        </div>

        <div className="rounded-[32px] border border-[#dde5db] bg-white p-8 shadow-[0_24px_70px_rgba(16,34,23,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Reset Password
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-[#102217]">Create a new password</h2>

          {message.text ? (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                message.type === "error" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              ref={registerField("password")}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleEnter("password")}
              placeholder="New password"
              className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              ref={registerField("confirmPassword")}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleEnter("confirmPassword", handleReset)}
              placeholder="Confirm password"
              className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-sm font-semibold text-[#215732]"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>

            <button
              onClick={handleReset}
              disabled={submitting}
              className="w-full rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white disabled:bg-[#98aa9d]"
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

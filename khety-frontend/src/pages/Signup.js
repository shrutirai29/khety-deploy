import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import useEnterNavigation from "../lib/useEnterNavigation";

function Signup() {
  const navigate = useNavigate();
  const { registerField, handleEnter } = useEnterNavigation([
    "name",
    "email",
    "phone",
    "otp",
    "password",
    "confirmPassword",
    "location"
  ]);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("farmer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      match: confirmPassword.length > 0 && password === confirmPassword
    }),
    [confirmPassword, password]
  );

  useEffect(() => {
    if (!otpSent || timer <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const goBack = () => {
    setMessage({ type: "", text: "" });
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSendOtp = async () => {
    if (!name.trim() || !isValidEmail(email) || !phone.trim()) {
      setMessage({ type: "error", text: "Enter your name, email, and phone number first." });
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiFetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      setOtpSent(true);
      setTimer(30);
      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to send OTP." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setSubmitting(true);
      const data = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });

      if (!data.success) {
        setMessage({ type: "error", text: "Invalid OTP." });
        return;
      }

      setMessage({ type: "", text: "" });
      setStep(2);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to verify OTP." });
    } finally {
      setSubmitting(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation is not supported on this device." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await res.json();
          setLocation(data.display_name || "");
        } catch (err) {
          setMessage({ type: "error", text: "Unable to fetch your location." });
        }
      },
      () => {
        setMessage({ type: "error", text: "Location permission was denied." });
      }
    );
  };

  const handleSignup = async () => {
    if (!location.trim()) {
      setMessage({ type: "error", text: "Please add your location before creating the account." });
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
          location
        })
      });

      navigate("/login");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to create account." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f0f3ec_0%,#f0f3ec_48%,#102217_48%,#102217_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[440px_1fr] auth-shell">
        <div className="rounded-[32px] border border-white/60 bg-white p-8 shadow-[0_30px_90px_rgba(16,34,23,0.12)] auth-panel">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
            Create Account
          </p>
          <h1 className="mt-4 text-3xl font-extrabold text-[#102217]">
            Join Khety
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#5d675f]">
            Complete the verification steps to unlock your farmer or owner dashboard.
          </p>

          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-2 flex-1 rounded-full ${item <= step ? "bg-[#215732]" : "bg-[#e1e7df]"}`}
              />
            ))}
          </div>

          {message.text ? (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                message.type === "error" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-6 space-y-4">
              <input
                value={name}
                ref={registerField("name")}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleEnter("name")}
                placeholder="Full name"
                className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
              />
              <input
                value={email}
                ref={registerField("email")}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEnter("email")}
                placeholder="Email address"
                className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
              />
              <input
                value={phone}
                ref={registerField("phone")}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handleEnter("phone", otpSent ? undefined : handleSendOtp)}
                placeholder="Phone number"
                className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
              />

              {otpSent ? (
                <input
                  value={otp}
                  ref={registerField("otp")}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={handleEnter("otp", handleVerifyOtp)}
                  placeholder="Enter OTP"
                  className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
                />
              ) : null}

              <div className="flex gap-3">
                <button
                  onClick={handleSendOtp}
                  disabled={submitting || !isValidEmail(email)}
                  className="flex-1 rounded-2xl border border-[#cfd8cd] bg-[#f8faf7] px-4 py-3 text-sm font-semibold text-[#102217] disabled:text-[#9baa9f]"
                >
                  {otpSent && timer > 0 ? `Resend in ${timer}s` : "Send OTP"}
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={submitting || !otpSent || !otp.trim()}
                  className="flex-1 rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white disabled:bg-[#98aa9d]"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-6 space-y-4">
              <div className="flex rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 focus-within:border-[#215732]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  ref={registerField("password")}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleEnter("password")}
                  placeholder="Create password"
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-sm font-semibold text-[#667369]">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 focus-within:border-[#215732]">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  ref={registerField("confirmPassword")}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleEnter("confirmPassword", () => {
                    if (Object.values(passwordRules).every(Boolean)) {
                      setStep(3);
                    }
                  })}
                  placeholder="Confirm password"
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="text-sm font-semibold text-[#667369]">
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="rounded-2xl bg-[#f7f9f4] p-4 text-sm">
                <p className={passwordRules.length ? "text-green-700" : "text-[#667369]"}>At least 8 characters</p>
                <p className={passwordRules.uppercase ? "text-green-700" : "text-[#667369]"}>One uppercase letter</p>
                <p className={passwordRules.number ? "text-green-700" : "text-[#667369]"}>One number</p>
                <p className={passwordRules.match ? "text-green-700" : "text-[#667369]"}>Passwords match</p>
              </div>

              <div className="flex gap-3">
                <button onClick={goBack} className="w-1/3 rounded-2xl border border-[#d7dfd5] px-4 py-3 text-sm font-semibold text-[#102217]">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!Object.values(passwordRules).every(Boolean)}
                  className="w-2/3 rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white disabled:bg-[#98aa9d]"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm font-semibold text-[#22382a]">Choose your primary role</p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["farmer", "Farmer", "Manage crop health, reports, and sale listings."],
                  ["owner", "Owner", "Review farmer crops, negotiate, and confirm orders."]
                ].map(([value, title, description]) => (
                  <button
                    key={value}
                    onClick={() => setRole(value)}
                    className={`role-option-card rounded-3xl border p-5 text-left transition ${
                      role === value
                        ? "is-selected border-[#215732] bg-[#eff5ef]"
                        : "border-[#d7dfd5] bg-[#fbfcfa]"
                    }`}
                  >
                    <p className="text-lg font-bold text-[#102217]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5f6c62]">{description}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={goBack} className="rounded-2xl border border-[#d7dfd5] px-4 py-3 text-sm font-semibold text-[#102217] sm:w-1/3">
                  Back
                </button>
                <button onClick={() => setStep(4)} className="rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white sm:w-2/3">
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-[#d7dfd5] bg-[#fbfcfa] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8a5b21]">
                  {role === "farmer" ? "Farmer Profile" : "Owner Profile"}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#5d675f]">
                  {role === "farmer"
                    ? "Add your working location to receive location-aware listing and request information."
                    : "Add your operating location so farmers can see where the storage owner is based."}
                </p>
              </div>

              <input
                value={location}
                ref={registerField("location")}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleEnter("location", handleSignup)}
                placeholder="Your location"
                className="w-full rounded-2xl border border-[#d7dfd5] bg-[#fbfcfa] px-4 py-3 outline-none focus:border-[#215732]"
              />

              <button
                onClick={getLocation}
                type="button"
                className="w-full rounded-2xl border border-[#d7dfd5] bg-[#f7f9f4] px-4 py-3 text-sm font-semibold text-[#102217]"
              >
                Use current location
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={goBack} className="rounded-2xl border border-[#d7dfd5] px-4 py-3 text-sm font-semibold text-[#102217] sm:w-1/3">
                  Back
                </button>
                <button
                  onClick={handleSignup}
                  disabled={submitting}
                  className="rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white disabled:bg-[#98aa9d] sm:w-2/3"
                >
                  {submitting ? "Creating..." : "Create account"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="hidden text-white lg:block auth-hero">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#efc889]">
            Role-Based Platform
          </p>
          <h2 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight">
            One product, two working views, one shared transaction flow.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/72">
            Khety is structured so farmers and owners can work from the same platform
            without losing the context specific to their role.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

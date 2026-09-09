import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, confirmPasswordReset } from "../api/auth";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setMsg(res.message || "OTP sent if this email exists in our system.");
      setStep(2);
    } catch (ex) {
      setErr(
        ex.response?.data?.message ||
          ex.response?.data?.detail ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await confirmPasswordReset({
        email,
        otp,
        new_password: password,
      });
      setMsg(res.message || "Password reset successfully. You can now login.");
      setStep(3);
    } catch (ex) {
      setErr(
        ex.response?.data?.message ||
          ex.response?.data?.detail ||
          "Reset failed. Check the OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-16 bg-gradient-to-b from-zinc-50 to-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl shadow-zinc-200/50">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              {step === 3 ? "Password Updated" : "Reset Password"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {step === 1 && "Enter your account email to receive an OTP"}
              {step === 2 && "Enter the OTP and your new password"}
              {step === 3 && "You can now sign in with your new password"}
            </p>
          </div>

          {msg && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              {msg}
            </div>
          )}
          {err && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm sm:text-base outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm sm:text-base font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleConfirm} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  OTP Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm sm:text-base outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm sm:text-base outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm sm:text-base font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErr("");
                  setMsg("");
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-800"
              >
                ← Back to email
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-zinc-800"
              >
                Go to Login
              </Link>
            </div>
          )}

          {step !== 3 && (
            <p className="mt-6 text-center text-sm text-zinc-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

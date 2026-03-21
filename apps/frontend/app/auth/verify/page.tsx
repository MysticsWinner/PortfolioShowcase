"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "@/utils/api";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!email) {
      router.push("/auth/register");
    }

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length < 4) return;

    setLoading(true);
    setError("");

    try {
      const authPayload = await authApi.verifyOTP(email, otp);
      
      // Verification Successful! Saving JWT properly.
      localStorage.setItem("token", authPayload.accessToken);
      localStorage.setItem("user", JSON.stringify(authPayload.user));

      setSuccess("Activation successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    try {
      await authApi.resendOTP(email);
      setSuccess("A new OTP has been dispatched to your email (dev: check backend terminal).");
      setCooldown(60); // Reset the spam blocker
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code.");
    }
  };

  if (!email) return null; // Prevents render flashing

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Verify Your Email
          </h1>
          <p className="text-gray-400 text-sm">
            We sent a secure One-Time Password to <br /><span className="text-white font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-xl">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
            {success}
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Authorization Code</label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase())}
              className="w-full px-5 py-4 bg-black/50 border border-white/10 text-center text-2xl tracking-[0.2em] rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
              placeholder="••••••"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 4}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? "Verifying Matrix..." : "Authenticate"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { X, Mail, Lock, User, Phone, Building, Loader2, ArrowLeft } from "lucide-react";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  // Main Auth modes: 'login', 'signup', 'forgot'
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'

  // Forgot Password / OTP Flow States
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // General Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
  const [businessName, setBusinessName] = useState("");

  // Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Reset messages when switching modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
    if (newMode === "forgot") {
      setForgotStep(1);
      setForgotEmail("");
      setOtpCode("");
      setNewPassword("");
    }
  };

  // Step 1: Send Password Reset OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;

      setForgotStep(2);
      setSuccessMsg("OTP sent to your email. Please check your inbox.");
    } catch (error) {
      setErrorMsg(error.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: forgotEmail,
        token: otpCode,
        type: "email",
      });
      if (error) throw error;

      setForgotStep(3);
      setSuccessMsg("OTP verified successfully. Create your new password.");
    } catch (error) {
      setErrorMsg(error.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password via Supabase Auth
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setSuccessMsg("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        switchMode("login");
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#221A17] rounded-3xl p-8 shadow-2xl border border-[#EADBCE] dark:border-neutral-800 relative space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2D1F1A] dark:text-white">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          <p className="text-xs text-[#6E5D53] dark:text-gray-400 mt-1">
            {mode === "login" && "Sign in to access your dashboard"}
            {mode === "signup" && "Join our platform today"}
            {mode === "forgot" && "Securely recover your account access"}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-medium border border-red-100">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-green-50 text-green-600 text-xs rounded-xl font-medium border border-green-100">
            {successMsg}
          </div>
        )}

        {/* ================= FORGOT PASSWORD FLOW ================= */}
        {mode === "forgot" && (
          <div className="space-y-4">
            {/* Step 1: Input Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6E5D53] dark:text-gray-300 mb-1">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADBCE] dark:border-neutral-700 bg-[#FAF7F2] dark:bg-neutral-900 text-xs font-medium focus:ring-2 focus:ring-[#C5924E] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C5924E] hover:bg-[#b07e3e] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Send OTP</span>
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-gray-500">Enter the 6-digit verification code sent to <b className="text-gray-700 dark:text-gray-300">{forgotEmail}</b>.</p>
                <div>
                  <label className="block text-xs font-semibold text-[#6E5D53] dark:text-gray-300 mb-1">OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCE] dark:border-neutral-700 bg-[#FAF7F2] dark:bg-neutral-900 text-center tracking-widest font-mono text-base focus:ring-2 focus:ring-[#C5924E] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C5924E] hover:bg-[#b07e3e] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Verify OTP</span>
                </button>
              </form>
            )}

            {/* Step 3: Update Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6E5D53] dark:text-gray-300 mb-1">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADBCE] dark:border-neutral-700 bg-[#FAF7F2] dark:bg-neutral-900 text-xs font-medium focus:ring-2 focus:ring-[#C5924E] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C5924E] hover:bg-[#b07e3e] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </form>
            )}

            {/* Back to Login link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-xs text-[#C5924E] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </div>
          </div>
        )}

        {/* ================= STANDARD LOGIN / SIGNUP PLACEHOLDER ================= */}
        {mode !== "forgot" && (
          <div className="space-y-4">
            {/* Standard Login or Signup Forms can go here or remain tied to your existing logic */}
            <p className="text-xs text-gray-500 text-center">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-[#C5924E] font-bold hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>

            {mode === "login" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-[#6E5D53] hover:text-[#C5924E] transition font-medium"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
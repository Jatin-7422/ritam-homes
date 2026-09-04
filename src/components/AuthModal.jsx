import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function PasswordResetFlow() {
  // UI & Step States
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Send OTP to User's Email
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail,
        options: {
          shouldCreateUser: false, // Ensures it only triggers for registered accounts
        },
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

  // Step 2: Verify the OTP Code entered by user
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

      setSuccessMsg("Password updated successfully! You can now log in.");

      // Reset form states after success
      setTimeout(() => {
        setForgotStep(1);
        setForgotEmail("");
        setOtpCode("");
        setNewPassword("");
        setSuccessMsg("");
      }, 2500);
    } catch (error) {
      setErrorMsg(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">
          {successMsg}
        </div>
      )}

      {/* STEP 1: Request Email */}
      {forgotStep === 1 && (
        <form onSubmit={handleSendResetOtp} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a verification code.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* STEP 2: Verify OTP Code */}
      {forgotStep === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the 6-digit verification code sent to <b>{forgotEmail}</b>.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center tracking-widest font-mono text-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* STEP 3: Create New Password */}
      {forgotStep === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your secure new password below.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  MessageSquare,
  LockKeyhole,
  UserCheck,
  Building,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import emailjs from "@emailjs/browser";

import { supabase } from "../../supabaseClient";
import heroBg from "../../assets/login.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("tenant"); // Only toggles between tenant and owner for UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [blockedRoleInfo, setBlockedRoleInfo] = useState(null);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setBlockedRoleInfo(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const userRole = data.user?.user_metadata?.role || "tenant";

      // If the user is an admin, bypass the standard role-matching block and go straight to admin dashboard
      if (userRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
        return;
      }

      // For standard tenants and owners, ensure they selected the correct tab
      if (userRole !== role) {
        await supabase.auth.signOut();

        const formatRoleName = (r) => {
          if (r === "owner") return "Owner";
          return "Tenant";
        };

        setBlockedRoleInfo({
          currentRole: formatRoleName(userRole),
          attemptedRole: formatRoleName(role),
        });
        setLoading(false);
        return;
      }

      if (userRole === "owner") {
        navigate("/owner-dashboard", { replace: true });
      } else {
        navigate("/tenant-dashboard", { replace: true });
      }
    } catch (error) {
      setErrorMsg(
        error.message || "Failed to log in. Please check your credentials.",
      );
      setLoading(false);
    }
  };

  // STEP 1: Generate 6-digit OTP and send it via EmailJS
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);

      const templateParams = {
        email: forgotEmail,
        token: randomOtp,
      };

      await emailjs.send(
        "service_mjzfobu",
        "template_pon69wu",
        templateParams,
        "0wrRljuwKzAP6sMcf",
      );

      setForgotStep(2);
      setSuccessMsg(
        "6-digit OTP sent to your email via EmailJS. Please check your inbox.",
      );
    } catch (error) {
      setErrorMsg(error.text || error.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify the OTP Code entered matches what was sent via EmailJS
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (otpCode.trim() !== generatedOtp) {
      setErrorMsg("Invalid OTP code. Please try again.");
      return;
    }

    setSuccessMsg("OTP verified successfully! Create your new password.");
    setForgotStep(3);
  };

  // STEP 3: Update Password in Supabase Database
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMsg("Password updated successfully! You can now log in.");

      setTimeout(async () => {
        await supabase.auth.signOut();
        setIsForgotPassword(false);
        setForgotStep(1);
        setForgotEmail("");
        setOtpCode("");
        setGeneratedOtp("");
        setNewPassword("");
        setSuccessMsg("");
      }, 2500);
    } catch (error) {
      setErrorMsg(error.message || "Failed to update password in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans relative z-10">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#EADBCE]">
        {/* Left Hero Section */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[500px] flex flex-col justify-between p-6 sm:p-8 text-[#2D1F1A]">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="Warm Living Room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F1A]/90 via-[#2D1F1A]/40 to-[#FAF7F2]/80" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5924E]">
              Welcome Back!
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D1F1A] leading-tight">
              Glad to have <br />
              you <span className="text-[#C5924E]">back.</span>
            </h1>
            <p className="text-xs font-medium text-[#57463D] pt-1">
              Log in to continue your journey with Ritam Homes.
            </p>
          </div>

          <div className="relative z-10 bg-[#2D1F1A]/95 backdrop-blur-md rounded-2xl p-5 border border-[#3E2E27] space-y-4 text-white shadow-xl mt-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FAF7F2]/10 rounded-xl text-[#C5924E] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Verified & Trusted
                </h4>
                <p className="text-[10px] text-[#D5C9B8]">
                  All properties and owners are verified for your safety.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FAF7F2]/10 rounded-xl text-[#C5924E] shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Direct Communication
                </h4>
                <p className="text-[10px] text-[#D5C9B8]">
                  Connect directly with property owners. No brokers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FAF7F2]/10 rounded-xl text-[#C5924E] shrink-0">
                <LockKeyhole className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Secure & Private
                </h4>
                <p className="text-[10px] text-[#D5C9B8]">
                  Your data is 100% safe and never shared.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 p-4 sm:p-8 flex flex-col justify-center">
          {isForgotPassword ? (
            <div className="max-w-md mx-auto w-full space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="text-xs font-bold text-[#8C5E47] hover:text-[#2D1F1A] flex items-center gap-1.5 mb-4 cursor-pointer"
                >
                  &larr; Back to login
                </button>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
                  Reset Password
                </h2>
                <p className="text-xs text-[#6E5D53] mt-1 font-medium">
                  {forgotStep === 1 &&
                    "Enter your email to receive a verification OTP"}
                  {forgotStep === 2 &&
                    "Enter the 6-digit code sent to your inbox"}
                  {forgotStep === 3 && "Create a secure new password"}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C5E47] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#2D1F1A] text-white font-bold text-xs rounded-xl hover:bg-[#3E2E27] shadow-md transition-all active:scale-[0.99] mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider mb-1.5">
                      Verification Code (OTP)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C5E47] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        className="w-full pl-10 pr-4 py-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all tracking-widest font-bold font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#2D1F1A] text-white font-bold text-xs rounded-xl hover:bg-[#3E2E27] shadow-md transition-all active:scale-[0.99] mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C5E47] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C5E47] hover:text-[#2D1F1A]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#2D1F1A] text-white font-bold text-xs rounded-xl hover:bg-[#3E2E27] shadow-md transition-all active:scale-[0.99] mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : blockedRoleInfo ? (
            <div className="max-w-md mx-auto w-full py-8 text-center space-y-6">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                  Access Restricted
                </h2>
                <p className="text-xs text-[#6E5D53] leading-relaxed">
                  You are logged in as a{" "}
                  <span className="font-bold text-[#2D1F1A] uppercase">
                    {blockedRoleInfo.currentRole}
                  </span>
                  . You are not supposed to log in with other profile as a{" "}
                  <span className="font-bold text-[#2D1F1A] uppercase">
                    {blockedRoleInfo.attemptedRole}
                  </span>
                  .
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRole(blockedRoleInfo.currentRole.toLowerCase());
                    setBlockedRoleInfo(null);
                  }}
                  className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Switch to {blockedRoleInfo.currentRole} Portal Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBlockedRoleInfo(null);
                    setFormData({ email: "", password: "", rememberMe: false });
                  }}
                  className="w-full py-3 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#6E5D53] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto w-full space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
                  Log in to your account
                </h2>
                <p className="text-xs text-[#6E5D53] mt-1 font-medium">
                  Enter your details to access your account
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Clean toggle showing ONLY Tenant and Owner to regular users */}
              <div className="p-1 bg-[#FAF7F2] rounded-xl flex items-center justify-between border border-[#EADBCE]">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "tenant"
                      ? "bg-[#2D1F1A] text-white shadow-sm"
                      : "text-[#6E5D53] hover:text-[#2D1F1A]"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#C5924E]" />
                  Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "owner"
                      ? "bg-[#2D1F1A] text-white shadow-sm"
                      : "text-[#6E5D53] hover:text-[#2D1F1A]"
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-[#C5924E]" />
                  Owner
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C5E47] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotStep(1);
                        setErrorMsg("");
                        setSuccessMsg("");
                        setForgotEmail(formData.email);
                      }}
                      className="text-[11px] font-bold text-[#C5924E] hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C5E47] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C5E47] hover:text-[#2D1F1A]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2D1F1A] text-white font-bold text-xs rounded-xl hover:bg-[#3E2E27] shadow-md transition-all active:scale-[0.99] mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-[#6E5D53]">
                  Don't have an account yet?{" "}
                  <Link
                    to="/signup"
                    className="font-bold text-[#2D1F1A] hover:underline"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
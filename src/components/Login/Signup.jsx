import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Building,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Phone,
  MapPin,
  ShieldCheck,
  Tag,
  CalendarCheck,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "../../supabaseClient";
import houseImage from "../../assets/bg.jpg";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("tenant");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Floating Toast State
  const [toastMessage, setToastMessage] = useState("");

  // OTP Verification States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpToken, setOtpToken] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    agreedToTerms: false,
  });

  // Auto-dismiss floating toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔐 Handle Email & Password Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!formData.agreedToTerms) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            location: formData.location,
            role: role,
          },
        },
      });

      if (error) throw error;

      // 🔥 THE FIX: Immediately destroy the session Supabase auto-creates
      // This guarantees they are NOT logged in and must manually use the login page.
      await supabase.auth.signOut();

      // Trigger floating success toast and redirect to login automatically
      setToastMessage("Account created successfully! Redirecting to login...");

      // Delay slightly so user can read the success message
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      setErrorMsg(
        error.message || "Failed to create account. Please try again.",
      );
      setLoading(false);
    }
  };

  // 🌐 Handle OAuth Social Logins (Google / Facebook)
  const handleOAuthLogin = async (provider) => {
    try {
      setErrorMsg("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          data: {
            role: role,
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message || `Failed to sign up with ${provider}`);
    }
  };

  // 📱 Handle Phone OTP Request Flow
  const handleRequestPhoneOtp = async () => {
    if (!formData.phone) {
      setErrorMsg("Please enter a valid phone number first.");
      return;
    }
    try {
      setErrorMsg("");
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: formData.phone,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
            location: formData.location,
          },
        },
      });

      if (error) throw error;
      setIsOtpStep(true);
      setToastMessage("OTP sent to your phone! Please enter the code.");
    } catch (error) {
      setErrorMsg(error.message || "Failed to send OTP to phone.");
    } finally {
      setLoading(false);
    }
  };

  // 📱 Handle Phone OTP Verification Flow
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!otpToken) {
      setErrorMsg("Please enter the verification code.");
      return;
    }
    try {
      setErrorMsg("");
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        phone: formData.phone,
        token: otpToken,
        type: "sms",
      });

      if (error) throw error;

      navigate(role === "owner" ? "/owner-dashboard" : "/tenant-dashboard", {
        replace: true,
      });
    } catch (error) {
      setErrorMsg(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col font-sans relative overflow-x-hidden text-[#2D1F1A]">
      {/* 🚀 FLOATING TOP-RIGHT TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce bg-[#2D1F1A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5924E]/40 flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-12 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start z-10">
        {/* LEFT BRANDING COLUMN */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-10 pr-0 lg:pr-4">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#2D1F1A] leading-[1.15]">
              Find. Rent. Relax. <br />
              It’s That <span className="text-[#C5924E]">Simple.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#6E5D53] font-medium leading-relaxed max-w-md">
              Join thousands of verified owners and tenants on Ritam Homes –
              India's most trusted rental platform.
            </p>

            <div className="space-y-5 pt-3">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#2D1F1A]">
                    Verified Owners
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    All property owners are verified for your safety.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#2D1F1A]">
                    No Brokerage
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Rent directly. Save more with zero brokerage.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#2D1F1A]">
                    Instant Booking
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Book visit slots and connect instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-[#EADBCE] shadow-lg mt-8 group hidden lg:block">
            <img
              src={houseImage}
              alt="Luxury Estate"
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F1A]/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold">
                Premium Living Spaces Across India
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIGNUP FORM CARD */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#EADBCE] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
                  {isOtpStep ? "Verify Mobile OTP" : "Create Account"}
                </h2>
                <p className="text-xs text-[#6E5D53]">
                  {isOtpStep
                    ? `Enter the verification code sent to ${formData.phone}`
                    : "Sign up to get started with your rental journey."}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-[#6E5D53] block">
                  Already have an account?
                </span>
                <Link
                  to="/login"
                  className="text-xs font-bold text-[#C5924E] hover:underline"
                >
                  Login here
                </Link>
              </div>
            </div>

            {/* Role Switcher */}
            {!isOtpStep && (
              <div className="p-1 bg-[#FAF7F2] rounded-xl flex items-center border border-[#EADBCE] mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    role === "tenant"
                      ? "bg-[#2D1F1A] text-white shadow-sm"
                      : "text-[#6E5D53] hover:text-[#2D1F1A]"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                  <span className="truncate">Tenant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    role === "owner"
                      ? "bg-[#2D1F1A] text-white shadow-sm"
                      : "text-[#6E5D53] hover:text-[#2D1F1A]"
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                  <span className="truncate">Owner</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CONDITIONAL RENDER: REGULAR SIGNUP vs OTP VERIFICATION STEP */}
            {!isOtpStep ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-[#8C5E47]" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-[#8C5E47]" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-[#8C5E47]" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#8C5E47]" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C5E47] hover:text-[#2D1F1A]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#8C5E47]" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C5E47] hover:text-[#2D1F1A]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      Location (Optional)
                    </label>
                    <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-[#8C5E47]" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        placeholder="Enter your city"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="agreedToTerms"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="rounded border-[#E3D7C8] text-[#C5924E] focus:ring-[#C5924E] w-4 h-4 cursor-pointer shrink-0 accent-[#C5924E]"
                  />
                  <label
                    htmlFor="agreedToTerms"
                    className="text-[11px] text-[#6E5D53] cursor-pointer leading-tight"
                  >
                    I agree to the{" "}
                    <a
                      href="#terms"
                      className="font-bold text-[#C5924E] hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#privacy"
                      className="font-bold text-[#C5924E] hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 text-[#C5924E]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                    Enter Verification Code
                  </label>
                  <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#C5924E] transition-all bg-[#FAF7F2]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <ShieldAlert className="h-4 w-4 text-[#8C5E47]" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="6-digit OTP code"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 text-xs focus:outline-none text-[#2D1F1A] placeholder-[#B5A89E] rounded-xl bg-transparent font-mono tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                    ) : (
                      <span>Verify OTP & Sign In</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOtpStep(false)}
                    className="py-3.5 px-4 bg-white border border-[#EADBCE] text-[#6E5D53] font-bold text-xs rounded-xl hover:bg-[#FAF7F2] transition-all"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {!isOtpStep && (
              <>
                <div className="relative flex items-center justify-center my-5">
                  <div className="border-t border-[#EADBCE] w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold text-[#8C5E47] uppercase tracking-wider absolute">
                    or continue with
                  </span>
                </div>

                {/* Social / Alternate Login Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    className="py-2.5 px-3 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2D1F1A] bg-white hover:bg-[#FAF7F2] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("facebook")}
                    className="py-2.5 px-3 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2D1F1A] bg-white hover:bg-[#FAF7F2] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <svg
                      className="w-4 h-4 fill-[#1877F2] shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestPhoneOtp}
                    className="py-2.5 px-3 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2D1F1A] bg-white hover:bg-[#FAF7F2] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-[#8C5E47] shrink-0" />
                    <span>Mobile OTP</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

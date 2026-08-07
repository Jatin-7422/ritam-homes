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
} from "lucide-react";

// Import Supabase client & local assets
import { supabase } from "../../supabaseClient";
import heroBg from "../../assets/login.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("tenant"); // "tenant" or "owner"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  // 🔐 Handle Email & Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      console.log("Logged in successfully:", data);

      // Redirect based on selected role
      navigate(role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
    } catch (error) {
      setErrorMsg(
        error.message || "Failed to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Handle Social Auth (Google / Facebook)
  const handleOAuthLogin = async (provider) => {
    try {
      setErrorMsg("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Dynamically matches localhost or your Vercel production URL
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          data: {
            role: role, // Passes the selected tenant/owner role metadata
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans relative z-10">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#EADBCE]">
        {/* LEFT COLUMN: Visual Banner & Feature Badges */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[500px] flex flex-col justify-between p-6 sm:p-8 text-[#2D1F1A]">
          {/* Background Image / Warm Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="Warm Living Room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F1A]/90 via-[#2D1F1A]/40 to-[#FAF7F2]/80" />
          </div>

          {/* Top Text Content */}
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

          {/* Bottom Dark Feature Card */}
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

        {/* RIGHT COLUMN: Form & Social Auth */}
        <div className="lg:col-span-7 p-4 sm:p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Form Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
                Log in to your account
              </h2>
              <p className="text-xs text-[#6E5D53] mt-1 font-medium">
                Enter your details to access your account
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Role Toggle Selector */}
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    className="text-[11px] font-bold text-[#C5924E] hover:underline"
                  >
                    Forgot password?
                  </a>
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

              {/* Remember Me & Help */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#C5924E] rounded border-[#E3D7C8]"
                  />
                  <span className="text-xs text-[#6E5D53] font-medium">
                    Remember me
                  </span>
                </label>
                <a
                  href="#help"
                  className="text-xs text-[#8C5E47] hover:underline font-medium"
                >
                  Need help?
                </a>
              </div>

              {/* Log In Button */}
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

            {/* Create Account Option Link */}
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

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#EADBCE] w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-[#8C5E47] uppercase tracking-wider absolute">
                or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="w-full py-2.5 px-4 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2D1F1A] bg-white hover:bg-[#FAF7F2] flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("facebook")}
                className="w-full py-2.5 px-4 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2D1F1A] bg-white hover:bg-[#FAF7F2] flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            {/* Terms Disclaimer */}
            <p className="text-[10px] text-center text-[#6E5D53] leading-relaxed">
              By continuing, you agree to our{" "}
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
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

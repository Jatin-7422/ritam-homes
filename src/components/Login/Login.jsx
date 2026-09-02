import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import LoginNavbar from "./LoginNav"; 
import loginVideo from "../../assets/BG.mp4";
import Footer from "../../components/Landing-Page/Footer";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      const userRole = data.user?.user_metadata?.role || "user";

      if (userRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMsg(
        error.message || "Failed to log in. Please check your credentials."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-x-hidden justify-between bg-[#3b2219]">
      {/* Clean separate login navbar */}
      <LoginNavbar />

      {/* Main Content Area with Background Video */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-24 sm:py-32">
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-[0.7]"
          >
            <source src={loginVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* Form Card */}
        <div className="relative z-10 max-w-md w-full bg-[#3b2219]/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30 text-white">
          <div className="space-y-5">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight font-serif">
                Login
              </h2>
              <p className="text-xs text-[#e6d5c3] mt-1 font-medium">
                Welcome back please login to your account
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="User Name or Email"
                    className="w-full pl-4 pr-10 py-3.5 text-xs bg-black/30 border border-white/20 rounded-xl focus:outline-none focus:border-[#d4af37] transition-all text-white placeholder-white/50 backdrop-blur-sm"
                  />
                  <Mail className="w-4 h-4 text-white/60 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full pl-4 pr-10 py-3.5 text-xs bg-black/30 border border-white/20 rounded-xl focus:outline-none focus:border-[#d4af37] transition-all text-white placeholder-white/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                    rememberMe ? "bg-[#d4af37] border-[#d4af37] text-black" : "border-white/40 bg-black/30"
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span className="text-xs text-white/85 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                  Remember me
                </span>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#c59b27] hover:bg-[#b0881f] text-white font-bold text-xs rounded-xl shadow-xl transition-all active:scale-[0.99] mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 group tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-[#e6d5c3]">
                Don't have an account?{" "}
                <Link to="/signup" className="font-bold text-white hover:underline">
                  Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Landing Page Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
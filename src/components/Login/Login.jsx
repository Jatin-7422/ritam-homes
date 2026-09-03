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
  User,
  Lock,
  Phone,
  X,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import LoginNavbar from "./LoginNav"; 
import loginVideo from "../../assets/BG.mp4";
import Footer from "../../components/Landing-Page/Footer";

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Signup Modal State with Confirm Password
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  // Modern Password Validation Function
  const validatePassword = (pass) => {
    const minLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[@$!%*?&]/.test(pass);
    return minLength && hasUpperCase && hasNumber && hasSpecialChar;
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

      if (setIsLoggedIn) setIsLoggedIn(true);

      const userRole = data.user?.user_metadata?.role || "user";

      if (userRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMsg(
        error.message || "Failed to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Explicitly forcing redirect to the landing page root
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message || "Google login failed.");
      setSignupError(error.message || "Google login failed.");
    }
  };

const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");

    // Password Match Validation
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match.");
      setSignupLoading(false);
      return;
    }

    // Modern Password Complexity Check
    if (!validatePassword(signupData.password)) {
      setSignupError(
        "Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character."
      );
      setSignupLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name,
            phone: signupData.phone,
          },
        },
      });

      if (error) throw error;

      // If email confirmation is enabled, session will be null.
      // If a session was automatically returned, sign out to enforce verification.
      if (data?.session) {
        await supabase.auth.signOut();
      }

      if (setIsLoggedIn) setIsLoggedIn(false);
      setIsSignupOpen(false);
      
      // Clear signup form data
      setSignupData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Display a notification/success message on the login screen
      setErrorMsg("Account created successfully! Please check your email to verify your account before logging in.");
    } catch (error) {
      setSignupError(error.message || "Failed to create account.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setForgotSuccess("Password reset instructions sent to your email.");
    } catch (error) {
      setForgotError(error.message || "Failed to send password reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-x-hidden justify-between bg-[#3b2219]">
      <LoginNavbar />

      <div className="relative flex-1 flex items-center justify-center px-4 py-24 sm:py-32">
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

        {/* Login Form Card */}
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

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white hover:bg-gray-100 text-black font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center my-3">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="px-3 text-xs text-[#e6d5c3]">or with email</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

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

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
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

                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-[#d4af37] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Forgot password?
                </button>
              </div>

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
                <button
                  type="button"
                  onClick={() => setIsSignupOpen(true)}
                  className="font-bold text-white hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Signup
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE ACCOUNT MODAL POPUP */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#3b2219] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
            <button
              onClick={() => setIsSignupOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-[#d4af37] font-serif">Create Account</h2>
              <p className="text-xs text-[#e6d5c3] mt-1">Join Ritam Homes to explore or list properties.</p>
            </div>

            {signupError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
                <span>{signupError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white hover:bg-gray-100 text-black font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign up with Google
            </button>

            <div className="flex items-center mb-4">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="px-3 text-xs text-[#e6d5c3]">or with email</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={signupData.name}
                    onChange={handleSignupChange}
                    placeholder="Enter your name"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Re-enter password"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3.5 bg-[#c59b27] hover:bg-[#b0881f] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer mt-3 flex items-center justify-center gap-2"
              >
                {signupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Sign Up"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL POPUP */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#3b2219] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <button
              onClick={() => {
                setIsForgotOpen(false);
                setForgotError("");
                setForgotSuccess("");
                setForgotEmail("");
              }}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-[#d4af37] font-serif">Reset Password</h2>
              <p className="text-xs text-[#e6d5c3] mt-1">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            {forgotError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-green-500/20 border border-green-500/30 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-sm">
                <Check className="w-4 h-4 shrink-0 text-green-300" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3.5 bg-[#c59b27] hover:bg-[#b0881f] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
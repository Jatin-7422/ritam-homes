import React, { useState } from "react";
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
} from "lucide-react";
import logo from "../../assets/newlogo.png";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("tenant"); // "tenant" or "owner"
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect based on selected role
    if (role === "owner") {
      navigate("/owner-dashboard");
    } else {
      navigate("/tenant-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo */}
        <Link to="/" className="inline-block">
          <img
            src={logo}
            alt="Ritam Homes"
            className="h-14 mx-auto object-contain"
          />
        </Link>
        <h2 className="text-2xl font-serif font-bold text-[#2D1F1A]">
          Create your account
        </h2>
        <p className="text-xs text-[#6E5D53]">
          Join Ritam Homes to search properties or manage your listings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E3D9CC]">
          {/* Role Toggle Selector */}
          <div className="mb-6 p-1 bg-[#F6F2EA] rounded-xl flex items-center justify-between border border-[#E3D9CC]">
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
              I'm a Tenant
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
              I'm an Owner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#6E5D53] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#2D1F1A] transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#C5924E]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 bg-transparent text-xs font-semibold focus:outline-none text-[#2D1F1A] placeholder-[#9E8E84]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#6E5D53] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#2D1F1A] transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#C5924E]" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 bg-transparent text-xs font-semibold focus:outline-none text-[#2D1F1A] placeholder-[#9E8E84]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#6E5D53] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl border border-[#E3D7C8] focus-within:border-[#2D1F1A] transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#C5924E]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-9 pr-10 py-2.5 bg-transparent text-xs font-semibold focus:outline-none text-[#2D1F1A] placeholder-[#9E8E84]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9E8E84] hover:text-[#2D1F1A]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#2D1F1A] text-white font-bold text-xs rounded-xl hover:bg-[#3E2E27] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              Create Account <ArrowRight className="w-4 h-4 text-[#C5924E]" />
            </button>
          </form>

          {/* Login Redirection link */}
          <div className="mt-6 text-center border-t border-[#F6F2EA] pt-4">
            <p className="text-xs text-[#6E5D53]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-[#2D1F1A] hover:underline"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

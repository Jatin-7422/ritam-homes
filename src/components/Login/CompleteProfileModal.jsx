import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AppContext } from "../../App";
import { User, Phone, Building, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export default function CompleteProfileModal() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, showToast } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: userInfo?.fullName || "",
    phone: "",
    role: "tenant", 
    businessName: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          business_name: formData.businessName,
        },
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          full_name: formData.fullName,
          email: session.user.email,
          phone: formData.phone,
          role: formData.role,
          business_name: formData.businessName,
          updated_at: new Date(),
        });

      if (dbError) console.error("Database sync warning:", dbError.message);

      setUserInfo((prev) => ({
        ...prev,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        businessName: formData.businessName,
      }));

      showToast("Profile completed successfully!");

      if (formData.role === "owner") {
        navigate("/owner-dashboard", { replace: true });
      } else {
        navigate("/tenant-dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error saving profile:", err.message);
      showToast("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1A120B] border border-[#3E2E27] rounded-3xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] space-y-6 text-[#F8F5EE] relative overflow-hidden">
        
        {/* Header */}
        <div className="space-y-1.5 relative z-10">
          <div className="w-10 h-10 bg-[#261C14] border border-[#3E2E27] text-[#C5924E] rounded-xl flex items-center justify-center shadow-inner mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F8F5EE] tracking-wide">Complete Your Profile</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Please provide a few extra details to finish setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#C5924E] pointer-events-none z-10" />
              <input
                type="text"
                required
                autoComplete="off"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#4A382C] bg-[#2E2016] text-white placeholder-gray-500 text-xs font-medium focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4 h-4 text-[#C5924E] pointer-events-none z-10" />
              <input
                type="tel"
                required
                autoComplete="off"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#4A382C] bg-[#2E2016] text-white placeholder-gray-500 text-xs font-medium focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Role Tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "tenant" })}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.role === "tenant"
                    ? "bg-[#C5924E] text-[#1A120B] border-[#C5924E] shadow-md"
                    : "bg-[#261C14] text-gray-300 border-[#3E2E27] hover:border-gray-500"
                }`}
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "owner" })}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.role === "owner"
                    ? "bg-[#C5924E] text-[#1A120B] border-[#C5924E] shadow-md"
                    : "bg-[#261C14] text-gray-300 border-[#3E2E27] hover:border-gray-500"
                }`}
              >
                Property Owner
              </button>
            </div>
          </div>

          {/* Business Name (Conditional) */}
          {formData.role === "owner" && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Business / Agency Name</label>
              <div className="relative flex items-center">
                <Building className="absolute left-3.5 w-4 h-4 text-[#C5924E] pointer-events-none z-10" />
                <input
                  type="text"
                  autoComplete="off"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#4A382C] bg-[#2E2016] text-white placeholder-gray-500 text-xs font-medium focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                  placeholder="Enter business name"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#C5924E] hover:bg-[#b07e3e] text-[#1A120B] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1A120B]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#1A120B]" />
            )}
            <span>Save & Continue</span>
          </button>
        </form>
      </div>
    </div>
  );
}
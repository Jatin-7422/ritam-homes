import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Loader2 } from "lucide-react";

export default function Option() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showIntentModal, setShowIntentModal] = useState(false);

  useEffect(() => {
    const checkUserAndRole = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate("/login", { replace: true });
          return;
        }

        const role = session.user?.user_metadata?.role;
        
        // If an admin or an already-configured user returns here, route them properly
        if (role === "admin") {
          navigate("/admin-dashboard", { replace: true });
          return;
        } else if (role === "owner") {
          navigate("/owner-dashboard", { replace: true });
          return;
        } else if (role === "tenant") {
          navigate("/tenant-dashboard", { replace: true });
          return;
        }

        // If no role is set yet, show the intent popup selection
        setLoading(false);
        setShowIntentModal(true);
      } catch (err) {
        console.error("Error checking session on option page:", err.message);
        setLoading(false);
      }
    };

    checkUserAndRole();
  }, [navigate]);

  const handleChoice = async (roleType) => {
    try {
      // Clear any session storage flag if present
      sessionStorage.removeItem("show_intent_popup");

      // Save role preference to Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: { role: roleType }
      });

      if (error) throw error;

      setShowIntentModal(false);

      // Redirect based on choice
      if (roleType === "tenant") {
        navigate("/tenant-dashboard", { replace: true });
      } else {
        navigate("/owner-dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error saving preference:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3b2219] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#3b2219] flex items-center justify-center p-4">
      {/* INTENT SELECTION POPUP MODAL */}
      {showIntentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full bg-[#3b2219] border border-[#d4af37]/30 rounded-3xl p-8 shadow-2xl text-white text-center animate-fadeIn">
            <h2 className="text-3xl font-serif text-white mb-2">What are you here for today?</h2>
            <p className="text-sm text-[#e6d5c3] mb-8">Choose an option to customize your experience.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant Option */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Find a Home</h3>
                  <p className="text-xs text-[#e6d5c3] mb-6">
                    Browse verified properties, book visits, connect direct with owners.
                  </p>
                </div>
                <button
                  onClick={() => handleChoice("tenant")}
                  className="w-full py-3 bg-[#c59b27] hover:bg-[#b0881f] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Continue as Tenant
                </button>
              </div>

              {/* Owner Option */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">List a Property</h3>
                  <p className="text-xs text-[#e6d5c3] mb-6">
                    Add your home, set visit slots and reach verified tenants directly.
                  </p>
                </div>
                <button
                  onClick={() => handleChoice("owner")}
                  className="w-full py-3 bg-[#c59b27] hover:bg-[#b0881f] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Continue as Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
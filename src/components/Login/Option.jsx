import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showIntentModal, setShowIntentModal] = useState(false);

  useEffect(() => {
    // Check if the user just logged in
    const needsIntent = sessionStorage.getItem("show_intent_popup");
    if (needsIntent === "true") {
      setShowIntentModal(true);
    }
  }, []);

  const handleChoice = async (roleType) => {
    try {
      // Clear the popup flag
      sessionStorage.removeItem("show_intent_popup");

      // Optional: Save their role preference to Supabase user metadata
      await supabase.auth.updateUser({
        data: { role: roleType }
      });

      setShowIntentModal(false);

      // Redirect based on what they chose
      if (roleType === "tenant") {
        navigate("/tenant-dashboard");
      } else {
        navigate("/owner-dashboard");
      }
    } catch (err) {
      console.error("Error saving preference:", err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#3b2219]">
      {/* Your regular landing page content */}

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
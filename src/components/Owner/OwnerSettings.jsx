import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Settings, User, Mail, Shield, CheckCircle } from "lucide-react";

export default function OwnerSettings() {
  const [user, setUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUser(session.user);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          Account Settings ⚙️
        </h1>
        <p className="text-sm text-[#6E5D53] mt-1">
          Manage your owner profile credentials and security preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#EADBCE] p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
          Profile Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#6E5D53] uppercase">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="mt-1 w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6E5D53] uppercase">Account Role</label>
            <input
              type="text"
              disabled
              value="Property Owner"
              className="mt-1 w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
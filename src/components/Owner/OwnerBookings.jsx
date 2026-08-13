import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Calendar, Loader2, Users } from "lucide-react";

export default function OwnerBookings() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          Tenant Bookings 📝
        </h1>
        <p className="text-sm text-[#6E5D53] mt-1">
          Track confirmed tenant leases, agreements, and residency timelines.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EADBCE] p-12 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
          No Active Bookings
        </h3>
        <p className="text-sm text-[#6E5D53] max-w-md mx-auto">
          Confirmed lease agreements and active tenant contracts will be listed
          here.
        </p>
      </div>
    </div>
  );
}

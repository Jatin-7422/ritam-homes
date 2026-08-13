import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { CalendarCheck, Loader2, Calendar, User, MapPin } from "lucide-react";

export default function OwnerVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder fetch for visit requests linked to owner properties
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          Visit Requests 📅
        </h1>
        <p className="text-sm text-[#6E5D53] mt-1">
          Review and manage scheduled property visits from interested tenants.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EADBCE] p-12 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
          No Visit Requests Yet
        </h3>
        <p className="text-sm text-[#6E5D53] max-w-md mx-auto">
          When tenants schedule a visit to tour your properties, the requests
          will appear here for you to confirm or reschedule.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Clock, Loader2, Calendar } from "lucide-react";

export default function TenantVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("tenant_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (err) {
      console.error("Error fetching visits:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Schedule</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            Visit History & Requests 🕒
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl">
            Track your upcoming and past property tours scheduled with owners.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
        </div>
      ) : visits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#2D1F1A]">
                  {visit.property_title || "Property Visit"}
                </h3>
                <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold rounded-full">
                  {visit.status || "Scheduled"}
                </span>
              </div>
              <p className="text-xs text-[#6E5D53]">
                Visit Date:{" "}
                {visit.visit_date
                  ? new Date(visit.visit_date).toLocaleString()
                  : "To be confirmed"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#EADBCE] space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl flex items-center justify-center mx-auto text-sky-600">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              No visit requests found
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Schedule a visit from any property detail page to track it here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

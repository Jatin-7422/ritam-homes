import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Loader2,
} from "lucide-react";

export default function OwnerVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchOwnerVisitRequests();
  }, []);

  const fetchOwnerVisitRequests = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        showToast("Please log in as an owner.");
        return;
      }

      const ownerId = session.user.id;

      // Fetch visits where owner_id matches, along with associated property details
      const { data, error } = await supabase
        .from("visit_requests")
        .select(
          `
          *,
          properties (
            title,
            location,
            price
          )
        `,
        )
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (err) {
      console.error("Error fetching visit requests:", err);
      showToast("Failed to load visit requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVisit = async (visitId) => {
    try {
      const { error } = await supabase
        .from("visit_requests")
        .update({ status: "Confirmed" })
        .eq("id", visitId);

      if (error) throw error;

      showToast("Visit confirmed successfully!");
      // Update local state to reflect change instantly
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: "Confirmed" } : v)),
      );
    } catch (err) {
      console.error("Error confirming visit:", err);
      showToast("Failed to confirm visit.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-[#2D1F1A] relative">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-[#2D1F1A] text-white text-xs font-bold rounded-2xl shadow-xl border border-[#C5924E]">
          {toastMessage}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
          Tenant Visit Requests
        </h1>
        <p className="text-xs text-[#6E5D53] mt-1">
          Manage scheduled visit slots and confirm bookings from prospective
          tenants.
        </p>
      </div>

      {visits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#EADBCE] text-center space-y-3 shadow-sm">
          <Calendar className="w-10 h-10 text-[#C5924E] mx-auto" />
          <h3 className="text-sm font-bold text-[#2D1F1A]">
            No Visit Requests Yet
          </h3>
          <p className="text-xs text-[#6E5D53]">
            When tenants book a visit slot for your properties, they will appear
            here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Status & Property Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      visit.status === "Confirmed"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {visit.status}
                  </span>
                  <span className="text-[10px] font-bold text-[#8A7568]">
                    Requested on{" "}
                    {new Date(visit.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Property Info */}
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EADBCE] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D1F1A]">
                    <Building className="w-4 h-4 text-[#C5924E] shrink-0" />
                    <span className="truncate">
                      {visit.properties?.title || "Property"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6E5D53]">
                    <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                    <span className="truncate">
                      {visit.properties?.location || "Location N/A"}
                    </span>
                  </div>
                </div>

                {/* Tenant Information */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A7568]">
                    Tenant Details
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-[#6E5D53]">
                    <span className="flex items-center gap-2 font-bold text-[#2D1F1A]">
                      <User className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                      {visit.tenant_name || "N/A"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                      {visit.tenant_email || "N/A"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                      {visit.tenant_phone || "Phone not provided"}
                    </span>
                  </div>
                </div>

                {/* Visit Slot Time */}
                <div className="pt-2 border-t border-[#F0E6D8] flex items-center justify-between text-xs font-bold text-[#2D1F1A]">
                  <span className="flex items-center gap-1.5 text-[#6E5D53]">
                    <Calendar className="w-4 h-4 text-[#C5924E]" /> Date:
                  </span>
                  <span>{visit.visit_date}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#2D1F1A]">
                  <span className="flex items-center gap-1.5 text-[#6E5D53]">
                    <Clock className="w-4 h-4 text-[#C5924E]" /> Time Slot:
                  </span>
                  <span className="text-[#C5924E]">{visit.visit_time}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                {visit.status !== "Confirmed" ? (
                  <button
                    onClick={() => handleConfirmVisit(visit.id)}
                    className="w-full py-2.5 bg-[#C5924E] hover:bg-[#B38141] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Booking Slot</span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Slot Confirmed & Notified</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

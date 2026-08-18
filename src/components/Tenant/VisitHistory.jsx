import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function VisitHistory() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getSession();

      if (!user) return;

      // Fetch visits booked by this tenant (adjust table name if yours differs, e.g., 'property_visits')
      const { data, error } = await supabase
        .from("visits")
        .select(
          `
          id,
          visit_date,
          visit_time,
          status,
          created_at,
          properties (
            id,
            title,
            location,
            price,
            images
          )
        `,
        )
        .eq("tenant_id", user.id)
        .order("visit_date", { ascending: false });

      if (error) {
        console.error("Error fetching visits:", error);
      } else {
        setVisits(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
            Visit History
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1">
            Track all your scheduled and past property tours in one place.
          </p>
        </div>
      </div>

      {/* Visits List */}
      {visits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto border border-[#EADBCE]">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              No Property Visits Found
            </h3>
            <p className="text-xs text-[#6E5D53] max-w-sm mx-auto">
              You haven't scheduled any property tours yet. Explore available
              properties to book a visit.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {visits.map((visit) => {
            const property = visit.properties;
            const propertyImage =
              property?.images?.[0] ||
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80";

            return (
              <div
                key={visit.id}
                className="bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <img
                    src={propertyImage}
                    alt={property?.title || "Property"}
                    className="w-20 h-20 rounded-2xl object-cover border border-[#EADBCE] flex-shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(visit.status)}
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                      {property?.title || "Property Visit"}
                    </h3>
                    <p className="text-xs text-[#6E5D53] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5924E]" />
                      {property?.location || "Location not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#F0E6D8]">
                  <div className="space-y-1 text-left md:text-right">
                    <div className="text-xs font-bold text-[#2D1F1A] flex items-center md:justify-end gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C5924E]" />
                      {visit.visit_date}
                    </div>
                    <div className="text-xs text-[#6E5D53] flex items-center md:justify-end gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C5924E]" />
                      {visit.visit_time || "Time not set"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

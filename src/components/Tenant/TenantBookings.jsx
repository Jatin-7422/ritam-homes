import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Calendar, Home, Loader2, Compass, CheckCircle2 } from "lucide-react";

export default function TenantBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("tenant_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching tenant bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
            <Calendar className="w-3.5 h-3.5 text-[#C5924E]" />
            <span>Rental Management</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            My Bookings 📅
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl">
            View and track your confirmed rental agreements and lease statuses.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#2D1F1A]">
                    <Home className="w-5 h-5 text-[#C5924E]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#2D1F1A]">
                      {booking.property_title || "Rental Property"}
                    </h3>
                    <p className="text-[11px] text-[#6E5D53]">
                      Booked on:{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {booking.status || "Confirmed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#EADBCE] space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl flex items-center justify-center mx-auto text-[#8C7A6B]">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              No active bookings found
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Explore available properties to start your rental journey.
            </p>
          </div>
          <Link
            to="/tenant-dashboard/explore"
            className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3E2E27] transition-all inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#C5924E]" />
            <span>Explore Properties</span>
          </Link>
        </div>
      )}
    </div>
  );
}
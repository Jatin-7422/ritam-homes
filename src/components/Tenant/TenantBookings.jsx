import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Users,
  Loader2,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
  Phone,
  Mail,
  ChevronDown,
  Search,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function TenantBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });

  useEffect(() => {
    fetchTenantBookings();
  }, []);

  const fetchTenantBookings = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch visit requests made by the logged-in tenant (e.g., matching tenant_email or tenant_id if stored)
      const { data: bookingData, error } = await supabase
        .from("visit_requests")
        .select("*")
        .eq("tenant_email", session.user.email) // Adjust to .eq("tenant_id", session.user.id) if you store user id
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!bookingData || bookingData.length === 0) {
        setBookings([]);
        return;
      }

      // Get unique property IDs
      const propIds = [...new Set(bookingData.map((b) => b.property_id))];

      // Fetch corresponding properties including images and owner details
      const { data: props, error: propError } = await supabase
        .from("properties")
        .select("id, title, location, price, image, owner_id") // Change 'image' to 'image_url' if needed
        .in("id", propIds);

      if (propError) throw propError;

      const propMap = Object.fromEntries((props || []).map((p) => [p.id, p]));

      // Fetch owner contact details for accepted bookings
      const ownerIds = [
        ...new Set((props || []).map((p) => p.owner_id).filter(Boolean)),
      ];
      let ownerMap = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles") // Adjust table name if your user profiles are stored elsewhere (e.g. 'users')
          .select("id, full_name, email, phone")
          .in("id", ownerIds);

        if (profiles) {
          ownerMap = Object.fromEntries(profiles.map((o) => [o.id, o]));
        }
      }

      const enriched = bookingData.map((b) => {
        const property = propMap[b.property_id] || {};
        return {
          ...b,
          property,
          owner: ownerMap[property.owner_id] || {},
        };
      });

      setBookings(enriched);
      setStats({
        total: enriched.length,
        active: enriched.filter((b) => b.status?.toLowerCase() === "accepted")
          .length,
        pending: enriched.filter((b) => b.status?.toLowerCase() === "pending")
          .length,
      });
    } catch (err) {
      console.error("Error fetching tenant bookings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filters = ["All", "Pending", "Accepted", "Rejected"];

  const filtered = bookings.filter((b) => {
    const bookingStatus = b.status?.toLowerCase() || "pending";
    const matchFilter =
      filter === "All" || bookingStatus === filter.toLowerCase();

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.property?.title?.toLowerCase().includes(q) ||
      b.property?.location?.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            My Visit Bookings 🗓️
          </h1>
          <p className="text-sm text-[#6E5D53] mt-1">
            Track your property visit requests, confirmed time slots, and owner
            contact details.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6E5D53]" />
          <input
            type="text"
            placeholder="Search property or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E3D9CC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Requests",
            val: stats.total,
            icon: <Users className="w-4 h-4" />,
          },
          {
            label: "Confirmed",
            val: stats.active,
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            label: "Pending",
            val: stats.pending,
            icon: <Clock className="w-4 h-4" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E5D53]">
                {s.label}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "bg-[#2D1F1A] text-white shadow-sm"
                : "bg-white border border-[#E3D9CC] text-[#6E5D53] hover:bg-[#F8F5EE]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
            {search || filter !== "All"
              ? "No matching bookings"
              : "No Visit Bookings Yet"}
          </h3>
          <p className="text-sm text-[#6E5D53] max-w-md mx-auto">
            {search || filter !== "All"
              ? "Try adjusting your search or filter."
              : "Explore properties and schedule visits to see them tracked here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const isExpanded = expandedId === booking.id;
            const statusStr = booking.status?.toLowerCase() || "pending";
            const accepted = statusStr === "accepted";
            const pending = statusStr === "pending";

            const statusBadgeColor = accepted
              ? "bg-green-100 text-green-800"
              : pending
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-700";

            // Extract image (handles array or string formats)
            const propertyImage = Array.isArray(booking.property?.image)
              ? booking.property?.image[0]
              : booking.property?.image || booking.property?.image_url;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden"
              >
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Property Image Thumbnail */}
                    {propertyImage ? (
                      <img
                        src={propertyImage}
                        alt={booking.property?.title || "Property"}
                        className="w-16 h-16 rounded-2xl object-cover border border-[#E3D9CC] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E] flex-shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#2D1F1A]">
                          {booking.property?.title || "Property Title"}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusBadgeColor}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C5924E]" />
                        {booking.property?.location || "Location not specified"}
                      </p>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Visit Slot:{" "}
                        {booking.visit_date
                          ? new Date(booking.visit_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "TBD"}
                        {booking.visit_time ? ` at ${booking.visit_time}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    {booking.property?.price && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[#6E5D53]">Rent</p>
                        <p className="text-sm font-bold text-[#C5924E]">
                          ₹{booking.property.price.toLocaleString("en-IN")}/mo
                        </p>
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-[#6E5D53] transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#F2ECE4] pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Owner Contact Info Box */}
                      <div className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#E3D9CC] space-y-2">
                        <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />{" "}
                          Owner Contact Info{" "}
                          {accepted
                            ? "(Confirmed)"
                            : "(Available upon acceptance)"}
                        </p>
                        {accepted ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-xs font-bold text-[#2D1F1A]">
                              {booking.owner?.full_name || "Property Owner"}
                            </p>
                            <p className="text-xs text-[#2D1F1A] flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                              {booking.owner?.email || "Not provided"}
                            </p>
                            <p className="text-xs text-[#2D1F1A] flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                              {booking.owner?.phone || "Not provided"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-[#6E5D53] italic">
                            Owner contact details will unlock once the visit
                            request is accepted.
                          </p>
                        )}
                      </div>

                      {/* Tenant Note / Details */}
                      {booking.message && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">
                            Your Note to Owner
                          </p>
                          <p className="text-xs text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-xl border border-[#E3D9CC] leading-relaxed">
                            {booking.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

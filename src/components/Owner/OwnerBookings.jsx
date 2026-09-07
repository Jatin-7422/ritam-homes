import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Search,
  Users,
  CheckCircle,
  Clock3,
  Check,
  X,
  XCircle,
  Building,
  User,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  Filter,
} from "lucide-react";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    resetExpiredSlots().then(() => {
      fetchOwnerBookings();
    });
  }, []);

  const resetExpiredSlots = async () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await supabase
        .from("property_visit_slots")
        .update({
          status: "available",
          is_booked: false,
          tenant_id: null,
        })
        .lt("date", today)
        .neq("status", "available");
    } catch (err) {
      console.error("Error clearing expired slots:", err);
    }
  };

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) return;

      const { data: slotsData, error: slotsError } = await supabase
        .from("property_visit_slots")
        .select(
          `
            id,
            date,
            time_slot,
            status,
            tenant_id,
            is_booked,
            properties (
              id,
              title,
              location,
              price,
              owner_id
            )
          `
        )
        .neq("status", "available");

      if (slotsError) throw slotsError;

      const ownerBookings = (slotsData || []).filter(
        (slot) =>
          slot.properties && slot.properties.owner_id === session.user.id
      );

      const today = new Date().toISOString().split("T")[0];
      const activeBookings = ownerBookings.filter((slot) => slot.date >= today);

      setBookings(activeBookings);
    } catch (err) {
      console.error("Error fetching owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (slot) => {
    if (!slot.tenant_id) {
      setSelectedBooking({ ...slot, profiles: null });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_slot_tenant_details", {
        slot_id: slot.id,
      });

      if (error) throw error;

      const tenantInfo = data && data.length > 0 ? data[0] : null;

      setSelectedBooking({
        ...slot,
        profiles: tenantInfo
          ? {
              full_name: tenantInfo.full_name || "Tenant",
              email: tenantInfo.email,
              phone: tenantInfo.phone || "Not Provided",
            }
          : null,
      });
    } catch (err) {
      console.error("Error fetching tenant details:", err);
      setSelectedBooking(slot);
    }
  };

  const handleUpdateStatus = async (e, slot, newStatus) => {
    e.stopPropagation();
    try {
      const isConfirmed = newStatus === "confirmed";

      const { error: updateError } = await supabase
        .from("property_visit_slots")
        .update({
          status: newStatus,
          is_booked: isConfirmed,
        })
        .eq("id", slot.id);

      if (updateError) throw updateError;

      if (slot.tenant_id) {
        const titleText = isConfirmed
          ? "Visit Request Accepted ⚡"
          : "Visit Request Declined";
        const messageText = `Your visit request for ${
          slot.properties?.title || "the property"
        } on ${slot.date} at ${slot.time_slot} was ${
          isConfirmed ? "accepted" : "declined"
        }.`;

        await supabase.from("notifications").insert([
          {
            user_id: slot.tenant_id,
            title: titleText,
            message: messageText,
            type: "visit_update",
            is_read: false,
          },
        ]);
      }

      fetchOwnerBookings();
    } catch (err) {
      console.error("Error updating slot status:", err);
    }
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending" || !b.status
  ).length;

  const estRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((acc, curr) => acc + Number(curr.properties?.price || 0), 0);

  const filteredBookings = bookings.filter((item) => {
    const title = item.properties?.title?.toLowerCase() || "";
    const location = item.properties?.location?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || location.includes(query);

    const slotStatus = item.status || "pending";
    if (filter === "All") return matchesSearch;
    if (filter === "Pending") return matchesSearch && slotStatus === "pending";
    if (filter === "Confirmed") return matchesSearch && slotStatus === "confirmed";
    if (filter === "Rejected") return matchesSearch && slotStatus === "rejected";

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#C5924E]" />
          <p className="text-xs text-[#8A7568] tracking-wider uppercase font-mono">Syncing schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#2D1F1A] px-4 md:px-10 py-8 space-y-8 selection:bg-[#C5924E]/20 selection:text-[#2D1F1A]">
      {/* Modern Glassmorphic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 border border-[#EADBCE]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C5924E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-xs font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> PROPERTY HUB
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
            Bookings & Visits
          </h1>
          <p className="text-xs md:text-sm text-[#6E5D53] max-w-xl font-normal">
            Manage real-time prospective tenant requests, streamline appointments, and review visitor profiles seamlessly.
          </p>
        </div>

        <div className="w-full lg:w-80 relative z-10">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7568]" />
            <input
              type="text"
              placeholder="Search property or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] placeholder-[#8A7568] focus:outline-none focus:border-[#C5924E] focus:ring-2 focus:ring-[#C5924E]/25 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Sleek Modern Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 border border-[#EADBCE]/85 backdrop-blur-md p-5 rounded-2xl space-y-2 hover:border-[#C5924E]/50 transition-colors shadow-xs">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#8A7568]">Total Bookings</div>
          <div className="text-2xl font-serif font-bold text-[#2D1F1A]">{totalBookings}</div>
          <div className="text-[10px] text-[#6E5D53]">All registered appointments</div>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 backdrop-blur-md p-5 rounded-2xl space-y-2 hover:border-[#C5924E]/50 transition-colors shadow-xs">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#8A7568]">Confirmed</div>
          <div className="text-2xl font-serif font-bold text-emerald-600">{activeBookings}</div>
          <div className="text-[10px] text-[#6E5D53]">Ready for tours</div>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 backdrop-blur-md p-5 rounded-2xl space-y-2 hover:border-[#C5924E]/50 transition-colors shadow-xs">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#8A7568]">Pending Review</div>
          <div className="text-2xl font-serif font-bold text-amber-600">{pendingBookings}</div>
          <div className="text-[10px] text-[#6E5D53]">Action required</div>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 backdrop-blur-md p-5 rounded-2xl space-y-2 hover:border-[#C5924E]/50 transition-colors shadow-xs">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#8A7568]">Est. Revenue</div>
          <div className="text-2xl font-serif font-bold text-[#2D1F1A]">₹{estRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-[#6E5D53]">From confirmed listings</div>
        </div>
      </div>

      {/* Filter Tabs & Bookings Stream */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-1.5 bg-white/80 border border-[#EADBCE] p-1 rounded-xl shadow-xs">
            {["All", "Pending", "Confirmed", "Rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === tab
                    ? "bg-[#2D1F1A] text-white shadow-xs"
                    : "text-[#6E5D53] hover:text-[#2D1F1A] hover:bg-[#EADBCE]/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#6E5D53] flex items-center gap-1.5 font-mono">
            <Filter className="w-3.5 h-3.5 text-[#C5924E]" />
            SHOWING {filteredBookings.length} RECORD{filteredBookings.length === 1 ? "" : "S"}
          </div>
        </div>

        {/* List Feed */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="bg-white/50 border border-[#EADBCE]/80 rounded-2xl p-16 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center mx-auto text-[#C5924E]">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#2D1F1A]">
                No Bookings Found
              </h3>
              <p className="text-xs text-[#6E5D53] max-w-xs mx-auto">
                Incoming viewing requests from interested tenants will appear here automatically.
              </p>
            </div>
          ) : (
            filteredBookings.map((slot) => {
              const property = slot.properties;
              const status = slot.status || "pending";
              const propertyImage =
                property?.images && property.images.length > 0
                  ? property.images[0]
                  : null;

              return (
                <div
                  key={slot.id}
                  onClick={() => handleCardClick(slot)}
                  className="bg-white/80 border border-[#EADBCE]/85 hover:border-[#C5924E] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] overflow-hidden flex items-center justify-center shrink-0">
                      {propertyImage ? (
                        <img
                          src={propertyImage}
                          alt={property?.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Building className="w-5 h-5 text-[#C5924E]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-serif font-bold text-[#2D1F1A] group-hover:text-[#C5924E] transition-colors">
                          {property?.title || "Property Visit"}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                            status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="text-xs text-[#6E5D53] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                        <span>{property?.location || "Location unavailable"}</span>
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#6E5D53] pt-1 font-mono">
                        <span className="flex items-center gap-1.5 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EADBCE]/60">
                          <Calendar className="w-3 h-3 text-[#C5924E]" />
                          <span className="text-[#2D1F1A]">{slot.date}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EADBCE]/60">
                          <Clock className="w-3 h-3 text-[#C5924E]" />
                          <span className="text-[#2D1F1A]">{slot.time_slot}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#FAF7F2]">
                    {status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleUpdateStatus(e, slot, "confirmed")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={(e) => handleUpdateStatus(e, slot, "rejected")}
                          className="px-3.5 py-1.5 bg-white border border-[#EADBCE] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#6E5D53] rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[9px] font-mono uppercase tracking-wider text-[#8A7568]">Rent</span>
                        <span className="text-xs font-serif font-bold text-[#2D1F1A]">
                          ₹{Number(property?.price || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53] group-hover:bg-[#C5924E] group-hover:text-white group-hover:border-[#C5924E] transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODERN GLASS POPUP MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#EADBCE] rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5924E]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4 relative z-10">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                  Tenant Profile
                </h3>
                <p className="text-[11px] text-[#6E5D53] font-mono">
                  Verified appointment contact info
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53] hover:text-[#2D1F1A] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8A7568] block">Name</span>
                    <span className="text-xs font-bold font-serif text-[#2D1F1A]">
                      {selectedBooking.profiles?.full_name || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8A7568] block">Email</span>
                    <span className="text-xs text-[#6E5D53]">
                      {selectedBooking.profiles?.email || "No email listed"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8A7568] block">Phone</span>
                    <span className="text-xs text-[#6E5D53] font-mono">
                      {selectedBooking.profiles?.phone || "No phone listed"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-2 px-1 text-[#6E5D53] font-mono">
                <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
                  <span className="text-[#8A7568]">Property</span>
                  <span className="text-[#2D1F1A] font-sans font-bold">{selectedBooking.properties?.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
                  <span className="text-[#8A7568]">Schedule</span>
                  <span className="text-[#2D1F1A]">{selectedBooking.date} • {selectedBooking.time_slot}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A7568]">Status</span>
                  <span className="text-[#C5924E] uppercase font-bold">{selectedBooking.status || "pending"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
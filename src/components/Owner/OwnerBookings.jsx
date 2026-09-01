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
} from "lucide-react";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // All, Pending, Confirmed, Rejected
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null); // State for tenant detail modal

  useEffect(() => {
    // 1. Automatically reset expired slots in the database first, then fetch
    resetExpiredSlots().then(() => {
      fetchOwnerBookings();
    });
  }, []);

  // Helper to free up expired slots in Supabase
  const resetExpiredSlots = async () => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    try {
      await supabase
        .from("property_visit_slots")
        .update({
          status: "available",
          is_booked: false,
          tenant_id: null,
        })
        .lt("date", today) // If date is in the past
        .neq("status", "available"); // Only update if not already available
    } catch (err) {
      console.error("Error clearing expired slots:", err);
    }
  };

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);

      // 1. Get current logged-in owner session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No active session found:", sessionError);
        return;
      }

      // 2. Fetch slots and properties
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

      // 3. Filter manually in JS to match owner's properties safely
      const ownerBookings = (slotsData || []).filter(
        (slot) =>
          slot.properties && slot.properties.owner_id === session.user.id
      );

      // 4. Filter out past dates instantly
      const today = new Date().toISOString().split("T")[0];
      const activeBookings = ownerBookings.filter((slot) => slot.date >= today);

      setBookings(activeBookings);
    } catch (err) {
      console.error("Error fetching owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle fetching tenant details securely via Postgres RPC function on click
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

  // Handle Owner Confirm (Accept) or Reject action + insert notification
  const handleUpdateStatus = async (e, slot, newStatus) => {
    e.stopPropagation(); // Prevent opening modal when clicking accept/reject
    try {
      const isConfirmed = newStatus === "confirmed";

      // 1. Update the booking slot status
      const { error: updateError } = await supabase
        .from("property_visit_slots")
        .update({
          status: newStatus,
          is_booked: isConfirmed,
        })
        .eq("id", slot.id);

      if (updateError) throw updateError;

      // 2. Send notification to the tenant
      if (slot.tenant_id) {
        const titleText = isConfirmed
          ? "Visit Request Accepted!"
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

      // Refresh bookings list instantly
      fetchOwnerBookings();
    } catch (err) {
      console.error("Error updating slot status:", err);
    }
  };

  // Calculate metrics for top cards dynamically
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending" || !b.status
  ).length;

  const estRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((acc, curr) => acc + Number(curr.properties?.price || 0), 0);

  // Filter bookings based on selected tab and search query
  const filteredBookings = bookings.filter((item) => {
    const title = item.properties?.title?.toLowerCase() || "";
    const location = item.properties?.location?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || location.includes(query);

    const slotStatus = item.status || "pending";
    if (filter === "All") return matchesSearch;
    if (filter === "Pending") return matchesSearch && slotStatus === "pending";
    if (filter === "Confirmed")
      return matchesSearch && slotStatus === "confirmed";
    if (filter === "Rejected")
      return matchesSearch && slotStatus === "rejected";

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-[#2D1F1A]">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
            Tenant Bookings 📝
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1">
            Track confirmed visit requests, lease agreements, and view tenant
            details by tapping a booking.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7568]" />
          <input
            type="text"
            placeholder="Search property or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EADBCE] rounded-2xl text-xs focus:outline-none focus:border-[#C5924E] shadow-sm"
          />
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E5D53]">
            <span>Total Bookings</span>
            <Users className="w-4 h-4 text-[#C5924E]" />
          </div>
          <div className="text-2xl font-bold text-[#2D1F1A]">
            {totalBookings}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E5D53]">
            <span>Active / Confirmed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#2D1F1A]">
            {activeBookings}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E5D53]">
            <span>Pending</span>
            <Clock3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#2D1F1A]">
            {pendingBookings}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E5D53]">
            <span>Est. Revenue</span>
            <span className="text-[#C5924E] font-bold">₹</span>
          </div>
          <div className="text-2xl font-bold text-[#2D1F1A]">
            ₹{estRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["All", "Pending", "Confirmed", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              filter === tab
                ? "bg-[#2D1F1A] text-white"
                : "bg-white text-[#6E5D53] border border-[#EADBCE] hover:bg-[#FAF7F2]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#EADBCE] rounded-3xl p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-[#C5924E] mx-auto opacity-60" />
            <h3 className="text-sm font-bold text-[#2D1F1A]">
              No Bookings Found
            </h3>
            <p className="text-xs text-[#6E5D53]">
              When tenants request booking slots, they will appear here for your
              review.
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
                className="bg-white border border-[#EADBCE] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#C5924E] cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {propertyImage ? (
                      <img
                        src={propertyImage}
                        alt={property?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-[#C5924E]" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#2D1F1A]">
                        {property?.title || "Property Visit"}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase flex items-center gap-1 ${
                          status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : status === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {status === "confirmed" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {status === "pending" && <Clock3 className="w-3 h-3" />}
                        {status === "rejected" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-[#6E5D53] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span>
                        {property?.location || "Location not specified"}
                      </span>
                    </p>

                    <p className="text-[11px] text-[#8A7568] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span>
                        Visit Scheduled:{" "}
                        <strong className="text-[#2D1F1A]">{slot.date}</strong>{" "}
                        at{" "}
                        <strong className="text-[#2D1F1A]">
                          {slot.time_slot}
                        </strong>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#F0E6D8]">
                  {status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) =>
                          handleUpdateStatus(e, slot, "confirmed")
                        }
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={(e) =>
                          handleUpdateStatus(e, slot, "rejected")
                        }
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  <div className="text-right pl-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8A7568]">
                      Rent
                    </span>
                    <span className="text-xs font-bold text-[#2D1F1A]">
                      ₹{Number(property?.price || 0).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TENANT DETAILS MODAL POPUP */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Tenant Details
                </h3>
                <p className="text-xs text-[#6E5D53]">
                  Contact information for this booking slot.
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53] hover:text-[#2D1F1A] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A7568] block">
                      Full Name
                    </span>
                    <strong className="text-sm text-[#2D1F1A]">
                      {selectedBooking.profiles?.full_name || "Not Provided"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A7568] block">
                      Email Address
                    </span>
                    <strong className="text-xs text-[#2D1F1A]">
                      {selectedBooking.profiles?.email || "No email available"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A7568] block">
                      Phone Number
                    </span>
                    <strong className="text-xs text-[#2D1F1A]">
                      {selectedBooking.profiles?.phone ||
                        "No phone number listed"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1.5 px-1 text-[#6E5D53]">
                <p>
                  <strong className="text-[#2D1F1A]">Property:</strong>{" "}
                  {selectedBooking.properties?.title}
                </p>
                <p>
                  <strong className="text-[#2D1F1A]">Scheduled Visit:</strong>{" "}
                  {selectedBooking.date} at {selectedBooking.time_slot}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-2xl transition-all shadow-sm cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
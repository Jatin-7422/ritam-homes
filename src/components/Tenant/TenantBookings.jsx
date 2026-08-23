import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  Building,
  Navigation,
  User,
  Phone,
  Mail,
  X,
} from "lucide-react";

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function TenantBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // All, Pending, Confirmed, Rejected
  const [searchQuery, setSearchQuery] = useState("");

  // State for Owner Details & Map Modal
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    // 1. Automatically reset expired slots in the database first, then fetch
    resetExpiredSlots().then(() => {
      fetchTenantBookings();
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

  const fetchTenantBookings = async () => {
    try {
      setLoading(true);

      // 1. Get current logged-in tenant session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No active session found:", sessionError);
        return;
      }

      // 2. Fetch all slots booked or requested by this tenant using correct schema columns
      const { data, error } = await supabase
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
            images,
            latitude,
            longitude
          )
        `,
        )
        .eq("tenant_id", session.user.id);

      if (error) throw error;

      // 3. Frontend double-check: filter out any past dates instantly
      const today = new Date().toISOString().split("T")[0];
      const activeBookings = (data || []).filter((slot) => slot.date >= today);

      setBookings(activeBookings);
    } catch (err) {
      console.error("Error fetching tenant bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch owner details securely when confirmed visit is clicked
  const handleOpenDetails = async (slot) => {
    if (slot.status !== "confirmed") return;

    setSelectedVisit(slot);
    setLoadingDetails(true);

    try {
      const { data, error } = await supabase.rpc(
        "get_confirmed_visit_owner_details",
        { slot_id: slot.id },
      );

      if (error) throw error;
      if (data && data.length > 0) {
        setOwnerDetails(data[0]);
      } else {
        setOwnerDetails(null);
      }
    } catch (err) {
      console.error("Error fetching owner details:", err);
      setOwnerDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter bookings based on the tab and search query
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
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            My Property Bookings 🏡
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1">
            Track your scheduled property visits, check request statuses, and
            view owner details upon confirmation.
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
              You haven't requested any property visit slots yet.
            </p>
          </div>
        ) : (
          filteredBookings.map((slot) => {
            const property = slot.properties;
            const status = slot.status || "pending";
            const isConfirmed = status === "confirmed";

            const propertyImage =
              property?.images && property.images.length > 0
                ? Array.isArray(property.images)
                  ? property.images[0]
                  : JSON.parse(property.images)[0]
                : null;

            return (
              <div
                key={slot.id}
                className="bg-white border border-[#EADBCE] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#C5924E]"
              >
                <div className="flex items-center gap-4">
                  {/* Property Image or Placeholder */}
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

                      {/* Status Badge */}
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
                          <CheckCircle2 className="w-3 h-3" />
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

                {/* Right Action / Price Section */}
                <div className="flex flex-col md:flex-end items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#F0E6D8]">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8A7568]">
                      Monthly Rent
                    </span>
                    <span className="text-xs font-bold text-[#2D1F1A]">
                      ₹{Number(property?.price || 0).toLocaleString()}/mo
                    </span>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleOpenDetails(slot)}
                      className="px-4 py-2 bg-[#C5924E] hover:bg-[#b07d3e] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" /> View Owner & Map
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRMED VISIT DETAILS MODAL (Owner Info & Leaflet Map) */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Confirmed Visit & Owner Details
                </h3>
                <p className="text-xs text-[#6E5D53]">
                  Property owner contact info and interactive map location.
                </p>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53] hover:text-[#2D1F1A] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-xs text-[#6E5D53]">
                Loading owner and location information...
              </div>
            ) : ownerDetails ? (
              <div className="space-y-4">
                {/* Owner Info Box */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5924E]">
                    Property Owner Contact
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A7568] block">
                        Name
                      </span>
                      <strong className="text-xs text-[#2D1F1A]">
                        {ownerDetails.owner_name}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A7568] block">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${ownerDetails.owner_phone}`}
                        className="text-xs font-bold text-blue-600 underline"
                      >
                        {ownerDetails.owner_phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A7568] block">
                        Email Address
                      </span>
                      <span className="text-xs text-[#2D1F1A]">
                        {ownerDetails.owner_email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map Integration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5924E]">
                      Property Location Map
                    </h4>
                    {(() => {
                      const lat = Number(
                        selectedVisit.properties?.latitude ||
                          ownerDetails.latitude ||
                          12.9716,
                      );
                      const lng = Number(
                        selectedVisit.properties?.longitude ||
                          ownerDetails.longitude ||
                          77.5946,
                      );
                      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                      return (
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#C5924E] hover:underline flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" /> Get Directions
                        </a>
                      );
                    })()}
                  </div>

                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-[#EADBCE] z-0 relative">
                    {(() => {
                      const lat = Number(
                        selectedVisit.properties?.latitude ||
                          ownerDetails.latitude ||
                          12.9716,
                      );
                      const lng = Number(
                        selectedVisit.properties?.longitude ||
                          ownerDetails.longitude ||
                          77.5946,
                      );

                      return (
                        <MapContainer
                          center={[lat, lng]}
                          zoom={14}
                          scrollWheelZoom={false}
                          style={{ width: "100%", height: "100%" }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[lat, lng]}>
                            <Popup>
                              <div className="text-xs font-bold">
                                {selectedVisit.properties?.title ||
                                  "Property Location"}
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      );
                    })()}
                  </div>
                  <p className="text-[11px] text-[#6E5D53] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                    <span>
                      {ownerDetails.property_location ||
                        selectedVisit.properties?.location ||
                        "Location coordinates pinned"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500 text-center py-6">
                Could not load details for this booking slot.
              </p>
            )}

            <button
              onClick={() => setSelectedVisit(null)}
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

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
  Home,
  ExternalLink,
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
    resetExpiredSlots().then(() => {
      fetchTenantBookings();
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

  const fetchTenantBookings = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No active session found:", sessionError);
        return;
      }

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

      const today = new Date().toISOString().split("T")[0];
      const activeBookings = (data || []).filter((slot) => slot.date >= today);

      setBookings(activeBookings);
    } catch (err) {
      console.error("Error fetching tenant bookings:", err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 w-full">
        <Loader2 className="w-9 h-9 animate-spin text-[#C5924E]" />
        <p className="text-xs font-semibold text-[#8A7568] tracking-wider uppercase animate-pulse">
          Loading your visits...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 sm:space-y-8 text-[#2D1F1A]">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#EADBCE]/70 shadow-xs w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] text-[10px] font-bold tracking-widest uppercase">
            <Home className="w-3 h-3" /> Tenant Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
            My Property Bookings 🏡
          </h1>
          <p className="text-xs text-[#6E5D53] max-w-2xl">
            Track your scheduled property visits, check approval statuses, and connect directly with owners upon confirmation.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7568]" />
          <input
            type="text"
            placeholder="Search property or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-2xl text-xs font-medium text-[#2D1F1A] placeholder-[#8A7568] focus:outline-none focus:border-[#C5924E] focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7568] hover:text-[#2D1F1A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
        {["All", "Pending", "Confirmed", "Rejected"].map((tab) => {
          const count = 
            tab === "All" ? bookings.length : 
            bookings.filter(b => (b.status || "pending") === tab.toLowerCase()).length;
            
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 shrink-0 cursor-pointer ${
                filter === tab
                  ? "bg-[#2D1F1A] text-white shadow-md scale-102"
                  : "bg-white text-[#6E5D53] border border-[#EADBCE] hover:bg-[#FAF7F2] hover:border-[#C5924E]/50"
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === tab ? "bg-white/20 text-white" : "bg-[#FAF7F2] text-[#8A7568] border border-[#EADBCE]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-4 w-full">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#EADBCE] rounded-3xl p-12 text-center space-y-3 shadow-xs w-full">
            <div className="w-14 h-14 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl flex items-center justify-center mx-auto text-[#C5924E]">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2D1F1A]">
              No Bookings Found
            </h3>
            <p className="text-xs text-[#6E5D53] max-w-sm mx-auto">
              {searchQuery ? "No matches found for your search query." : "You haven't requested any property visit slots yet, or your past visits have expired."}
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
                className="bg-white border border-[#EADBCE] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 hover:border-[#C5924E] hover:shadow-md hover:-translate-y-0.5 group w-full"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Property Image or Placeholder */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {propertyImage ? (
                      <img
                        src={propertyImage}
                        alt={property?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-[#C5924E]" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#2D1F1A] font-serif">
                        {property?.title || "Property Visit"}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase flex items-center gap-1.5 shadow-2xs ${
                          status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {status === "confirmed" && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        {status === "pending" && <Clock3 className="w-3 h-3 text-amber-600" />}
                        {status === "rejected" && (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{status}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#6E5D53] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span className="truncate max-w-md sm:max-w-xl">
                        {property?.location || "Location not specified"}
                      </span>
                    </p>

                    <div className="flex items-center gap-3 pt-0.5 text-[11px] text-[#8A7568] flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#EADBCE]">
                        <Calendar className="w-3 h-3 text-[#C5924E]" />
                        <strong className="text-[#2D1F1A]">{slot.date}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#EADBCE]">
                        <Clock className="w-3 h-3 text-[#C5924E]" />
                        <strong className="text-[#2D1F1A]">{slot.time_slot}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action / Price Section */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#FAF7F2]">
                  <div className="text-left md:text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8A7568]">
                      Monthly Rent
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#2D1F1A]">
                      ₹{Number(property?.price || 0).toLocaleString()}
                      <span className="text-[10px] text-[#8A7568] font-normal">/mo</span>
                    </span>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleOpenDetails(slot)}
                      className="px-4 py-2.5 bg-[#C5924E] hover:bg-[#b07d3e] text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
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

      {/* CONFIRMED VISIT DETAILS MODAL */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-2xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5924E]">
                  Confirmed Appointment
                </span>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Owner & Property Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53] hover:text-[#2D1F1A] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#6E5D53]">
                <Loader2 className="w-6 h-6 animate-spin text-[#C5924E]" />
                <p>Loading owner and map coordinates...</p>
              </div>
            ) : ownerDetails ? (
              <div className="space-y-5">
                {/* Owner Info Box */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-3 shadow-2xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5924E]">
                    Contact Credentials
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#EADBCE]/60">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-[#8A7568] block">Owner Name</span>
                        <strong className="text-xs text-[#2D1F1A] truncate block">
                          {ownerDetails.owner_name}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#EADBCE]/60">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-[#8A7568] block">Phone Number</span>
                        <a
                          href={`tel:${ownerDetails.owner_phone}`}
                          className="text-xs font-bold text-blue-600 hover:underline truncate block"
                        >
                          {ownerDetails.owner_phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#EADBCE]/60">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-[#8A7568] block">Email Address</span>
                      <span className="text-xs text-[#2D1F1A] truncate block">
                        {ownerDetails.owner_email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map Integration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5924E]">
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
                          className="text-[11px] font-bold text-[#C5924E] hover:underline flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#EADBCE]"
                        >
                          <ExternalLink className="w-3 h-3" /> Get Directions
                        </a>
                      );
                    })()}
                  </div>

                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-[#EADBCE] z-0 relative shadow-inner">
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
                              <div className="text-xs font-bold text-[#2D1F1A]">
                                {selectedVisit.properties?.title ||
                                  "Property Location"}
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      );
                    })()}
                  </div>
                  <p className="text-[11px] text-[#6E5D53] flex items-center gap-1.5 px-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                    <span className="truncate">
                      {ownerDetails.property_location ||
                        selectedVisit.properties?.location ||
                        "Coordinates pinned accurately"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500 text-center py-6 font-medium">
                Could not load confirmed contact details for this booking slot.
              </p>
            )}

            <button
              onClick={() => setSelectedVisit(null)}
              className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-2xl transition-all shadow-sm cursor-pointer active:scale-98"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
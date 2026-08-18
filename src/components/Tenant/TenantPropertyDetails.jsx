import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  MessageSquare,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Home,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Building,
  Layers,
  Car,
  Utensils,
  Compass,
  Droplet,
  Users,
} from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Visit booking state variables
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Simple toast trigger helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (err) {
      console.error("Error fetching property details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Tenant Booking Submission
  const handleBookVisit = async (e) => {
    e.preventDefault();
    if (!visitDate || !visitTime) {
      showToast("Please select both a date and a time slot.");
      return;
    }

    try {
      setBookingLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        showToast("Please log in as a tenant to book a visit.");
        return;
      }

      const user = session.user;
      const metadata = user.user_metadata || {};

      const tenantName =
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "Tenant";
      const tenantEmail = user.email || "";
      const tenantPhone = metadata.phone || "";

      const ownerId = property?.owner_id || property?.user_id;

      if (!ownerId) {
        showToast("Error: Property owner information is missing.");
        return;
      }

      const { error: insertError } = await supabase
        .from("visit_requests")
        .insert([
          {
            property_id: property.id,
            tenant_id: user.id,
            owner_id: ownerId,
            tenant_name: tenantName,
            tenant_email: tenantEmail,
            tenant_phone: tenantPhone,
            visit_date: visitDate,
            visit_time: visitTime,
            status: "Pending",
          },
        ]);

      if (insertError) {
        console.error("Error inserting visit request:", insertError);
        showToast("Failed to submit visit request. Try again.");
      } else {
        showToast("Visit request successfully sent to the owner!");
        setVisitDate("");
        setVisitTime("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      showToast("An unexpected error occurred.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Home className="w-12 h-12 text-[#C5924E]" />
        <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
          Property Not Found
        </h2>
        <p className="text-xs text-[#6E5D53]">
          The property you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/tenant-dashboard/explore"
          className="px-4 py-2 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  let imagesList = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  ];
  if (Array.isArray(property.images) && property.images.length > 0) {
    imagesList = property.images;
  } else if (property.image_url) {
    imagesList = [property.image_url];
  }

  const nextImage = () =>
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  const prevImage = () =>
    setActiveImageIndex(
      (prev) => (prev - 1 + imagesList.length) % imagesList.length,
    );

  const monthlyRent = Number(property.price || 0);
  const securityDeposit = property.security_deposit || monthlyRent * 2;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-[#2D1F1A] relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-[#2D1F1A] text-white text-xs font-bold rounded-2xl shadow-xl border border-[#C5924E] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/tenant-dashboard/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E5D53] hover:text-[#2D1F1A] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5924E]" />
          <span>Back to Explore</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? "fill-rose-600 text-rose-600" : "text-[#2D1F1A]"}`}
            />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs font-bold shadow-sm transition-all">
            <Share2 className="w-4 h-4 text-[#C5924E]" />
            <span>Share</span>
          </button>

          <a
            href="#book-visit"
            className="flex items-center gap-2 px-5 py-2 bg-[#C5924E] hover:bg-[#B38141] text-white rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Book a Visit</span>
          </a>
        </div>
      </div>

      {/* Property Title & Location */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          {property.title}
        </h1>
        <p className="text-xs text-[#6E5D53] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#C5924E] shrink-0" />
          <span>{property.location}</span>
        </p>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Gallery & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image Viewer */}
          <div className="relative h-[420px] rounded-3xl overflow-hidden border border-[#EADBCE] shadow-sm bg-slate-100 group">
            <img
              src={imagesList[activeImageIndex]}
              alt="Property"
              className="w-full h-full object-cover transition-all duration-500"
            />

            <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-[#2D1F1A] shadow-sm border border-[#EADBCE]">
              {property.status || "Active"}
            </span>

            <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-xs font-bold">
              {activeImageIndex + 1} / {imagesList.length}
            </span>

            {imagesList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {imagesList.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageIndex === idx
                      ? "border-[#C5924E] shadow-sm scale-105"
                      : "border-[#EADBCE] opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* About This Property */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              About This Property
            </h3>
            <p className="text-xs text-[#6E5D53] leading-relaxed">
              {property.description ||
                "Well-maintained property with great features and connectivity."}
            </p>

            {/* Tenant Preferences & Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#F0E6D8]">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#8A7568] uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#C5924E]" /> Preferred
                  Tenants
                </span>
                <p className="text-xs font-bold text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-xl border border-[#EADBCE]">
                  {property.preferred_tenants || "Not specified"}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#8A7568] uppercase tracking-wider flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-[#C5924E]" /> Food /
                  Cooking Preference
                </span>
                <p className="text-xs font-bold text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-xl border border-[#EADBCE]">
                  {property.food_preference || "Not specified"}
                </p>
              </div>
            </div>

            {/* Amenities & Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-[#F0E6D8]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7568]">
                Amenities & Nearby Places
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities?.lift && (
                  <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                    <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{" "}
                    <span>Lift Available</span>
                  </div>
                )}
                {property.water_supply && (
                  <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                    <Droplet className="w-4 h-4 text-[#C5924E]" />{" "}
                    <span>Water: {property.water_supply}</span>
                  </div>
                )}
                {property.amenities?.securityGuard && (
                  <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                    <ShieldCheck className="w-4 h-4 text-[#C5924E]" />{" "}
                    <span>Security Guard</span>
                  </div>
                )}
                {property.amenities?.schoolsNearby && (
                  <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                    <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{" "}
                    <span>Schools Nearby</span>
                  </div>
                )}
                {property.amenities?.hospitalNearby && (
                  <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                    <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{" "}
                    <span>Hospital Nearby</span>
                  </div>
                )}
                {property.amenities?.parkNearby && (
                  <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                    <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{" "}
                    <span>Park Nearby</span>
                  </div>
                )}
                {Array.isArray(property.custom_amenities) &&
                  property.custom_amenities.map((custom, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{" "}
                      <span>{custom}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Interactive Visit Booking Form */}
        <div className="space-y-6">
          {/* Pricing & Booking Card */}
          <div
            id="book-visit"
            className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-6"
          >
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-[#2D1F1A]">
                  ₹{monthlyRent.toLocaleString()}
                </span>
                <span className="text-xs text-[#6E5D53]">/month</span>
              </div>
              <p className="text-xs text-[#8A7568] mt-0.5">
                Security Deposit: ₹{Number(securityDeposit).toLocaleString()}
              </p>
            </div>

            {/* Quick Stat Chips */}
            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[#F0E6D8] text-xs text-[#6E5D53]">
              <span className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-[#C5924E]" />{" "}
                {property.configuration || "1 BHK"}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-[#C5924E]" />{" "}
                {property.bathrooms || "2"} Baths
              </span>
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-[#C5924E]" />{" "}
                {property.built_up_area || "950"} sq.ft
              </span>
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#C5924E]" />{" "}
                {property.furnishing || "Furnished"}
              </span>
            </div>

            {/* Interactive Schedule Visit Form */}
            <form onSubmit={handleBookVisit} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7568]">
                Schedule a Visit
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-[#6E5D53] mb-1">
                  Select Visit Date
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6E5D53] mb-1">
                  Select Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 11:00 AM"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Calendar className="w-4 h-4 text-[#C5924E]" />
                )}
                <span>
                  {bookingLoading ? "Submitting Request..." : "Request Visit"}
                </span>
              </button>

              <a
                href={`/tenant-dashboard/messages?owner=${property.owner_id || ""}`}
                className="w-full py-3 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] text-[#2D1F1A] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-[#C5924E]" />
                <span>Chat with Owner</span>
              </a>
            </form>
          </div>

          {/* Property Specifications */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
              Property Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#C5924E]" /> Property Type
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.type || "Apartment"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                  Configuration
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.configuration || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#C5924E]" /> Built-up
                  Area
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.built_up_area || "N/A"} sq. ft.
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#C5924E]" /> Floor
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.floor || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#C5924E]" /> Furnishing
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.furnishing || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#C5924E]" /> Parking
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.parking || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5 text-[#C5924E]" /> Bathrooms
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.bathrooms || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#C5924E]" /> Water
                  Supply
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.water_supply || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8]">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C5924E]" /> Facing
                  (Vastu)
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.facing || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#8A7568] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C5924E]" /> Listed On
                </span>
                <span className="font-bold text-[#2D1F1A]">
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "Recently Added"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

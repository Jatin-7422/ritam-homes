import React, { useState, useEffect, useRef } from "react";
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
  Droplet,
  Users,
  Clock,
  Check,
} from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [suggestedProperties, setSuggestedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Selected visit slot state variables
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Carousel refs
  const desktopCarouselRef = useRef(null);
  const mobileCarouselRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (id) {
      fetchPropertyAndData();
      trackUniquePropertyView(id);
      checkIfSaved(id);
    }
  }, [id]);

  const trackUniquePropertyView = async (propertyId) => {
    try {
      const { data: prop } = await supabase
        .from("properties")
        .select("views")
        .eq("id", propertyId)
        .single();

      const currentViews = prop?.views || 0;
      await supabase
        .from("properties")
        .update({ views: currentViews + 1 })
        .eq("id", propertyId);
    } catch (err) {
      console.error("View tracking error:", err);
    }
  };

  const checkIfSaved = async (propertyId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;

      const { data } = await supabase
        .from("saved_properties")
        .select("id")
        .eq("tenant_id", session.user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (data) {
        setIsSaved(true);
      }
    } catch (err) {
      console.log("Saved check note:", err);
    }
  };

  const handleToggleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        showToast("Please log in to save properties.");
        return;
      }

      const userId = session.user.id;

      if (isSaved) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("tenant_id", userId)
          .eq("property_id", id);

        if (error) throw error;
        setIsSaved(false);
        showToast("Property removed from saved.");
      } else {
        const { error } = await supabase
          .from("saved_properties")
          .insert([{ tenant_id: userId, property_id: id }]);

        if (error) throw error;
        setIsSaved(true);
        showToast("Property saved successfully!");
      }
    } catch (err) {
      console.error("Save toggle error:", err);
      showToast("Could not update saved status.");
    }
  };

  const handleCardToggleSave = async (e, propId) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        showToast("Please log in to save properties.");
        return;
      }

      const userId = session.user.id;

      const { data: existing } = await supabase
        .from("saved_properties")
        .select("id")
        .eq("tenant_id", userId)
        .eq("property_id", propId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("saved_properties")
          .delete()
          .eq("tenant_id", userId)
          .eq("property_id", propId);
        showToast("Removed from saved properties.");
      } else {
        await supabase
          .from("saved_properties")
          .insert([{ tenant_id: userId, property_id: propId }]);
        showToast("Added to saved properties!");
      }
    } catch (err) {
      console.error("Card save toggle error:", err);
      showToast("Could not update saved status.");
    }
  };

  const fetchPropertyAndData = async () => {
    try {
      setLoading(true);

      const { data: propData, error: propError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (propError) throw propError;
      setProperty(propData);

      const today = new Date().toISOString().split("T")[0];
      const { data: slotData } = await supabase
        .from("property_visit_slots")
        .select("*")
        .eq("property_id", id)
        .eq("is_booked", false)
        .gte("date", today)
        .order("date", { ascending: true });

      setAvailableSlots(slotData || []);

      if (propData?.location) {
        const { data: suggestionData } = await supabase
          .from("properties")
          .select("*")
          .ilike("location", `%${propData.location.split(",")[0]}%`)
          .neq("id", id)
          .limit(8);

        if (suggestionData && suggestionData.length > 0) {
          setSuggestedProperties(suggestionData);
        } else {
          const { data: fallbackData } = await supabase
            .from("properties")
            .select("*")
            .neq("id", id)
            .limit(8);
          setSuggestedProperties(fallbackData || []);
        }
      }
    } catch (err) {
      console.error("Error loading property:", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.75;
      ref.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleBookVisit = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      showToast("Please select an available visit slot from the list.");
      return;
    }

    try {
      setBookingLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        showToast("Please log in as a tenant to book a visit.");
        return;
      }

      const { error: updateError } = await supabase
        .from("property_visit_slots")
        .update({
          status: "pending",
          tenant_id: session.user.id,
          is_booked: false,
        })
        .eq("id", selectedSlotId);

      if (updateError) throw updateError;

      showToast("Visit request sent to the owner for approval!");
      setSelectedSlotId(null);
      fetchPropertyAndData();
    } catch (err) {
      console.error("Booking error:", err);
      showToast("Failed to send booking request.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleChatWithOwner = async () => {
    try {
      setChatLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast("Please log in to chat with the owner.");
        return;
      }

      if (!property?.owner_id) {
        showToast("Owner details are not available.");
        return;
      }

      const { data: existingChat } = await supabase
        .from("messages")
        .select("id")
        .eq("sender_id", user.id)
        .eq("receiver_id", property.owner_id)
        .eq("property_id", property.id)
        .maybeSingle();

      if (!existingChat) {
        await supabase.from("messages").insert([
          {
            sender_id: user.id,
            receiver_id: property.owner_id,
            property_id: property.id,
            content: `Hi, I am interested in your property: ${property.title}`,
            is_read: false,
          },
        ]);
      }

      window.location.href = `/tenant-dashboard/messages?owner=${property.owner_id}`;
    } catch (err) {
      console.error("Chat error:", err);
      showToast("Could not start chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center space-y-4 px-4 text-center bg-[#FDFBF7]">
        <Home className="w-12 h-12 text-[#C5924E]" />
        <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">Property Not Found</h2>
        <Link to="/tenant-dashboard/explore" className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-2xl shadow-md">
          Back to Explore
        </Link>
      </div>
    );
  }

  let imagesList = ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"];
  if (Array.isArray(property.images) && property.images.length > 0) {
    imagesList = property.images;
  } else if (property.image_url) {
    imagesList = [property.image_url];
  }

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);

  const monthlyRent = Number(property.price || 0);
  const securityDeposit = property.security_deposit || monthlyRent * 2;

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] text-[#2D1F1A] pb-24 overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-[#2D1F1A] text-white text-xs font-bold rounded-2xl shadow-2xl border border-[#C5924E] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden lg:block w-full px-6 lg:px-12 pt-6 space-y-6">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between w-full">
          <Link
            to="/tenant-dashboard/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E5D53] hover:text-[#2D1F1A] bg-white px-4 py-2.5 rounded-2xl border border-[#EADBCE] shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#C5924E]" />
            <span>Back to Explore</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-600 text-rose-600" : "text-[#2D1F1A]"}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied to clipboard!");
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#C5924E]" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#C5924E]/10 text-[#C5924E] border border-[#C5924E]/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              {property.status || "Verified Listing"}
            </span>
            <span className="px-3 py-1 bg-[#2D1F1A] text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              {property.type || "Apartment"}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#2D1F1A]">
            {property.title}
          </h1>
          <p className="text-sm text-[#6E5D53] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C5924E] shrink-0" />
            <span>{property.location}</span>
          </p>
        </div>

        {/* MAIN FULL-WIDTH GRID */}
        <div className="grid grid-cols-12 gap-8 items-start w-full">
          
          {/* LEFT COLUMN */}
          <div className="col-span-7 space-y-6 w-full">
            <div className="relative w-full h-[480px] rounded-3xl overflow-hidden border border-[#EADBCE] shadow-md bg-slate-100 group">
              <img
                src={imagesList[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute bottom-4 left-4 px-3.5 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-xl text-xs font-bold tracking-wide">
                {activeImageIndex + 1} / {imagesList.length} Photos
              </div>

              {imagesList.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {imagesList.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-20 shrink-0 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImageIndex === idx ? "border-[#C5924E] shadow-sm scale-105" : "border-[#EADBCE] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                <Bed className="w-5 h-5 text-[#C5924E] mx-auto mb-1" />
                <span className="block text-[10px] text-[#8A7568] uppercase font-bold">Configuration</span>
                <span className="text-sm font-bold text-[#2D1F1A]">{property.configuration || "1 BHK"}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                <Bath className="w-5 h-5 text-[#C5924E] mx-auto mb-1" />
                <span className="block text-[10px] text-[#8A7568] uppercase font-bold">Bathrooms</span>
                <span className="text-sm font-bold text-[#2D1F1A]">{property.bathrooms || "1"} Bath</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                <Maximize2 className="w-5 h-5 text-[#C5924E] mx-auto mb-1" />
                <span className="block text-[10px] text-[#8A7568] uppercase font-bold">Area</span>
                <span className="text-sm font-bold text-[#2D1F1A]">{property.built_up_area || "950"} sq.ft</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                <Home className="w-5 h-5 text-[#C5924E] mx-auto mb-1" />
                <span className="block text-[10px] text-[#8A7568] uppercase font-bold">Furnishing</span>
                <span className="text-sm font-bold text-[#2D1F1A] truncate block">{property.furnishing || "Furnished"}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm space-y-6">
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">About This Property</h3>
              <p className="text-sm text-[#6E5D53] leading-relaxed whitespace-pre-line">
                {property.description || "Well-maintained property with great features, excellent natural light, and smooth connectivity."}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F0E6D8]">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#8A7568] uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#C5924E]" /> Preferred Tenants
                  </span>
                  <p className="text-xs font-bold text-[#2D1F1A] bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EADBCE]">
                    {property.preferred_tenants || "Family / Working Professionals"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#8A7568] uppercase tracking-wider flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-[#C5924E]" /> Food Preference
                  </span>
                  <p className="text-xs font-bold text-[#2D1F1A] bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EADBCE]">
                    {property.food_preference || "No Restrictions"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F0E6D8]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7568]">Amenities & Facilities</h4>
                <div className="grid grid-cols-3 gap-3">
                  {property.amenities?.lift !== false && (
                    <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-2xl border border-[#EADBCE]">
                      <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                      <span className="truncate">Lift Available</span>
                    </div>
                  )}
                  {property.water_supply && (
                    <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-2xl border border-[#EADBCE]">
                      <Droplet className="w-4 h-4 text-[#C5924E] shrink-0" />
                      <span className="truncate">Water: {property.water_supply}</span>
                    </div>
                  )}
                  {property.amenities?.securityGuard && (
                    <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-2xl border border-[#EADBCE]">
                      <ShieldCheck className="w-4 h-4 text-[#C5924E] shrink-0" />
                      <span className="truncate">Security Guard</span>
                    </div>
                  )}
                  {property.amenities?.schoolsNearby !== false && (
                    <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-2xl border border-[#EADBCE]">
                      <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                      <span className="truncate">Schools Nearby</span>
                    </div>
                  )}
                  {property.amenities?.hospitalNearby !== false && (
                    <div className="flex items-center gap-2 text-xs text-[#2D1F1A] bg-[#FAF7F2] p-3 rounded-2xl border border-[#EADBCE]">
                      <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                      <span className="truncate">Hospital Nearby</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-[#2D1F1A]">Comprehensive Specifications</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Home className="w-4 h-4 text-[#C5924E]" /> Property Type</span>
                  <span className="font-bold text-[#2D1F1A]">{property.type || "Apartment"}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Layers className="w-4 h-4 text-[#C5924E]" /> Configuration</span>
                  <span className="font-bold text-[#2D1F1A]">{property.configuration || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Maximize2 className="w-4 h-4 text-[#C5924E]" /> Built-up Area</span>
                  <span className="font-bold text-[#2D1F1A]">{property.built_up_area || "N/A"} sq. ft.</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Building className="w-4 h-4 text-[#C5924E]" /> Floor Level</span>
                  <span className="font-bold text-[#2D1F1A]">{property.floor || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Home className="w-4 h-4 text-[#C5924E]" /> Furnishing</span>
                  <span className="font-bold text-[#2D1F1A]">{property.furnishing || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Car className="w-4 h-4 text-[#C5924E]" /> Parking Space</span>
                  <span className="font-bold text-[#2D1F1A]">{property.parking || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Bath className="w-4 h-4 text-[#C5924E]" /> Bathrooms</span>
                  <span className="font-bold text-[#2D1F1A]">{property.bathrooms || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
                  <span className="text-[#8A7568] flex items-center gap-2"><Droplet className="w-4 h-4 text-[#C5924E]" /> Water Supply</span>
                  <span className="font-bold text-[#2D1F1A]">{property.water_supply || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-5 space-y-6 sticky top-6 w-full">
            <div className="bg-white rounded-3xl p-7 border border-[#EADBCE] shadow-xl space-y-6">
              
              <div className="flex items-baseline justify-between pb-4 border-b border-[#F0E6D8]">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-bold text-[#2D1F1A]">
                      ₹{monthlyRent.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#6E5D53]">/month</span>
                  </div>
                  <p className="text-xs text-[#8A7568] mt-1">
                    Security Deposit: ₹{Number(securityDeposit).toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                  Ready to Move
                </span>
              </div>

              <form onSubmit={handleBookVisit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7568]">
                    Select Owner's Visit Slot
                  </h4>
                  <span className="text-[10px] text-[#C5924E] font-bold">
                    {availableSlots.length} slots available
                  </span>
                </div>

                {availableSlots.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                    <p className="font-bold">No open slots available</p>
                    <p className="text-[11px] leading-relaxed">
                      The owner hasn't listed specific open slots yet. You can still reach out directly via live chat.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                            setSelectedDate(slot.date);
                            setSelectedTimeSlot(slot.time_slot);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-md scale-[1.01]"
                              : "bg-[#FAF7F2] text-[#2D1F1A] border-[#EADBCE] hover:bg-[#F2ECE1]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#C5924E] text-white" : "bg-[#C5924E]/10 text-[#C5924E]"}`}>
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <strong className={`block text-xs font-bold ${isSelected ? "text-white" : "text-[#2D1F1A]"}`}>
                                {slot.date}
                              </strong>
                              <span className={`text-[11px] ${isSelected ? "text-[#D9C4B0]" : "text-[#6E5D53]"}`}>
                                {slot.time_slot}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-[#C5924E] rounded-full flex items-center justify-center text-white shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading || availableSlots.length === 0}
                  className={`w-full py-4 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    availableSlots.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#2D1F1A] hover:bg-[#3E2E27] text-white cursor-pointer"
                  }`}
                >
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Calendar className="w-4 h-4 text-[#C5924E]" />}
                  <span>{bookingLoading ? "Submitting Request..." : "Request Property Visit"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleChatWithOwner}
                  disabled={chatLoading}
                  className="w-full py-4 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] text-[#2D1F1A] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" /> : <MessageSquare className="w-4 h-4 text-[#C5924E]" />}
                  <span>{chatLoading ? "Opening Chat..." : "Chat with Owner Directly"}</span>
                </button>
              </form>

              <div className="pt-4 border-t border-[#F0E6D8] flex items-center gap-3 text-xs text-[#6E5D53]">
                <div className="w-10 h-10 rounded-2xl bg-[#C5924E]/10 flex items-center justify-center text-[#C5924E] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#2D1F1A] font-bold">Ritam Verified Guarantee</strong>
                  <span className="text-[11px]">Direct owner interaction with secure visit scheduling.</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* AMAZON-STYLE RECOMMENDATIONS (DESKTOP) - CLEAN CARD LAYOUT MATCHING EXPLORE FEED */}
        {suggestedProperties.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#EADBCE] space-y-6 w-full">
            <div className="flex items-end justify-between px-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5924E]">
                  Based on this location
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                  Similar Properties in {property.location?.split(",")[0] || "This Area"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel(desktopCarouselRef, "left")}
                  className="p-2.5 rounded-full bg-white border border-[#EADBCE] text-[#2D1F1A] hover:bg-[#FAF7F2] shadow-sm transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel(desktopCarouselRef, "right")}
                  className="p-2.5 rounded-full bg-white border border-[#EADBCE] text-[#2D1F1A] hover:bg-[#FAF7F2] shadow-sm transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={desktopCarouselRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth scrollbar-none snap-x"
            >
              {suggestedProperties.map((item) => {
                let itemImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
                if (Array.isArray(item.images) && item.images.length > 0) {
                  itemImage = item.images[0];
                } else if (item.image_url) {
                  itemImage = item.image_url;
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.location.href = `/tenant-dashboard/property/${item.id}`;
                    }}
                    className="w-[280px] shrink-0 bg-white rounded-3xl border border-[#EADBCE] shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden snap-start flex flex-col group"
                  >
                    {/* Clean Image Container with Heart Action */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 m-2 rounded-2xl">
                      <img
                        src={itemImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#2D1F1A]/80 backdrop-blur-md text-white rounded-lg text-[9px] font-bold uppercase tracking-wider">
                        {item.type || "Independent house"}
                      </div>
                      <button
                        onClick={(e) => handleCardToggleSave(e, item.id)}
                        className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all cursor-pointer"
                        title="Save property"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                      </button>
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-[#2D1F1A]/90 backdrop-blur-md text-white rounded-lg text-xs font-bold shadow-md">
                        ₹{Number(item.price || 0).toLocaleString()} /mo
                      </div>
                    </div>

                    {/* Card Content Matching Feed Structure */}
                    <div className="px-4 pb-4 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#2D1F1A] truncate group-hover:text-[#C5924E] transition-colors">
                          {item.configuration || item.title || "2bhk"}
                        </h4>
                        <p className="text-[11px] text-[#6E5D53] flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#C5924E] shrink-0" />
                          <span>{item.location}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F0E6D8] flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#2D1F1A]">{item.configuration || "BHK"}</span>
                        <span className="text-[#6E5D53] hover:text-[#C5924E] font-bold flex items-center gap-0.5">
                          View details
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>


      {/* ================= MOBILE VIEW ================= */}
      <div className="block lg:hidden w-full max-w-md mx-auto px-3 pt-4 space-y-4 text-left">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between w-full">
          <Link
            to="/tenant-dashboard/explore"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6E5D53] hover:text-[#2D1F1A] bg-white px-3.5 py-2 rounded-xl border border-[#EADBCE] shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C5924E]" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-600 text-rose-600" : "text-[#2D1F1A]"}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied to clipboard!");
                }
              }}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C5924E]" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-1 w-full text-left">
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A] tracking-tight">
            {property.title}
          </h1>
          <p className="text-xs text-[#6E5D53] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
            <span>{property.location}</span>
          </p>
        </div>

        {/* IMAGE CARD CONTAINER */}
        <div className="bg-white rounded-3xl p-3 border border-[#EADBCE] shadow-sm space-y-3 w-full">
          <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-[#EADBCE] bg-slate-100 group">
            <img
              src={imagesList[activeImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-md text-[#2D1F1A] border border-[#EADBCE] rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
              {property.status || "Active"}
            </div>
            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-bold tracking-wide">
              {activeImageIndex + 1} / {imagesList.length}
            </div>

            {imagesList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {imagesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {imagesList.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-12 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageIndex === idx ? "border-[#C5924E] shadow-sm scale-105" : "border-[#EADBCE] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRICING & SPECIFICATIONS GRID CARD */}
        <div className="bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-sm space-y-4 w-full">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-serif font-bold text-[#C5924E]">
                ₹{monthlyRent.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#6E5D53]">/ month</span>
            </div>
          </div>
          <p className="text-[11px] text-[#8A7568]">
            Security Deposit: ₹{Number(securityDeposit).toLocaleString()}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
              <Bed className="w-4 h-4 text-[#C5924E] shrink-0" />
              <div>
                <span className="block text-[9px] text-[#8A7568] uppercase font-bold">Configuration</span>
                <span className="text-xs font-bold text-[#2D1F1A]">{property.configuration || "2 BHK"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
              <Bath className="w-4 h-4 text-[#C5924E] shrink-0" />
              <div>
                <span className="block text-[9px] text-[#8A7568] uppercase font-bold">Bathrooms</span>
                <span className="text-xs font-bold text-[#2D1F1A]">{property.bathrooms || "1"} Baths</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
              <Maximize2 className="w-4 h-4 text-[#C5924E] shrink-0" />
              <div>
                <span className="block text-[9px] text-[#8A7568] uppercase font-bold">Built-up Area</span>
                <span className="text-xs font-bold text-[#2D1F1A]">{property.built_up_area || "1200"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]">
              <Home className="w-4 h-4 text-[#C5924E] shrink-0" />
              <div>
                <span className="block text-[9px] text-[#8A7568] uppercase font-bold">Furnishing</span>
                <span className="text-xs font-bold text-[#2D1F1A] truncate block">{property.furnishing || "Semi-furnished"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT THIS PROPERTY CARD */}
        <div className="bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-sm space-y-4 w-full text-left">
          <h3 className="text-sm font-serif font-bold text-[#2D1F1A]">About This Property</h3>
          <p className="text-xs text-[#6E5D53] leading-relaxed">
            {property.description || property.location}
          </p>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[#8A7568] uppercase tracking-wider block">
              Preferred Tenants
            </span>
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] text-xs font-bold text-[#2D1F1A]">
              {property.preferred_tenants || "Family"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[#8A7568] uppercase tracking-wider block">
              Food / Cooking Preference
            </span>
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] text-xs font-bold text-[#2D1F1A]">
              {property.food_preference || "Veg and non-veg both allowed"}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#F0E6D8]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A7568]">
              Amenities & Nearby Places
            </h4>
            <div className="space-y-2">
              {property.amenities?.lift !== false && (
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] text-xs text-[#2D1F1A]">
                  <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                  <span>Lift Available</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] text-xs text-[#2D1F1A]">
                <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                <span>Water: {property.water_supply || "Borewell"}</span>
              </div>
              {property.amenities?.schoolsNearby !== false && (
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] text-xs text-[#2D1F1A]">
                  <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                  <span>Schools Nearby</span>
                </div>
              )}
              {property.amenities?.hospitalNearby !== false && (
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] text-xs text-[#2D1F1A]">
                  <CheckCircle2 className="w-4 h-4 text-[#C5924E] shrink-0" />
                  <span>Hospital Nearby</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROPERTY DETAILS TABLE CARD */}
        <div className="bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-sm space-y-3 w-full text-left">
          <h3 className="text-sm font-serif font-bold text-[#2D1F1A]">Property Details</h3>
          <div className="space-y-2 text-xs divide-y divide-[#F0E6D8]">
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Property Type</span>
              <span className="font-bold text-[#2D1F1A]">{property.type || "Apartment / Flat"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Configuration</span>
              <span className="font-bold text-[#2D1F1A]">{property.configuration || "2 BHK"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Built-up Area</span>
              <span className="font-bold text-[#2D1F1A]">{property.built_up_area || "1200"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Floor</span>
              <span className="font-bold text-[#2D1F1A]">{property.floor || "2"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Furnishing</span>
              <span className="font-bold text-[#2D1F1A]">{property.furnishing || "Semi-furnished"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Parking</span>
              <span className="font-bold text-[#2D1F1A]">{property.parking || "Two-wheeler"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Bathrooms</span>
              <span className="font-bold text-[#2D1F1A]">{property.bathrooms || "1"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8A7568]">Water Supply</span>
              <span className="font-bold text-[#2D1F1A]">{property.water_supply || "Borewell"}</span>
            </div>
          </div>
        </div>

        {/* VISIT SLOT BOOKING SECTION */}
        <div className="bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-sm space-y-4 w-full text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7568]">
              Select Visit Slot
            </h4>
            <span className="text-[10px] text-[#C5924E] font-bold">
              {availableSlots.length} slots available
            </span>
          </div>

          <form onSubmit={handleBookVisit} className="space-y-3">
            {availableSlots.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                <p className="font-bold">No open slots available</p>
                <p className="text-[11px]">Contact owner directly via live chat below.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setSelectedDate(slot.date);
                        setSelectedTimeSlot(slot.time_slot);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-md scale-[1.01]"
                          : "bg-[#FAF7F2] text-[#2D1F1A] border-[#EADBCE] hover:bg-[#F2ECE1]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#C5924E] text-white" : "bg-[#C5924E]/10 text-[#C5924E]"}`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className={`block text-[11px] font-bold ${isSelected ? "text-white" : "text-[#2D1F1A]"}`}>
                            {slot.date}
                          </strong>
                          <span className={`text-[10px] ${isSelected ? "text-[#D9C4B0]" : "text-[#6E5D53]"}`}>
                            {slot.time_slot}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 bg-[#C5924E] rounded-full flex items-center justify-center text-white shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={bookingLoading || availableSlots.length === 0}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                availableSlots.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#2D1F1A] hover:bg-[#3E2E27] text-white cursor-pointer"
              }`}
            >
              {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Calendar className="w-4 h-4 text-[#C5924E]" />}
              <span>{bookingLoading ? "Submitting..." : "Request Property Visit"}</span>
            </button>

            <button
              type="button"
              onClick={handleChatWithOwner}
              disabled={chatLoading}
              className="w-full py-3 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] text-[#2D1F1A] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" /> : <MessageSquare className="w-4 h-4 text-[#C5924E]" />}
              <span>{chatLoading ? "Opening Chat..." : "Chat with Owner"}</span>
            </button>
          </form>
        </div>

        {/* AMAZON-STYLE RECOMMENDATIONS (MOBILE) */}
        {suggestedProperties.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#EADBCE] space-y-4 w-full text-left">
            <div className="flex items-end justify-between px-1">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#C5924E]">
                  Based on this location
                </span>
                <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Similar Properties in {property.location?.split(",")[0] || "This Area"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel(mobileCarouselRef, "left")}
                  className="p-2 rounded-full bg-white border border-[#EADBCE] text-[#2D1F1A] hover:bg-[#FAF7F2] shadow-sm transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollCarousel(mobileCarouselRef, "right")}
                  className="p-2 rounded-full bg-white border border-[#EADBCE] text-[#2D1F1A] hover:bg-[#FAF7F2] shadow-sm transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={mobileCarouselRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth scrollbar-none snap-x"
            >
              {suggestedProperties.map((item) => {
                let itemImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
                if (Array.isArray(item.images) && item.images.length > 0) {
                  itemImage = item.images[0];
                } else if (item.image_url) {
                  itemImage = item.image_url;
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.location.href = `/tenant-dashboard/property/${item.id}`;
                    }}
                    className="w-[220px] shrink-0 bg-white rounded-3xl border border-[#EADBCE] shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden snap-start flex flex-col group"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100 m-2 rounded-2xl">
                      <img
                        src={itemImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#2D1F1A]/80 backdrop-blur-md text-white rounded-lg text-[8px] font-bold uppercase tracking-wider">
                        {item.type || "Independent house"}
                      </div>
                      <button
                        onClick={(e) => handleCardToggleSave(e, item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/95 hover:bg-white rounded-full shadow-md text-[#2D1F1A] transition-all cursor-pointer"
                        title="Save property"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                      </button>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#2D1F1A]/90 backdrop-blur-md text-white rounded-lg text-[10px] font-bold shadow-md">
                        ₹{Number(item.price || 0).toLocaleString()} /mo
                      </div>
                    </div>

                    <div className="px-3 pb-3 pt-0.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-[#2D1F1A] truncate group-hover:text-[#C5924E] transition-colors">
                          {item.configuration || item.title || "2bhk"}
                        </h4>
                        <p className="text-[10px] text-[#6E5D53] flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 text-[#C5924E] shrink-0" />
                          <span>{item.location}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F0E6D8] flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#2D1F1A]">{item.configuration || "BHK"}</span>
                        <span className="text-[#6E5D53] hover:text-[#C5924E] font-bold">
                          View details
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
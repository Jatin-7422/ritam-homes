import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  IndianRupee,
  Building2,
  Calendar,
  AlertCircle,
  Edit3,
  Trash2,
  BedDouble,
  Bath,
  Maximize2,
  CheckCircle2,
  Users,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function OwnerPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
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
      if (!data) {
        setError("Property not found.");
      } else {
        setProperty(data);
      }
    } catch (err) {
      console.error("Error fetching property details:", err.message);
      setError("Failed to load property details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (
      !window.confirm("Are you sure you want to delete this property listing?")
    )
      return;
    try {
      setDeleting(true);
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      navigate("/owner-properties");
    } catch (err) {
      console.error("Error deleting property:", err.message);
      alert("Failed to delete property. Check permissions.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-[#FDFBF7] min-h-screen">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error || "Property not found."}</p>
        </div>
        <button
          onClick={() => navigate("/owner-properties")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Properties
        </button>
      </div>
    );
  }

  // Robust image list formatting
  let images = [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
  ];
  if (
    property.images &&
    Array.isArray(property.images) &&
    property.images.length > 0
  ) {
    images = property.images;
  } else if (property.image_url) {
    images = Array.isArray(property.image_url) ? property.image_url : [property.image_url];
  } else if (property.image) {
    images = Array.isArray(property.image) ? property.image : [property.image];
  }

  // Parse amenities & nearby places
  let amenitiesList = [];
  if (Array.isArray(property.amenities)) {
    amenitiesList = property.amenities;
  } else if (typeof property.amenities === "string") {
    amenitiesList = property.amenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (amenitiesList.length === 0) {
    amenitiesList = [
      "Lift Available",
      `Water: ${property.water_supply || "Tank water"}`,
      "Schools Nearby",
      "Hospital Nearby",
    ];
  }

  const handleNextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-4 sm:space-y-8 bg-[#FDFBF7] min-h-screen text-[#2D1F1A]">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E5D53] hover:text-[#2D1F1A] transition-all cursor-pointer flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5924E]" /> 
          <span className="hidden sm:inline">Back to Explore</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/owner-bookings?property=${property.id}`)}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] text-[#2D1F1A] rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5924E]" /> 
            <span>Visit Requests</span>
          </button>
          <button
            onClick={handleDeleteProperty}
            disabled={deleting}
            className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Property Title & Location */}
      <div className="space-y-1 px-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A] capitalize leading-tight">
          {property.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5D53] flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5924E] flex-shrink-0" />
          <span className="truncate">{property.location || "Location not specified"}</span>
        </p>
      </div>

      {/* Single Mobile-Optimized Unified Stream Layout */}
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* 1. Image Slider Showcase with Navigation Arrows */}
        <div className="space-y-2.5">
          <div className="relative h-[260px] sm:h-[400px] w-full bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#EADBCE] shadow-xs group">
            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-md text-[#2D1F1A] border border-[#EADBCE] rounded-full text-[9px] font-bold shadow-xs uppercase tracking-wider z-10">
              Active
            </span>
            
            <img
              src={images[activeImage]}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Slider Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#2D1F1A] flex items-center justify-center shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#2D1F1A] flex items-center justify-center shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[11px] font-bold">
              {activeImage + 1} / {images.length}
            </span>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    activeImage === index
                      ? "border-[#C5924E] shadow-md scale-105"
                      : "border-[#EADBCE] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. MONEY & QUICK SPECS */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs space-y-4">
          <div className="flex items-baseline justify-between pb-3 border-b border-[#F2ECE4]">
            <div>
              <div className="flex items-center text-[#C5924E] text-2xl font-serif font-bold">
                <IndianRupee className="w-5 h-5" />
                <span>
                  {property.price?.toLocaleString("en-IN") || "15,000"}
                </span>
                <span className="text-xs font-normal text-[#6E5D53] ml-1">
                  /month
                </span>
              </div>
              <p className="text-[11px] text-[#6E5D53] mt-0.5">
                Security Deposit: ₹
                {property.security_deposit
                  ? property.security_deposit.toLocaleString("en-IN")
                  : "3,00,000"}
              </p>
            </div>
          </div>

          {/* Quick Spec Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs text-[#6E5D53]">
            <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]">
              <BedDouble className="w-4 h-4 text-[#C5924E] flex-shrink-0" />
              <span className="font-bold text-[#2D1F1A] truncate">
                {property.bedrooms
                  ? `${property.bedrooms} BHK`
                  : property.configuration || "2 BHK"}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]">
              <Bath className="w-4 h-4 text-[#C5924E] flex-shrink-0" />
              <span className="font-bold text-[#2D1F1A] truncate">
                {property.bathrooms || "2"} Baths
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]">
              <Maximize2 className="w-4 h-4 text-[#C5924E] flex-shrink-0" />
              <span className="font-bold text-[#2D1F1A] truncate">
                {property.area || property.built_up_area || "500 sq. ft"}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]">
              <Building2 className="w-4 h-4 text-[#C5924E] flex-shrink-0" />
              <span className="font-bold text-[#2D1F1A] truncate">
                {property.furnishing || "Fully furnished"}
              </span>
            </div>
          </div>

          {/* Owner Management Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => navigate(`/owner/properties/edit/${property.id}`)}
              className="w-full py-3 bg-[#C5924E] hover:bg-[#b08043] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Property Details</span>
            </button>

            <button
              onClick={() => navigate("/owner-properties")}
              className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#C5924E]" />
              <span>Manage All Properties</span>
            </button>
          </div>
        </div>

        {/* 3. About This Property */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
            About This Property
          </h2>

          <p className="text-xs text-[#6E5D53] leading-relaxed">
            {property.description ||
              "Well-maintained property with great features and connectivity."}
          </p>

          <div className="border-t border-[#F2ECE4] pt-3"></div>

          {/* Preferred Tenants & Cooking Preferences Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6E5D53] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C5924E]" /> Preferred Tenants
              </span>
              <div className="px-3.5 py-2.5 bg-white rounded-xl border border-[#EADBCE] text-xs font-bold text-[#2D1F1A] shadow-2xs">
                {property.preferred_tenants ||
                  property.tenant_preference ||
                  "Family"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6E5D53] uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#C5924E]" /> Food / Cooking Preference
              </span>
              <div className="px-3.5 py-2.5 bg-white rounded-xl border border-[#EADBCE] text-xs font-bold text-[#2D1F1A] shadow-2xs">
                {property.food_preference || "Veg and non-veg both allowed"}
              </div>
            </div>
          </div>

          <div className="border-t border-[#F2ECE4] pt-1"></div>

          {/* Amenities & Nearby Places */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-[#6E5D53] uppercase tracking-wider block">
              Amenities & Nearby Places
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {amenitiesList.map((amenity, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-xl text-xs font-bold text-[#2D1F1A] flex items-center gap-2 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C5924E] flex-shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Detailed Specifications Table Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs space-y-3">
          <h3 className="text-sm font-serif font-bold text-[#2D1F1A] pb-2 border-b border-[#F2ECE4]">
            Property Details
          </h3>

          <div className="space-y-2 text-xs">
            {[
              {
                label: "Property Type",
                val:
                  property.type ||
                  property.property_type ||
                  "Independent house",
              },
              {
                label: "Configuration",
                val: property.bedrooms
                  ? `${property.bedrooms} BHK`
                  : property.configuration || "2 BHK",
              },
              {
                label: "Built-up Area",
                val: property.area || property.built_up_area || "500 sq. ft.",
              },
              { label: "Floor", val: property.floor || "2" },
              {
                label: "Furnishing",
                val: property.furnishing || "Fully furnished",
              },
              {
                label: "Parking",
                val: property.parking || "Two + four-wheeler",
              },
              { label: "Bathrooms", val: property.bathrooms || "2" },
              {
                label: "Water Supply",
                val: property.water_supply || "Tank water",
              },
              {
                label: "Facing (Vastu)",
                val: property.facing || "South facing",
              },
              {
                label: "Listed On",
                val: property.created_at
                  ? new Date(property.created_at).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "18 Aug 2026",
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 border-b border-[#F8F5EE] last:border-none gap-4"
              >
                <span className="text-[#6E5D53] flex items-center gap-1.5 font-medium flex-shrink-0">
                  {row.label}
                </span>
                <span className="font-bold text-[#2D1F1A] text-right truncate">
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
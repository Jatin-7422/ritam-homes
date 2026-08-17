import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Building,
} from "lucide-react";

export default function TenantPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

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
      if (data) {
        setProperty(data);
        // Set initial main image
        if (data.images) {
          if (Array.isArray(data.images) && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          } else if (typeof data.images === "string") {
            try {
              const parsed = JSON.parse(data.images);
              if (Array.isArray(parsed) && parsed.length > 0)
                setSelectedImage(parsed[0]);
              else setSelectedImage(data.images);
            } catch {
              setSelectedImage(data.images);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching property details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-12 text-center space-y-4 max-w-lg mx-auto my-20 bg-white rounded-3xl border border-[#EADBCE]">
        <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
          Property Not Found
        </h2>
        <p className="text-xs text-[#6E5D53]">
          The property you are looking for may have been removed or does not
          exist.
        </p>
        <button
          onClick={() => navigate("/tenant-dashboard/explore")}
          className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3E2E27] transition-all"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  // Parse images array safely
  let imageList = [];
  if (property.images) {
    if (Array.isArray(property.images)) imageList = property.images;
    else if (typeof property.images === "string") {
      try {
        const parsed = JSON.parse(property.images);
        imageList = Array.isArray(parsed) ? parsed : [property.images];
      } catch {
        imageList = [property.images];
      }
    }
  }
  if (imageList.length === 0) {
    imageList = [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    ];
  }

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EADBCE] text-[#2D1F1A] text-xs font-bold rounded-xl hover:border-[#C5924E] transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm space-y-8">
        {/* Title & Location Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EADBCE]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
              <Building className="w-3.5 h-3.5 text-[#C5924E]" />
              <span>{property.property_type || "Apartment"}</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
              {property.title}
            </h1>
            <p className="text-xs text-[#6E5D53] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C5924E]" />
              <span>
                {property.location ||
                  property.city ||
                  property.address ||
                  "Location not specified"}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="text-xs text-[#8C7A6B]">Monthly Rent</span>
            <span className="text-3xl font-serif font-bold text-[#2D1F1A]">
              ₹{Number(property.rent || property.price || 0).toLocaleString()}
              <span className="text-xs font-normal text-[#6E5D53]">/mo</span>
            </span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="h-96 w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EADBCE]">
            <img
              src={selectedImage || imageList[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {imageList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-24 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? "border-[#C5924E] shadow-md scale-105"
                      : "border-[#EADBCE] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-center">
          <div className="space-y-1">
            <span className="text-xs text-[#8C7A6B]">Bedrooms</span>
            <p className="text-lg font-bold font-serif text-[#2D1F1A]">
              {property.bedrooms || 2} Beds
            </p>
          </div>
          <div className="space-y-1 border-l border-[#EADBCE]">
            <span className="text-xs text-[#8C7A6B]">Bathrooms</span>
            <p className="text-lg font-bold font-serif text-[#2D1F1A]">
              {property.bathrooms || 2} Baths
            </p>
          </div>
          <div className="space-y-1 border-l border-[#EADBCE]">
            <span className="text-xs text-[#8C7A6B]">Carpet Area</span>
            <p className="text-lg font-bold font-serif text-[#2D1F1A]">
              {property.area || 1200} sq.ft
            </p>
          </div>
          <div className="space-y-1 border-l border-[#EADBCE]">
            <span className="text-xs text-[#8C7A6B]">Furnishing</span>
            <p className="text-lg font-bold font-serif text-[#2D1F1A]">
              {property.furnishing || "Semi-Furnished"}
            </p>
          </div>
        </div>

        {/* Description & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
              About This Property
            </h3>
            <p className="text-xs text-[#6E5D53] leading-relaxed whitespace-pre-line">
              {property.description || "No description provided by the owner."}
            </p>

            <div className="space-y-3 pt-4">
              <h4 className="text-sm font-bold text-[#2D1F1A]">
                Additional Highlights
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-[#6E5D53]">
                  <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
                  <span>
                    Water Supply:{" "}
                    {property.water_supply || "Borewell / Corporation"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6E5D53]">
                  <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
                  <span>Facing: {property.facing || "North"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="p-6 rounded-3xl border border-[#EADBCE] bg-[#FAF7F2] space-y-6 h-fit">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-[#2D1F1A]">
                Interested in this home?
              </h4>
              <p className="text-[11px] text-[#6E5D53]">
                Get in touch with the property owner directly to schedule a
                visit or ask questions.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`/tenant-dashboard/messages?owner=${property.owner_id || ""}`}
                className="w-full py-3.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#C5924E]" />
                <span>Chat with Owner</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

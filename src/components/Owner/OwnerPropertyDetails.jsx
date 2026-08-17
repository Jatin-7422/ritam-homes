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
  MessageSquare,
} from "lucide-react";

export default function OwnerPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
    checkCurrentUser();
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

  const checkCurrentUser = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      setCurrentUserId(sessionData.session.user.id);
    }
  };

  const handleStartChat = async (propertyId, ownerId) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      alert("Please log in to chat with the owner.");
      return;
    }

    const currentUserId = sessionData.session.user.id;
    if (currentUserId === ownerId) {
      alert("You cannot chat with yourself on your own property.");
      return;
    }

    // Insert initial system/greeting message if conversation doesn't exist yet
    await supabase.from("messages").insert([
      {
        property_id: propertyId,
        sender_id: currentUserId,
        receiver_id: ownerId,
        content: "Hi, I'm interested in this property. Is it still available?",
      },
    ]);

    // Navigate to messages tab
    navigate("/messages");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error || "Property not found."}</p>
        </div>
        <button
          onClick={() => navigate("/owner-properties")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Properties
        </button>
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"];

  // Handle different schema column naming conventions for owner/user ID
  const ownerId = property.owner_id || property.user_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EADBCE] text-[#2D1F1A] hover:bg-[#FAF7F2] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5924E]" /> Back
        </button>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
          Active Listing
        </span>
      </div>

      {/* Property Title & Location */}
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          {property.title}
        </h1>
        <p className="text-sm text-[#6E5D53] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#C5924E]" />
          {property.location || "Location not specified"}
        </p>
      </div>

      {/* Image Gallery Section */}
      <div className="space-y-4">
        {/* Main Big Image Preview */}
        <div className="h-[350px] sm:h-[450px] w-full bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#EADBCE] shadow-sm">
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {/* Thumbnail Selector (if multiple images exist) */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
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

      {/* Grid Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
              Description
            </h2>
            <p className="text-sm text-[#6E5D53] leading-relaxed whitespace-pre-line">
              {property.description ||
                "No description provided for this property."}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
              Property Features & Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] space-y-1">
                <span className="text-[10px] text-[#6E5D53] uppercase font-bold tracking-wider">
                  Property Type
                </span>
                <p className="text-sm font-bold text-[#2D1F1A] capitalize">
                  {property.type || property.property_type || "Residential"}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] space-y-1">
                <span className="text-[10px] text-[#6E5D53] uppercase font-bold tracking-wider">
                  Listed Date
                </span>
                <p className="text-sm font-bold text-[#2D1F1A]">
                  {new Date(property.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Pricing & Quick Actions Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#EADBCE] shadow-sm space-y-6 sticky top-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#F2ECE4]">
              <span className="text-sm font-bold text-[#6E5D53]">
                Rental Price
              </span>
              <div className="flex items-center text-[#C5924E] text-2xl font-serif font-bold">
                <IndianRupee className="w-5 h-5" />
                <span>{property.price?.toLocaleString("en-IN") || "N/A"}</span>
                <span className="text-xs font-normal text-[#6E5D53] ml-1">
                  /mo
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Show Chat button ONLY if logged-in user is NOT the owner */}
              {ownerId && currentUserId !== ownerId && (
                <button
                  onClick={() => handleStartChat(property.id, ownerId)}
                  className="w-full py-3 bg-[#C5924E] hover:bg-[#b08043] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Owner</span>
                </button>
              )}

              <button
                onClick={() => navigate("/owner-properties")}
                className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#C5924E]" />
                <span>Manage All Properties</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { 
  ArrowLeft, Save, Loader2, Home, MapPin, 
  IndianRupee, FileText, Image as ImageIcon, 
  Bed, Bath, Square, CheckSquare, Square as SquareIcon, Building2, Trash2, Plus
} from "lucide-react";

export default function OwnerEditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [newImageUrl, setNewImageUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    images: [],
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: "",
    status: "Available",
    amenities: [],
  });

  const availableAmenities = [
    "WiFi", "Swimming Pool", "Parking", "Air Conditioning", 
    "Security", "Gym", "Balcony", "Furnished", "Power Backup"
  ];

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
        let loadedImages = [];
        if (Array.isArray(data.images) && data.images.length > 0) {
          loadedImages = data.images;
        } else if (data.image_url) {
          loadedImages = [data.image_url];
        }

        // Smart extraction: Infer bedrooms, bathrooms, and area from title if missing
        let inferredBeds = data.bedrooms;
        if (!inferredBeds && data.title) {
          const matchBeds = data.title.match(/(\d+)\s*bhk/i);
          if (matchBeds) {
            inferredBeds = parseInt(matchBeds[1]);
          }
        }
        const finalBeds = inferredBeds || 2;

        let inferredArea = data.area_sqft;
        if (!inferredArea && data.title) {
          const matchArea = data.title.match(/(\d+)\s*(sq\.?\s*ft|sqft|square\s*feet)/i);
          if (matchArea) {
            inferredArea = parseInt(matchArea[1]);
          } else {
            // General standard estimation based on BHK if title doesn't specify sqft directly
            inferredArea = finalBeds * 550 + 150; // e.g., 2BHK -> ~1250 sqft
          }
        }

        setFormData({
          title: data.title || "",
          location: data.location || "",
          price: data.price || "",
          description: data.description || "",
          images: loadedImages,
          property_type: data.property_type || "Apartment",
          bedrooms: finalBeds,
          bathrooms: data.bathrooms || finalBeds, // Matches bedrooms count precisely
          area_sqft: inferredArea || "",
          status: data.status || "Available",
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
        });
      }
    } catch (err) {
      console.error("Error fetching property:", err.message);
      setErrorMsg("Failed to load property details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl("");
  };

  const handleDeleteImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const primaryImage = formData.images.length > 0 ? formData.images[0] : "";

      const { error } = await supabase
        .from("properties")
        .update({
          title: formData.title,
          location: formData.location,
          price: parseFloat(formData.price) || 0,
          description: formData.description,
          image_url: primaryImage,
          images: formData.images,
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          area_sqft: parseFloat(formData.area_sqft) || 0,
          status: formData.status,
          amenities: formData.amenities,
        })
        .eq("id", id);

      if (error) throw error;

      setSuccessMsg("Property updated successfully!");
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error("Error updating property:", err.message);
      setErrorMsg(err.message || "Failed to update property.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-[#EADBCE] pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#2D1F1A] bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
          Edit Property Listing
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-[#EADBCE] space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-[#C5924E] flex items-center gap-2">
            <Home className="w-4 h-4" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#6E5D53]">Property Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5924E]" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#C5924E]" /> Monthly Rent / Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>
          </div>
        </div>

        <hr className="border-[#EADBCE]" />

        {/* Section 2: Property Specifications & Area */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-[#C5924E] flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Specifications & Area
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">Property Type</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
                <option value="Studio">Studio</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-[#C5924E]" /> Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-[#C5924E]" /> Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1">
                <Square className="w-3.5 h-3.5 text-[#C5924E]" /> Area (Sq. Ft.)
              </label>
              <input
                type="number"
                name="area_sqft"
                value={formData.area_sqft}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-[#6E5D53]">Listing Status : </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full sm:w-1/2 px-3 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>

        <hr className="border-[#EADBCE]" />

        {/* Section 3: Amenities Customization */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-[#C5924E]">Amenities & Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableAmenities.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium transition-all text-left ${
                    isSelected 
                      ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-md" 
                      : "bg-[#FAF7F2] text-[#6E5D53] border-[#EADBCE] hover:bg-[#F0E6D8]"
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-[#C5924E]" /> : <SquareIcon className="w-4 h-4 text-[#C5924E]" />}
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-[#EADBCE]" />

        {/* Section 4: Image Management */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-[#C5924E] flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Property Images Management
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste new image URL to add..."
              className="flex-grow px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-5 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#C5924E]" /> Add Image
            </button>
          </div>

          {formData.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {formData.images.map((imgUrl, index) => (
                <div key={index} className="relative group rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] h-36">
                  <img 
                    src={imgUrl} 
                    alt={`Property ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image"; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Image
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-[#C5924E] text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
                      Primary Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6E5D53] italic">No images added yet. Add at least one image URL above.</p>
          )}
        </div>

        <hr className="border-[#EADBCE]" />

        {/* Section 5: Description */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C5924E]" /> Detailed Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EADBCE]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#6E5D53] font-bold text-xs rounded-xl transition-all"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#C5924E]" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
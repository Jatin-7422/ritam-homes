import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  ArrowLeft,
  Save,
  Loader2,
  Home,
  MapPin,
  IndianRupee,
  FileText,
  Image as ImageIcon,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  Trash2,
  Plus,
  ShieldAlert,
  CheckCircle2,
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
    security_deposit: "",
    description: "",
    images: [],
    type: "Apartment",
    bedrooms: "2",
    bathrooms: "2",
    built_up_area: "",
    floor: "2",
    furnishing: "Fully furnished",
    parking: "Two + four-wheeler",
    water_supply: "Tank water",
    facing: "South facing",
    preferred_tenants: "Family",
    food_preference: "Veg and non-veg both allowed",
    status: "Active",
    amenities: [],
  });

  const availableAmenities = [
    "Lift Available",
    "Schools Nearby",
    "Hospital Nearby",
    "WiFi",
    "Swimming Pool",
    "Parking",
    "Air Conditioning",
    "Security",
    "Gym",
    "Balcony",
    "Power Backup",
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

        let amenitiesList = [];
        if (Array.isArray(data.amenities)) {
          amenitiesList = data.amenities;
        } else if (typeof data.amenities === "object" && data.amenities !== null) {
          amenitiesList = Object.values(data.amenities);
        }

        setFormData({
          title: data.title || "",
          location: data.location || "",
          price: data.price || "",
          security_deposit: data.security_deposit || "",
          description: data.description || "",
          images: loadedImages,
          type: data.type || "Apartment",
          bedrooms: data.configuration || "2",
          bathrooms: data.bathrooms || "2",
          built_up_area: data.built_up_area || "",
          floor: data.floor || "2",
          furnishing: data.furnishing || "Fully furnished",
          parking: data.parking || "Two + four-wheeler",
          water_supply: data.water_supply || "Tank water",
          facing: data.facing || "South facing",
          preferred_tenants: data.preferred_tenants || "Family",
          food_preference: data.food_preference || "Veg and non-veg both allowed",
          status: data.status || "Active",
          amenities: amenitiesList,
        });
      }
    } catch (err) {
      console.error("Error fetching property details:", err.message);
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
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl("");
  };

  const handleDeleteImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const primaryImage = formData.images.length > 0 ? formData.images[0] : null;

      // Payload matching exact column names in your schema
      const payload = {
        title: formData.title,
        location: formData.location,
        price: parseFloat(formData.price) || 0,
        security_deposit: parseFloat(formData.security_deposit) || 0,
        description: formData.description,
        image_url: primaryImage,
        images: formData.images,
        type: formData.type,
        configuration: formData.bedrooms,
        bathrooms: formData.bathrooms,
        built_up_area: parseFloat(formData.built_up_area) || 0,
        floor: formData.floor,
        furnishing: formData.furnishing,
        parking: formData.parking,
        water_supply: formData.water_supply,
        facing: formData.facing,
        preferred_tenants: formData.preferred_tenants,
        food_preference: formData.food_preference,
        status: formData.status,
        amenities: formData.amenities,
      };

      const { error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", id);

      if (error) throw error;

      setSuccessMsg("Property updated successfully!");
      setTimeout(() => {
        navigate(-1);
      }, 1200);
    } catch (err) {
      console.error("Error updating property:", err.message);
      setErrorMsg(err.message || "Failed to update property.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-[#FDFBF7] min-h-screen text-[#2D1F1A]">
      <div className="flex items-center justify-between border-b border-[#EADBCE] pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#2D1F1A] bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5924E]" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
          Edit Property Listing
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs shadow-2xs">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold shadow-2xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EADBCE] space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#C5924E] flex items-center gap-2">
            <Home className="w-4 h-4" /> Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Property Title
              </label>
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
                <IndianRupee className="w-3.5 h-3.5 text-[#C5924E]" /> Monthly Rent (₹)
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#C5924E]" /> Security Deposit (₹)
              </label>
              <input
                type="number"
                name="security_deposit"
                value={formData.security_deposit}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Listing Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-[#F2ECE4]" />

        <div className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#C5924E] flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Property Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              >
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-[#C5924E]" /> Configuration / BHK
              </label>
              <input
                type="text"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="e.g., 2 BHK"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-[#C5924E]" /> Bathrooms
              </label>
              <input
                type="text"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="e.g., 2"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53] flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-[#C5924E]" /> Built-up Area (Sq. Ft.)
              </label>
              <input
                type="number"
                name="built_up_area"
                value={formData.built_up_area}
                onChange={handleChange}
                placeholder="e.g., 1200"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">Floor</label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g., 2"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Furnishing
              </label>
              <select
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              >
                <option value="Fully furnished">Fully furnished</option>
                <option value="Semi-furnished">Semi-furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">Parking</label>
              <input
                type="text"
                name="parking"
                value={formData.parking}
                onChange={handleChange}
                placeholder="e.g., Two + four-wheeler"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Water Supply
              </label>
              <input
                type="text"
                name="water_supply"
                value={formData.water_supply}
                onChange={handleChange}
                placeholder="e.g., Tank water / Cauvery"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Facing (Vastu)
              </label>
              <input
                type="text"
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                placeholder="e.g., South facing"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Preferred Tenants
              </label>
              <input
                type="text"
                name="preferred_tenants"
                value={formData.preferred_tenants}
                onChange={handleChange}
                placeholder="e.g., Family"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#6E5D53]">
                Food / Cooking Preference
              </label>
              <input
                type="text"
                name="food_preference"
                value={formData.food_preference}
                onChange={handleChange}
                placeholder="e.g., Veg and non-veg both allowed"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              />
            </div>
          </div>
        </div>

        <hr className="border-[#F2ECE4]" />

        {/* Section 3: Amenities & Features */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#C5924E]">
            Amenities & Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableAmenities.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${isSelected
                      ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-xs"
                      : "bg-[#FAF7F2] text-[#6E5D53] border-[#EADBCE] hover:bg-[#F0E6D8]"
                    }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-[#C5924E]" : "text-[#C5924E]/40"
                      }`}
                  />
                  <span className={isSelected ? "text-white" : "text-[#2D1F1A]"}>{amenity}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Amenity Adder */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder="Type custom amenity (e.g. Clubhouse, Solar Heater)..."
              id="customAmenityInput"
              className="flex-grow px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C5924E]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.target.value.trim();
                  if (val && !formData.amenities.includes(val)) {
                    setFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                    e.target.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('customAmenityInput');
                const val = input.value.trim();
                if (val && !formData.amenities.includes(val)) {
                  setFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                  input.value = '';
                }
              }}
              className="px-5 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 text-[#C5924E]" /> Add Custom
            </button>
          </div>

          {/* Display currently selected/custom added amenities */}
          {formData.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {formData.amenities.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#EADBCE] text-[#2D1F1A] rounded-lg text-xs font-medium"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="border-[#F2ECE4]" />

        <div className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#C5924E] flex items-center gap-2">
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
              className="px-5 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 text-[#C5924E]" /> Add Image
            </button>
          </div>

          {formData.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {formData.images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative group rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] h-36 shadow-2xs"
                >
                  <img
                    src={imgUrl}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-[#C5924E] text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6E5D53] italic">
              No images added yet. Add at least one image URL above.
            </p>
          )}
        </div>

        <hr className="border-[#F2ECE4]" />

        <div className="space-y-2">
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

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2ECE4]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#6E5D53] font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
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
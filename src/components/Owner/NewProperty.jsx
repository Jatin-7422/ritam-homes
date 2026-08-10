import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/whitelogo.png";
import {
  Upload,
  PlusCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";

export default function NewProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bhk: "2 BHK",
    sqft: "",
    furnishing: "Semi Furnished",
    property_type: "Apartment",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !session.user) {
        alert("You must be logged in as an owner to list a property.");
        navigate("/login");
        return;
      }

      const ownerId = session.user.id;
      const uploadedImageUrls = [];

      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("properties")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("properties")
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicURLData.publicUrl);
      }

      const formattedTypeString = `${formData.bhk} • ${formData.sqft} sq.ft • ${formData.furnishing}`;

      const { error: insertError } = await supabase.from("properties").insert([
        {
          owner_id: ownerId,
          title: formData.title,
          location: formData.location,
          price: parseFloat(formData.price),
          type: formattedTypeString,
          status: "Active",
          views: 0,
          image_url:
            uploadedImageUrls[0] ||
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=80",
          images: uploadedImageUrls,
          description: formData.description,
        },
      ]);

      if (insertError) throw insertError;

      alert("Property listed successfully!");
      navigate("/owner-dashboard");
    } catch (err) {
      console.error("Error publishing property:", err);
      alert("Failed to list property. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] font-sans text-[#2D1F1A] flex flex-col">
      <header className="w-full bg-[#2D1F1A] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img
              src={logoWhite}
              alt="Ritam Homes"
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-[#D1C4B9] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </header>

      <main className="max-w-4xl w-full mx-auto p-6 sm:p-10 my-8 bg-white rounded-3xl border border-[#E3D9CC] shadow-xs">
        <div className="mb-8 border-b border-[#E3D9CC] pb-5">
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-[#C5924E]" /> List a New
            Property
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1">
            Provide the details and photos of your property to attract verified
            tenants instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Property Title
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. 2BHK Luxury Apartment"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Location / Address
              </label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Koramangala, Bangalore"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                name="price"
                required
                placeholder="e.g. 22000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Configuration (BHK)
              </label>
              <select
                name="bhk"
                value={formData.bhk}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4+ BHK</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Area (sq.ft)
              </label>
              <input
                type="number"
                name="sqft"
                required
                placeholder="e.g. 1200"
                value={formData.sqft}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Furnishing Status
              </label>
              <select
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                Property Type
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
              >
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
              Property Description
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Highlight special amenities, lighting, nearby landmarks, or rules..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-xs focus:outline-none focus:border-[#C5924E]"
            ></textarea>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
              Upload Property Images
            </label>
            <div className="border-2 border-dashed border-[#E3D9CC] rounded-2xl p-6 text-center bg-[#F8F5EE]/50 hover:bg-[#F8F5EE] transition-colors relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#C5924E]/20 text-[#C5924E] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#2D1F1A]">
                  Click to upload or drag & drop images here
                </p>
                <p className="text-[10px] text-[#8C7A6B]">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-[#E3D9CC] h-24 bg-white"
                  >
                    <img
                      src={src}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-[#2D1F1A]/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E3D9CC] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-[#C5924E] hover:bg-[#b07f3f] text-[#2D1F1A] font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing
                  Property...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Publish Listing
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

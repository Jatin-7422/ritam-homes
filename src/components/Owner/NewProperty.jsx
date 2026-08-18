import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { MapPin, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AddressAutocomplete from "./AddressAutocomplete";

// Fix default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper component to recenter map and fix sizing when container visibility changes across steps
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
}

export default function NewProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Photos state
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Step 2: Property details state
  const [propertyDetails, setPropertyDetails] = useState({
    title: "",
    propertyType: "Apartment / Flat",
    configuration: "2 BHK",
    monthlyRent: "",
    securityDeposit: "",
    builtUpArea: "",
    floorDetails: "",
    furnishing: "Semi-furnished",
    preferredTenant: "Any",
    parking: "Two-wheeler",
    bathrooms: "2",
    waterSupply: "Borewell",
    facing: "North facing",
    foodPreference: "Veg and non-veg both allowed",
    amenities: {
      lift: true,
      water247: true,
      securityGuard: false,
      schoolsNearby: true,
      hospitalNearby: true,
      parkNearby: false,
    },
    customAmenities: [],
    newAmenityInput: "",
  });

  // Step 3: Slot Booking state
  const [bookingMode, setBookingMode] = useState("manual");
  const [visitorsPerSlot, setVisitorsPerSlot] = useState("1 (private visit)");
  const [notifyEveryRequest, setNotifyEveryRequest] = useState(true);
  const [allowOtherDay, setAllowOtherDay] = useState(true);
  const hoursList = [
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
  ];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [slotGrid, setSlotGrid] = useState(() => {
    return hoursList.map((_, rowIdx) =>
      Array(7)
        .fill(false)
        .map((_, colIdx) => rowIdx >= 6 || colIdx >= 5),
    );
  });
  const [isDraggingSlots, setIsDraggingSlots] = useState(false);
  const [dragSlotValue, setDragSlotValue] = useState(true);
  const [pickedDayIndex, setPickedDayIndex] = useState(0);

  // Step 4: Location State
  const [locationAddress, setLocationAddress] = useState(
    "Bengaluru, Karnataka",
  );
  const [latitude, setLatitude] = useState(12.9716); // Default Bengaluru lat
  const [longitude, setLongitude] = useState(77.5946); // Default Bengaluru lon
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default Bengaluru coords

  // Photo handlers
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - photos.length;
    const allowedFiles = files.slice(0, remainingSlots);

    allowedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotos((prev) => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Slot grid interactions
  const handleSlotMouseDown = (rowIdx, colIdx, e) => {
    e.preventDefault();
    setIsDraggingSlots(true);
    const newState = !slotGrid[rowIdx][colIdx];
    setDragSlotValue(newState);

    const updated = slotGrid.map((row, r) =>
      row.map((val, c) => (r === rowIdx && c === colIdx ? newState : val)),
    );
    setSlotGrid(updated);
  };

  const handleSlotMouseEnter = (rowIdx, colIdx) => {
    if (isDraggingSlots) {
      const updated = slotGrid.map((row, r) =>
        row.map((val, c) =>
          r === rowIdx && c === colIdx ? dragSlotValue : val,
        ),
      );
      setSlotGrid(updated);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDraggingSlots(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // DATABASE SUBMISSION LOGIC
  const handlePublishProperty = async () => {
    setIsSubmitting(true);

    try {
      // 1. Get current logged-in user securely from Auth session
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Your session has expired. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      const ownerId = user.id;

      // Extract owner details directly from auth metadata or email fallback
      const ownerName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split("@")[0];
      const ownerPhone = user.user_metadata?.phone || "Not provided";
      const ownerEmail = user.email;

      const uploadedImageUrls = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        if (photo.startsWith("data:")) {
          const res = await fetch(photo);
          const blob = await res.blob();
          const fileName = `${ownerId}/${Date.now()}_${i}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("properties")
            .upload(fileName, blob, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("properties")
            .getPublicUrl(fileName);

          uploadedImageUrls.push(publicUrlData.publicUrl);
        } else {
          uploadedImageUrls.push(photo);
        }
      }

      // Payload storing property attributes along with direct authentication owner info
      const propertyPayload = {
        owner_id: ownerId,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        owner_email: ownerEmail,
        title:
          propertyDetails.title ||
          `${propertyDetails.configuration} ${propertyDetails.propertyType}`,
        location: locationAddress,
        latitude: latitude,
        longitude: longitude,
        price: parseFloat(propertyDetails.monthlyRent) || 0,
        type: propertyDetails.propertyType,
        status: "Active",
        views: 0,
        images: uploadedImageUrls,
        image_url: uploadedImageUrls[0] || "",

        // Direct database column fields
        configuration: propertyDetails.configuration,
        built_up_area: parseFloat(propertyDetails.builtUpArea) || 0,
        floor: propertyDetails.floorDetails,
        furnishing: propertyDetails.furnishing,
        preferred_tenants: propertyDetails.preferredTenant,
        parking: propertyDetails.parking,
        bathrooms: propertyDetails.bathrooms,
        water_supply: propertyDetails.waterSupply,
        facing: propertyDetails.facing,
        food_preference: propertyDetails.foodPreference,
        security_deposit: parseFloat(propertyDetails.securityDeposit) || 0,

        // Storing complex structural options (amenities/slots)
        amenities: propertyDetails.amenities,
        custom_amenities: propertyDetails.customAmenities,
        visit_availability: {
          mode: bookingMode,
          visitorsPerSlot,
          notifyEveryRequest,
          allowOtherDay,
          slotGrid,
        },
      };

      const { error: insertError } = await supabase
        .from("properties")
        .insert([propertyPayload]);

      if (insertError) throw insertError;

      alert("Property published and saved successfully with owner info!");
      navigate("/owner-properties");
    } catch (err) {
      console.error("Error publishing property:", err.message);
      alert(`Failed to save property: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`flex flex-col w-full relative transition-opacity duration-500 ${isSubmitting ? "opacity-90" : "opacity-100"}`}
    >
      {/* LOADING OVERLAY FOR SUBMISSION */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-[#2D1F1A]/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5924E] mb-4" />
          <p className="font-serif font-bold text-xl">
            Publishing your property to database...
          </p>
          <p className="text-xs text-[#9E8B7F] mt-1">
            Please wait while we save your listing
          </p>
        </div>
      )}

      {/* HEADER TITLE SECTION */}
      <div className="px-6 sm:px-10 pt-6 pb-2 flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
          List a new property
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
          Add photos, details, your visit availability, and the address.
        </p>
      </div>

      {/* STEPPER NAVIGATION BAR */}
      <div className="px-6 sm:px-10 py-4">
        <div className="bg-white border border-[#E3D9CC] rounded-2xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-xs">
          {[
            { step: 1, label: "Photos", sub: "Show your home" },
            {
              step: 2,
              label: "Property details",
              sub: "Furnishing, rent, amenities",
            },
            { step: 3, label: "Visit availability", sub: "Set your slots" },
            { step: 4, label: "Location", sub: "Enter your address" },
          ].map((item) => {
            const isSelected = currentStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep) {
                    setCurrentStep(item.step);
                  }
                }}
                className={`flex items-center gap-3.5 p-3 rounded-xl text-left transition-all ${
                  item.step < currentStep ? "cursor-pointer" : "cursor-default"
                } border ${
                  isSelected
                    ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-md"
                    : "bg-[#FBF9F4] text-[#2D1F1A] border-[#E3D9CC] hover:bg-[#F2ECE1]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isSelected
                      ? "bg-[#C5924E] text-[#2D1F1A]"
                      : "bg-[#2D1F1A] text-white"
                  }`}
                >
                  {item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <strong
                    className={`block text-xs font-bold truncate ${
                      isSelected ? "text-white" : "text-[#2D1F1A]"
                    }`}
                  >
                    {item.label}
                  </strong>
                  <span
                    className={`block text-[10px] truncate ${
                      isSelected ? "text-[#C6B6A8]" : "text-[#6E5D53]"
                    }`}
                  >
                    {item.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM BODY PANEL */}
      <div className="px-6 sm:px-10 pb-12 max-w-7xl w-full mx-auto space-y-6 flex-1">
        <div className="bg-white rounded-3xl border border-[#E3D9CC] p-6 sm:p-10 shadow-xs">
          {/* STEP 1: PHOTOS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Upload photos
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  Clear, well-lit photos get more visit requests. The first
                  photo becomes the cover image.
                </p>
              </div>

              <label
                htmlFor="photo-input"
                className="border-2 border-dashed border-[#C5924E]/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-[#F8F5EE]/50 hover:bg-[#F8F5EE] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 text-[#C5924E] flex items-center justify-center mb-2 text-xl font-bold">
                  ↑
                </div>
                <strong className="text-xs sm:text-sm font-bold text-[#2D1F1A]">
                  Drag photos here, or click to browse
                </strong>
                <span className="text-[11px] text-[#6E5D53] mt-1">
                  JPG or PNG, up to 10 photos
                </span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="photo-input"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {photos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-[#E3D9CC] aspect-square group bg-[#F8F5EE]"
                    >
                      <img
                        src={photoUrl}
                        alt={`Upload ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#C5924E] text-[#2D1F1A] font-bold text-[9px] rounded-md shadow">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs font-medium text-[#6E5D53]">
                {photos.length} of 10 photos added.{" "}
                {photos.length < 3 ? (
                  <span className="text-amber-600">
                    Add at least {3 - photos.length} photos to continue.
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold">
                    Minimum requirement met ✓
                  </span>
                )}
              </p>
            </div>
          )}

          {/* STEP 2: PROPERTY DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Property details
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  These details help tenants filter and understand your home
                  before requesting a visit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury 2 BHK Apartment in Gandhi Nagar"
                    value={propertyDetails.title}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Property type
                  </label>
                  <select
                    value={propertyDetails.propertyType}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        propertyType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  >
                    <option>Apartment / Flat</option>
                    <option>Independent house</option>
                    <option>Villa</option>
                    <option>PG / Shared room</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Configuration
                  </label>
                  <select
                    value={propertyDetails.configuration}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        configuration: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  >
                    <option>1 RK</option>
                    <option>1 BHK</option>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4+ BHK</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Monthly rent (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12000"
                    value={propertyDetails.monthlyRent}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        monthlyRent: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Security deposit (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 30000"
                    value={propertyDetails.securityDeposit}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        securityDeposit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Built-up area (sq. ft.){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 950"
                    value={propertyDetails.builtUpArea}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        builtUpArea: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Floor / total floors <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd of 4"
                    value={propertyDetails.floorDetails}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        floorDetails: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Furnishing
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Unfurnished", "Semi-furnished", "Fully furnished"].map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setPropertyDetails({
                              ...propertyDetails,
                              furnishing: opt,
                            })
                          }
                          className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                            propertyDetails.furnishing === opt
                              ? "bg-[#C5924E]/20 text-[#2D1F1A] border-[#C5924E] font-bold shadow-xs"
                              : "bg-[#F8F5EE] text-[#6E5D53] border-[#E3D9CC]"
                          }`}
                        >
                          {opt}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Preferred tenants
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Any",
                      "Family",
                      "Bachelors",
                      "Working professionals",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setPropertyDetails({
                            ...propertyDetails,
                            preferredTenant: opt,
                          })
                        }
                        className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                          propertyDetails.preferredTenant === opt
                            ? "bg-[#C5924E]/20 text-[#2D1F1A] border-[#C5924E] font-bold shadow-xs"
                            : "bg-[#F8F5EE] text-[#6E5D53] border-[#E3D9CC]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Parking
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["None", "Two-wheeler", "Two + four-wheeler"].map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setPropertyDetails({
                              ...propertyDetails,
                              parking: opt,
                            })
                          }
                          className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                            propertyDetails.parking === opt
                              ? "bg-[#C5924E]/20 text-[#2D1F1A] border-[#C5924E] font-bold shadow-xs"
                              : "bg-[#F8F5EE] text-[#6E5D53] border-[#E3D9CC]"
                          }`}
                        >
                          {opt}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Bathrooms
                  </label>
                  <select
                    value={propertyDetails.bathrooms}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        bathrooms: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Water supply
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Borewell", "Tank water", "Both"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setPropertyDetails({
                            ...propertyDetails,
                            waterSupply: opt,
                          })
                        }
                        className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                          propertyDetails.waterSupply === opt
                            ? "bg-[#C5924E]/20 text-[#2D1F1A] border-[#C5924E] font-bold shadow-xs"
                            : "bg-[#F8F5EE] text-[#6E5D53] border-[#E3D9CC]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Facing (Vastu direction)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "North facing",
                      "East facing",
                      "West facing",
                      "South facing",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setPropertyDetails({
                            ...propertyDetails,
                            facing: opt,
                          })
                        }
                        className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                          propertyDetails.facing === opt
                            ? "bg-[#C5924E]/20 text-[#2D1F1A] border-[#C5924E] font-bold shadow-xs"
                            : "bg-[#F8F5EE] text-[#6E5D53] border-[#E3D9CC]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Food / cooking preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Veg and non-veg both allowed",
                      "Veg only",
                      "Non-veg only",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setPropertyDetails({
                            ...propertyDetails,
                            foodPreference: opt,
                          })
                        }
                        className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                          propertyDetails.foodPreference === opt
                            ? "bg-[#C5924E]/20 text-[#2D1F1A] border-[#C5924E] font-bold shadow-xs"
                            : "bg-[#F8F5EE] text-[#6E5D53] border-[#E3D9CC]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Amenities and nearby places
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: "lift", label: "Lift" },
                      { key: "water247", label: "24x7 water supply" },
                      { key: "securityGuard", label: "Security guard" },
                      { key: "schoolsNearby", label: "Schools nearby" },
                      { key: "hospitalNearby", label: "Hospital nearby" },
                      { key: "parkNearby", label: "Park nearby" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={propertyDetails.amenities[item.key]}
                          onChange={(e) =>
                            setPropertyDetails({
                              ...propertyDetails,
                              amenities: {
                                ...propertyDetails.amenities,
                                [item.key]: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-[#E3D9CC] text-[#C5924E] focus:ring-0"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add another option, e.g. Metro station nearby"
                      value={propertyDetails.newAmenityInput}
                      onChange={(e) =>
                        setPropertyDetails({
                          ...propertyDetails,
                          newAmenityInput: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!propertyDetails.newAmenityInput.trim()) return;
                        setPropertyDetails((prev) => ({
                          ...prev,
                          customAmenities: [
                            ...prev.customAmenities,
                            prev.newAmenityInput.trim(),
                          ],
                          newAmenityInput: "",
                        }));
                      }}
                      className="px-4 py-2 bg-white border border-[#C5924E] text-[#2D1F1A] rounded-xl text-xs font-bold hover:bg-[#C5924E]/10 transition-all cursor-pointer"
                    >
                      Add option
                    </button>
                  </div>
                  {propertyDetails.customAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {propertyDetails.customAmenities.map((custom, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5924E]/10 border border-[#C5924E]/40 rounded-full text-xs text-[#2D1F1A]"
                        >
                          ✓ {custom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VISIT AVAILABILITY */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Set your visit availability
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  Tenants can only request a visit inside the slots you open
                  below. Nothing is booked until you confirm it.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setBookingMode("manual")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        bookingMode === "manual"
                          ? "border-[#C5924E] bg-[#C5924E]/5 shadow-xs"
                          : "border-[#E3D9CC] bg-[#F8F5EE]/50"
                      }`}
                    >
                      <strong className="block text-xs font-bold text-[#2D1F1A]">
                        I'll confirm each one
                      </strong>
                      <span className="text-[11px] text-[#6E5D53]">
                        You approve or decline every visit request yourself.
                      </span>
                    </div>

                    <div
                      onClick={() => setBookingMode("auto")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        bookingMode === "auto"
                          ? "border-[#C5924E] bg-[#C5924E]/5 shadow-xs"
                          : "border-[#E3D9CC] bg-[#F8F5EE]/50"
                      }`}
                    >
                      <strong className="block text-xs font-bold text-[#2D1F1A]">
                        Auto-accept requests
                      </strong>
                      <span className="text-[11px] text-[#6E5D53]">
                        Any request inside your open slots is confirmed
                        instantly.
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E5D53]">
                    Click or drag across the grid to open time blocks for
                    visits.
                  </p>

                  <div className="overflow-x-auto border border-[#E3D9CC] rounded-2xl p-4 bg-[#F8F5EE]/30">
                    <div className="min-w-[450px]">
                      <div className="grid grid-cols-8 gap-1 mb-2 text-[11px] font-bold text-center text-[#6E5D53]">
                        <div></div>
                        {dayNames.map((d) => (
                          <div key={d}>{d}</div>
                        ))}
                      </div>
                      {hoursList.map((hourLabel, rowIdx) => (
                        <div
                          key={hourLabel}
                          className="grid grid-cols-8 gap-1 mb-1 items-center"
                        >
                          <div className="text-[10px] text-[#6E5D53] font-medium text-right pr-2">
                            {hourLabel}
                          </div>
                          {dayNames.map((_, colIdx) => {
                            const isOn = slotGrid[rowIdx][colIdx];
                            return (
                              <div
                                key={colIdx}
                                onMouseDown={(e) =>
                                  handleSlotMouseDown(rowIdx, colIdx, e)
                                }
                                onMouseEnter={() =>
                                  handleSlotMouseEnter(rowIdx, colIdx)
                                }
                                className={`h-8 rounded-lg cursor-pointer transition-colors border ${
                                  isOn
                                    ? "bg-[#C5924E] border-[#b07f3e]"
                                    : "bg-white border-[#E3D9CC] hover:bg-[#E3D9CC]/40"
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D1F1A]">
                      Visitors per slot
                    </label>
                    <select
                      value={visitorsPerSlot}
                      onChange={(e) => setVisitorsPerSlot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                    >
                      <option>1 (private visit)</option>
                      <option>Up to 3 (group showing)</option>
                      <option>Up to 5 (open house)</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F5EE] border border-[#E3D9CC]">
                      <div>
                        <strong className="block text-xs font-bold text-[#2D1F1A]">
                          Notify me for every request
                        </strong>
                        <span className="text-[10px] text-[#6E5D53]">
                          Get a message the moment a tenant requests a visit
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifyEveryRequest(!notifyEveryRequest)
                        }
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifyEveryRequest ? "bg-[#C5924E]" : "bg-[#D1C4B9]"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            notifyEveryRequest
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F5EE] border border-[#E3D9CC]">
                      <div>
                        <strong className="block text-xs font-bold text-[#2D1F1A]">
                          Allow tenants to request another day
                        </strong>
                        <span className="text-[10px] text-[#6E5D53]">
                          Tenant can ask for a time outside your open slots — it
                          stays pending until you accept it
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAllowOtherDay(!allowOtherDay)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          allowOtherDay ? "bg-[#C5924E]" : "bg-[#D1C4B9]"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            allowOtherDay ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#F8F5EE] border border-[#E3D9CC] p-6 rounded-3xl space-y-4 shadow-xs">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2D1F1A]">
                      How tenants will see this
                    </h4>
                    <p className="text-[10px] text-[#6E5D53]">
                      Availability updates live as you edit the grid
                    </p>
                  </div>
                  <div className="grid grid-cols-7 gap-1 bg-white p-2 rounded-2xl border border-[#E3D9CC]">
                    {dayNames.map((dName, dIdx) => {
                      const hasOpenSlot = slotGrid.some((row) => row[dIdx]);
                      return (
                        <button
                          key={dName}
                          onClick={() => setPickedDayIndex(dIdx)}
                          className={`py-2 rounded-xl text-center text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            pickedDayIndex === dIdx
                              ? "bg-[#2D1F1A] text-white"
                              : "text-[#6E5D53] hover:bg-[#F8F5EE]"
                          }`}
                        >
                          <span>{dName}</span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasOpenSlot ? "bg-[#C5924E]" : "bg-transparent"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center py-2 bg-white rounded-xl border border-[#E3D9CC] text-xs text-[#6E5D53]">
                    Tap a day to see open times
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Confirm the location address
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  Type or search your property address. The map updates
                  automatically, and the exact coordinates are pinned.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative space-y-2 z-40">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Property Address <span className="text-red-500">*</span>
                  </label>
                  <AddressAutocomplete
                    value={locationAddress}
                    onChange={(val) => setLocationAddress(val)}
                    onSelect={(formattedAddress, lat, lon) => {
                      setLocationAddress(formattedAddress);
                      if (lat && lon) {
                        setLatitude(lat);
                        setLongitude(lon);
                        setMapCenter([lat, lon]);
                      }
                    }}
                  />
                </div>

                <div className="relative z-10 w-full h-64 rounded-2xl overflow-hidden border border-[#E3D9CC] shadow-xs">
                  <MapContainer
                    center={mapCenter}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <RecenterMap center={mapCenter} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapCenter} />
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION FOOTER BUTTONS */}
          <div className="flex items-center justify-between pt-8 border-t border-[#E3D9CC] mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                currentStep === 1
                  ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                  : "bg-white border-[#E3D9CC] text-[#2D1F1A] hover:bg-[#F8F5EE] cursor-pointer"
              }`}
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && photos.length < 3) {
                  alert("Please add at least 3 photos before continuing.");
                  return;
                }
                if (currentStep === 2) {
                  if (!propertyDetails.title.trim()) {
                    alert("Please enter a property title.");
                    return;
                  }
                  if (!propertyDetails.monthlyRent) {
                    alert("Please enter the monthly rent.");
                    return;
                  }
                  if (!propertyDetails.securityDeposit) {
                    alert("Please enter the security deposit.");
                    return;
                  }
                  if (!propertyDetails.builtUpArea) {
                    alert("Please enter the built-up area.");
                    return;
                  }
                  if (!propertyDetails.floorDetails.trim()) {
                    alert("Please enter floor details.");
                    return;
                  }
                } else if (currentStep === 4) {
                  if (!locationAddress.trim()) {
                    alert("Please enter or select a valid address.");
                    return;
                  }
                }

                if (currentStep < totalSteps) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  handlePublishProperty();
                }
              }}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#C5924E] text-[#2D1F1A] hover:bg-[#b07f3e] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {currentStep === totalSteps ? "Review and publish" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

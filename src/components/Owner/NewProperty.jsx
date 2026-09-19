import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

import {
  MapPin,
  Loader2,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Check,
  Image,
  FileText,
} from "lucide-react";

// Leaflet components and styles for free map rendering
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AddressAutocomplete from "./AddressAutocomplete";

// Fix for default marker icons missing in React-Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to smoothly center Leaflet when coordinates change programmatically
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function NewProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Request browser notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Photos state
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Step 2: Property details state
  const [propertyDetails, setPropertyDetails] = useState({
    title: "",
    description: "",
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

  // Step 3: Weekly Timetable & Slot Booking State
  const [bookingMode, setBookingMode] = useState("manual");
  const [visitorsPerSlot, setVisitorsPerSlot] = useState("1 (private visit)");
  const [notifyEveryRequest, setNotifyEveryRequest] = useState(true);
  const [allowOtherDay, setAllowOtherDay] = useState(true);

  // Weekly timetable generator configuration
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Default Mon-Fri (0=Sun, 1=Mon...6=Sat)
  const [timetableStartDate, setTimetableStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [timetableEndDate, setTimetableEndDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);

  const daysOfWeek = [
    { id: 1, label: "Mon" },
    { id: 2, label: "Tue" },
    { id: 3, label: "Wed" },
    { id: 4, label: "Thu" },
    { id: 5, label: "Fri" },
    { id: 6, label: "Sat" },
    { id: 0, label: "Sun" },
  ];

  const toggleDaySelection = (dayId) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) {
        alert("Please select at least one active day for visits.");
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const [ownerSlots, setOwnerSlots] = useState([
    {
      date: new Date().toISOString().split("T")[0],
      start_time: "10:00",
      end_time: "11:00",
      is_booked: false,
      status: "available",
    },
  ]);

  const handleGenerateWeeklyTimetable = (e) => {
    e.preventDefault();
    if (!timetableStartDate || !timetableEndDate || !startTime || !endTime) {
      alert("Please fill in the timetable start date, end date, and time range.");
      return;
    }

    let current = new Date(timetableStartDate);
    const last = new Date(timetableEndDate);
    const slotsToPush = [];

    while (current <= last) {
      const dayOfWeek = current.getDay(); // 0 for Sunday, 1 for Monday, etc.

      // Check if this day is selected in the weekly timetable structure
      if (selectedDays.includes(dayOfWeek)) {
        const dateStr = current.toISOString().split("T")[0];

        let [sHour, sMin] = startTime.split(":").map(Number);
        let [eHour, eMin] = endTime.split(":").map(Number);

        let currentMinutes = sHour * 60 + sMin;
        const endMinutes = eHour * 60 + eMin;

        while (currentMinutes + slotDurationMinutes <= endMinutes) {
          const sh = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
          const sm = String(currentMinutes % 60).padStart(2, "0");

          const nextMinutes = currentMinutes + slotDurationMinutes;
          const eh = String(Math.floor(nextMinutes / 60)).padStart(2, "0");
          const em = String(nextMinutes % 60).padStart(2, "0");

          slotsToPush.push({
            date: dateStr,
            start_time: `${sh}:${sm}`,
            end_time: `${eh}:${em}`,
            is_booked: false,
            status: "available",
          });

          currentMinutes = nextMinutes;
        }
      }

      // Move to next calendar day
      current.setDate(current.getDate() + 1);
    }

    if (slotsToPush.length === 0) {
      alert("No slots generated. Ensure your date range covers your selected days and time bounds.");
      return;
    }

    // Filter out duplicates already in state
    const filteredNewEntries = slotsToPush.filter(
      (newEntry) =>
        !ownerSlots.some(
          (existing) =>
            existing.date === newEntry.date &&
            existing.start_time === newEntry.start_time &&
            existing.end_time === newEntry.end_time
        )
    );

    if (filteredNewEntries.length === 0) {
      alert("All slots generated for this structure have already been added.");
      return;
    }

    setOwnerSlots([...ownerSlots, ...filteredNewEntries]);
    alert(`Successfully generated and added ${filteredNewEntries.length} timetable slots!`);
  };

  const handleRemoveSlot = (index) => {
    setOwnerSlots(ownerSlots.filter((_, i) => i !== index));
  };

  // Step 4: Location State & Leaflet Map Handler
  const [locationAddress, setLocationAddress] = useState(
    "Bengaluru, Karnataka",
  );
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);

  // Handle Marker drag to update coordinates and reverse geocode if needed
  const handleMarkerDragEnd = async (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setLatitude(position.lat);
    setLongitude(position.lng);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setLocationAddress(data.display_name);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

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

  // DATABASE SUBMISSION LOGIC
  const handlePublishProperty = async () => {
    setIsSubmitting(true);

    try {
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

      const propertyPayload = {
        owner_id: ownerId,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        owner_email: ownerEmail,
        title:
          propertyDetails.title ||
          `${propertyDetails.configuration} ${propertyDetails.propertyType}`,
        description: propertyDetails.description,
        location: locationAddress,
        latitude: latitude,
        longitude: longitude,
        price: parseFloat(propertyDetails.monthlyRent) || 0,
        type: propertyDetails.propertyType,
        status: "Active",
        views: 0,
        images: uploadedImageUrls,
        image_url: uploadedImageUrls[0] || "",

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

        amenities: propertyDetails.amenities,
        custom_amenities: propertyDetails.customAmenities,
        visit_availability: {
          mode: bookingMode,
          visitorsPerSlot,
          notifyEveryRequest,
          allowOtherDay,
        },
      };

      const { data: insertedProperty, error: insertError } = await supabase
        .from("properties")
        .insert([propertyPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      const propertyId = insertedProperty.id;
      const validSlots = ownerSlots
        .filter((slot) => slot.date && slot.start_time && slot.end_time)
        .map((slot) => ({
          property_id: propertyId,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_booked: false,
          status: slot.status || "available",
        }));

      if (validSlots.length > 0) {
        const { error: slotError } = await supabase
          .from("property_visit_slots")
          .insert(validSlots);

        if (slotError) {
          console.error("Error saving slots:", slotError.message);
        }
      }

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: ownerId,
            title: "Property Published!",
            message: `Your listing "${insertedProperty.title}" is now live.`,
            type: "system",
            reference_id: propertyId,
            is_read: false,
          },
        ]);

      if (notificationError) {
        console.error("Error saving notification:", notificationError.message);
      }

      if ("serviceWorker" in navigator && "Notification" in window && Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Property Published!", {
            body: `Your listing "${insertedProperty.title}" is now live for tenants to see.`,
            icon: "/favicon.ico",
          });
        }).catch((err) => {
          console.error("Service worker notification error:", err);
        });
      }

      alert("Property and visit slots published successfully!");
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
      className={`flex flex-col w-full min-h-screen relative transition-opacity duration-500 overflow-x-hidden box-border pb-12 ${
        isSubmitting ? "opacity-90" : "opacity-100"
      }`}
    >
      {/* LOADING OVERLAY */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-[#2D1F1A]/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white px-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5924E] mb-4" />
          <p className="font-serif font-bold text-lg sm:text-xl">
            Publishing your property & slots...
          </p>
          <p className="text-xs text-[#9E8B7F] mt-1">
            Please wait while we save your listing
          </p>
        </div>
      )}

      {/* HEADER TITLE SECTION */}
      <div className="px-3 sm:px-10 pt-4 sm:pt-6 pb-2 flex flex-col gap-1 w-full box-border">
        <h1 className="text-lg sm:text-3xl font-serif font-bold text-[#2D1F1A] break-words">
          List a new property
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5D53] mt-0.5 leading-relaxed">
          Add photos, details, your visit availability, and the address.
        </p>
      </div>

      {/* STEPPER NAVIGATION BAR */}
      <div className="px-3 sm:px-10 py-3 sm:py-4 w-full box-border">
        <div className="hidden md:grid md:grid-cols-4 gap-3">
          {[
            { step: 1, label: "Photos", sub: "Show your home" },
            {
              step: 2,
              label: "Property details",
              sub: "Furnishing, rent, amenities",
            },
            {
              step: 3,
              label: "Visit availability",
              sub: "Weekly timetable schedule",
            },
            { step: 4, label: "Location", sub: "Enter your address" },
          ].map((item) => {
            const isSelected = currentStep === item.step;
            const isCompleted = item.step < currentStep;
            return (
              <button
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep) {
                    setCurrentStep(item.step);
                  }
                }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all border ${
                  item.step < currentStep ? "cursor-pointer" : "cursor-default"
                } ${
                  isSelected
                    ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-md ring-2 ring-[#C5924E]/30"
                    : isCompleted
                    ? "bg-white text-[#2D1F1A] border-[#C5924E]/40 hover:bg-[#F2ECE1]/50"
                    : "bg-white text-[#6E5D53] border-[#E3D9CC] hover:bg-[#F2ECE1]/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all ${
                    isSelected
                      ? "bg-[#C5924E] text-[#2D1F1A]"
                      : isCompleted
                      ? "bg-[#C5924E] text-[#2D1F1A]"
                      : "bg-[#F8F5EE] text-[#6E5D53] border border-[#E3D9CC]"
                  }`}
                >
                  {isCompleted ? "✓" : item.step}
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

        {/* Mobile Stepper */}
        <div className="block md:hidden w-full bg-white border border-[#E3D9CC] rounded-2xl p-4 shadow-xs box-border overflow-hidden">
          <div className="flex items-center justify-between relative px-4">
            <div className="absolute left-10 right-10 top-4 h-1 bg-[#F2ECE1] rounded-full z-0" />
            <div
              className="absolute left-10 top-4 h-1 bg-[#C5924E] rounded-full transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / 3) * 68}%` }}
            />

            {[
              {
                step: 1,
                label: "Photos",
                icon: <Image className="w-3.5 h-3.5" />,
              },
              {
                step: 2,
                label: "Details",
                icon: <FileText className="w-3.5 h-3.5" />,
              },
              { step: 3, label: "Slots", icon: <Clock className="w-3.5 h-3.5" /> },
              {
                step: 4,
                label: "Location",
                icon: <MapPin className="w-3.5 h-3.5" />,
              },
            ].map((item) => {
              const isCompleted = item.step < currentStep;
              const isSelected = item.step === currentStep;

              return (
                <div
                  key={item.step}
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step);
                  }}
                  className={`flex flex-col items-center relative z-10 ${
                    item.step < currentStep ? "cursor-pointer" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                      isSelected
                        ? "bg-[#2D1F1A] text-[#C5924E] ring-4 ring-[#C5924E]/25"
                        : isCompleted
                        ? "bg-[#C5924E] text-[#2D1F1A]"
                        : "bg-white text-[#6E5D53] border-2 border-[#E3D9CC]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.icon}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                      isSelected ? "text-[#2D1F1A] font-bold" : "text-[#6E5D53]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FORM BODY PANEL */}
      <div className="px-3 sm:px-10 pb-16 max-w-7xl w-full mx-auto space-y-6 flex-1 box-border">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E3D9CC] p-4 sm:p-10 shadow-xs box-border">
          {/* STEP 1: PHOTOS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
                  Upload photos
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-relaxed">
                  Clear, well-lit photos get more visit requests. The first photo
                  becomes the cover image.
                </p>
              </div>

              <label
                htmlFor="photo-input"
                className="border-2 border-dashed border-[#C5924E]/50 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-[#F8F5EE]/50 hover:bg-[#F8F5EE] transition-all cursor-pointer box-border"
              >
                <div className="w-10 h-10 text-[#C5924E] flex items-center justify-center mb-2 text-xl font-bold bg-white rounded-full shadow-xs">
                  ↑
                </div>
                <strong className="text-xs sm:text-sm font-bold text-[#2D1F1A]">
                  Tap here to upload photos
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
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
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md cursor-pointer"
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
                  <span className="text-amber-600 block sm:inline mt-1 sm:mt-0">
                    Add at least {3 - photos.length} more photo(s) to continue.
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
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
                  Property details
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-relaxed">
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Property Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Write a short description about the highlights, neighborhood, or rules..."
                    value={propertyDetails.description}
                    onChange={(e) =>
                      setPropertyDetails({
                        ...propertyDetails,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Built-up area (sq. ft.) <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Furnishing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium border cursor-pointer transition-all text-center truncate ${
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Any", "Family", "Bachelors", "Working professionals"].map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setPropertyDetails({
                              ...propertyDetails,
                              preferredTenant: opt,
                            })
                          }
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium border cursor-pointer transition-all text-center truncate ${
                            propertyDetails.preferredTenant === opt
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
                    Parking
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium border cursor-pointer transition-all text-center truncate ${
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
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                  <div className="grid grid-cols-3 gap-2">
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
                        className={`px-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-medium border cursor-pointer transition-all text-center truncate ${
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
                  <div className="grid grid-cols-2 gap-2">
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
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border cursor-pointer transition-all text-center truncate ${
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border cursor-pointer transition-all text-center truncate ${
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: "lift", label: "Lift" },
                      { key: "water247", label: "24x7 water" },
                      { key: "securityGuard", label: "Security guard" },
                      { key: "schoolsNearby", label: "Schools nearby" },
                      { key: "hospitalNearby", label: "Hospital nearby" },
                      { key: "parkNearby", label: "Park nearby" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 text-xs cursor-pointer p-2 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]"
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
                          className="rounded border-[#E3D9CC] text-[#C5924E] focus:ring-0 w-4 h-4 flex-shrink-0"
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="e.g. Metro station nearby"
                      value={propertyDetails.newAmenityInput}
                      onChange={(e) =>
                        setPropertyDetails({
                          ...propertyDetails,
                          newAmenityInput: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
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
                      className="px-4 py-3 bg-white border border-[#C5924E] text-[#2D1F1A] rounded-xl text-xs font-bold hover:bg-[#C5924E]/10 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Add option
                    </button>
                  </div>
                  {propertyDetails.customAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {propertyDetails.customAmenities.map((custom, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5924E]/10 border border-[#C5924E]/45 rounded-full text-xs text-[#2D1F1A] max-w-full break-words"
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

          {/* STEP 3: WEEKLY TIMETABLE SLOT BUILDER */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
                  Weekly Timetable & Visit Schedule
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-relaxed">
                  Select active days of the week, define start/end hour boundaries, and pick an overall end date.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
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
                    <span className="text-[11px] text-[#6E5D53] leading-relaxed block mt-0.5">
                      You approve or decline every request yourself.
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
                    <span className="text-[11px] text-[#6E5D53] leading-relaxed block mt-0.5">
                      Requests inside your open slots are confirmed instantly.
                    </span>
                  </div>
                </div>

                <div className="bg-[#F8F5EE] border border-[#E3D9CC] p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 box-border">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2D1F1A] flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#C5924E]" />
                    Weekly Timetable Structure
                  </h4>

                  {/* Day Picker Grid */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#8A7568]">1. Select Available Days of the Week</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => {
                        const isSelected = selectedDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDaySelection(day.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#2D1F1A] text-white border-[#2D1F1A] shadow-xs"
                                : "bg-white text-[#6E5D53] border-[#E3D9CC]"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Range Structure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#8A7568] mb-1">2. Timetable Start Date</label>
                      <input
                        type="date"
                        value={timetableStartDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setTimetableStartDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#EADBCE] bg-white text-xs font-bold text-[#2D1F1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A7568] mb-1">3. Timetable End Date</label>
                      <input
                        type="date"
                        value={timetableEndDate}
                        min={timetableStartDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setTimetableEndDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#EADBCE] bg-white text-xs font-bold text-[#2D1F1A]"
                      />
                    </div>
                  </div>

                  {/* Time Blocks & Durations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#8A7568] mb-1">Daily Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#EADBCE] bg-white text-xs font-bold text-[#2D1F1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A7568] mb-1">Daily End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#EADBCE] bg-white text-xs font-bold text-[#2D1F1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A7568] mb-1">Slot Duration</label>
                      <select
                        value={slotDurationMinutes}
                        onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-[#EADBCE] bg-white text-xs font-bold text-[#2D1F1A]"
                      >
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                        <option value={120}>2 Hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end border-t border-[#E3D9CC]">
                    <button
                      type="button"
                      onClick={handleGenerateWeeklyTimetable}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#C5924E] text-[#2D1F1A] hover:bg-[#b07f3e] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Generate Timetable Slots
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold text-[#2D1F1A] uppercase tracking-wider">
                    Generated Schedule Slots ({ownerSlots.length})
                  </h5>

                  {ownerSlots.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      No slots generated yet. Configure your weekly timetable structure above.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
                      {ownerSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border border-[#E3D9CC] rounded-2xl shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#C5924E]/10 flex items-center justify-center text-[#C5924E] flex-shrink-0">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <strong className="block text-xs font-bold text-[#2D1F1A] truncate">
                                {slot.date}
                              </strong>
                              <span className="text-[11px] text-[#6E5D53] truncate block">
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-[#2D1F1A]">
                    Visitors per slot
                  </label>
                  <select
                    value={visitorsPerSlot}
                    onChange={(e) => setVisitorsPerSlot(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] box-border"
                  >
                    <option>1 (private visit)</option>
                    <option>Up to 3 (group showing)</option>
                    <option>Up to 5 (open house)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION WITH LEAFLET MAP */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
                  Confirm the location address
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-relaxed">
                  Type or search your property address. Drag the pin on the map
                  to adjust coordinates precisely.
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
                      }
                    }}
                  />
                </div>

                <div className="relative z-10 w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#E3D9CC] shadow-xs box-border">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={15}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <MapController center={[latitude, longitude]} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[latitude, longitude]}
                      draggable={true}
                      eventHandlers={{
                        dragend: handleMarkerDragEnd,
                      }}
                    >
                      <Popup>
                        <span className="font-bold text-[#2D1F1A]">
                          {locationAddress}
                        </span>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION FOOTER BUTTONS */}
          <div className="flex items-center justify-between pt-6 sm:pt-8 border-t border-[#E3D9CC] mt-8 gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-5 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
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
                } else if (currentStep === 3) {
                  if (ownerSlots.length === 0) {
                    alert("Please generate and add timetable slots.");
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
              className="flex-1 sm:flex-none px-6 py-3 bg-[#C5924E] text-[#2D1F1A] hover:bg-[#b07f3e] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
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
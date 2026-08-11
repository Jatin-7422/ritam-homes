import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/whitelogo.png";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarCheck,
  Calendar,
  Users,
  IndianRupee,
  FileText,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
  Loader2,
  Menu,
  X,
  MapPin,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function AddPropertyDashboard() {
  const [activeTab, setActiveTab] = useState("Add New Property");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Rahul",
    email: "",
    avatar: "",
  });

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

  // Step 4: Location & Google Maps State
  const [locationData, setLocationData] = useState({
    addressSearch: "",
    lat: 12.9716,
    lng: 77.5946,
    addressText: "Bengaluru, Karnataka",
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch Session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && session.user) {
          const user = session.user;
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email.split("@")[0];
          setUserProfile({
            name: fullName.charAt(0).toUpperCase() + fullName.slice(1),
            email: user.email,
            avatar: user.user_metadata?.avatar_url || "",
          });
        }
      } catch (err) {
        console.error("Auth session error:", err);
      }
    };
    fetchSession();
  }, []);

  // Auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      }
    });
    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 600);
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

  // Load Google Maps API Script dynamically when Step 4 is active
  useEffect(() => {
    if (currentStep !== 4) return;

    const apiKey =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      "AIzaSyDcXRgjLqeMmRbNgtgwfuN91pjL0b4XKxw";

    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      initGoogleMap();
      return;
    }

    if (document.getElementById("google-maps-script")) {
      const checkinterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkinterval);
          setIsMapLoaded(true);
          initGoogleMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
      initGoogleMap();
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script.");
    };
    document.head.appendChild(script);
  }, [currentStep]);

  // Initialize Google Map & Autocomplete
  const initGoogleMap = () => {
    if (!mapContainerRef.current || !window.google) return;

    const initialLat = locationData.lat;
    const initialLng = locationData.lng;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: initialLat, lng: initialLng },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: { lat: initialLat, lng: initialLng },
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    markerInstanceRef.current = marker;

    marker.addListener("dragend", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      updateLocationFromCoords(lat, lng);
    });

    map.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });
      updateLocationFromCoords(lat, lng);
    });

    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: ["in"] },
        },
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addressText = place.formatted_address || place.name;

        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });

        setLocationData({
          addressSearch: addressText,
          lat,
          lng,
          addressText,
        });
      });
    }
  };

  const updateLocationFromCoords = (lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressText = results[0].formatted_address;
        setLocationData((prev) => ({
          ...prev,
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          addressText,
          addressSearch: addressText,
        }));
      } else {
        setLocationData((prev) => ({
          ...prev,
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          addressText: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        }));
      }
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(16);
            markerInstanceRef.current.setPosition({ lat, lng });
          }
          updateLocationFromCoords(lat, lng);
        },
        () => {
          alert(
            "Location access denied. Please search your address or click on the map.",
          );
        },
      );
    }
  };

  // DATABASE SUBMISSION LOGIC
  const handlePublishProperty = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("Your session has expired. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      const ownerId = session.user.id;

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
        title:
          propertyDetails.title ||
          `${propertyDetails.configuration} ${propertyDetails.propertyType}`,
        description: `${propertyDetails.furnishing}, ${propertyDetails.facing}, Preferred: ${propertyDetails.preferredTenant}. Water Supply: ${propertyDetails.waterSupply}.`,
        price: parseFloat(propertyDetails.monthlyRent) || 0,
        location: locationData.addressText,
        latitude: locationData.lat,
        longitude: locationData.lng,
        images: uploadedImageUrls,
      };

      const { error: insertError } = await supabase
        .from("properties")
        .insert([propertyPayload]);

      if (insertError) throw insertError;

      alert("Property published and saved successfully!");
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
      className={`min-h-screen bg-[#F8F5EE] font-sans text-[#2D1F1A] flex flex-col md:flex-row relative transition-opacity duration-500 ${isLoggingOut || isSubmitting ? "opacity-90" : "opacity-100"}`}
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

      {/* LOGOUT OVERLAY */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-[#2D1F1A]/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5924E] mb-4" />
          <p className="font-serif font-bold text-xl">
            Logging out securely...
          </p>
          <p className="text-xs text-[#9E8B7F] mt-1">
            Redirecting to login page
          </p>
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`w-72 bg-[#2D1F1A] text-[#D1C4B9] flex flex-col justify-between flex-shrink-0 z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Close */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/15 flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logoWhite}
                alt="Ritam Homes"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#D1C4B9] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="mx-3 my-3 p-3 bg-[#221A17] border border-[#3A2E2A] rounded-xl flex items-center gap-3 shadow-inner flex-shrink-0">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover border border-[#C5924E]/50"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#C5924E] flex items-center justify-center text-[#2D1F1A] font-bold text-sm shadow">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-xs truncate">
                {userProfile.name}
              </h4>
              <p className="text-[10px] text-[#9E8B7F] truncate">
                {userProfile.email}
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-green-400 font-medium">
                <ShieldCheck className="w-3 h-3" /> Verified Owner
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 text-xs font-medium overflow-y-auto flex-1 custom-scrollbar">
            {[
              {
                name: "Dashboard",
                icon: LayoutDashboard,
                path: "/owner-dashboard",
              },
              {
                name: "My Properties",
                icon: Building2,
                path: "/owner-properties",
              },
              { name: "Add New Property", icon: PlusCircle },
              { name: "Visit Requests", icon: CalendarCheck },
              { name: "Bookings", icon: Calendar },
              { name: "Tenants", icon: Users },
              { name: "Earnings", icon: IndianRupee },
              { name: "Documents", icon: FileText },
              { name: "Messages", icon: MessageSquare },
              { name: "Reviews", icon: Star },
              { name: "Account Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              if (item.path) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:bg-[#3A2E2A] hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#9E8B7F]" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#C5924E] text-[#2D1F1A] font-bold shadow-lg"
                      : "hover:bg-[#3A2E2A] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#2D1F1A]" : "text-[#9E8B7F]"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Logout Footer */}
          <div className="p-3 border-t border-white/10 bg-[#221A17]/50 flex-shrink-0">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="w-full bg-[#F8F5EE] px-6 sm:px-10 pt-6 pb-2 flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 bg-white border border-[#E3D9CC] rounded-xl text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 bg-white border border-[#E3D9CC] rounded-full text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
              List a new property
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
              Add photos, details, your visit availability, and the exact
              location.
            </p>
          </div>
        </header>

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
              { step: 4, label: "Location", sub: "Pin it on the map" },
            ].map((item) => {
              const isSelected = currentStep === item.step;
              return (
                <button
                  key={item.step}
                  onClick={() => setCurrentStep(item.step)}
                  className={`flex items-center gap-3.5 p-3 rounded-xl text-left transition-all cursor-pointer border ${
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
                      className={`block text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#2D1F1A]"}`}
                    >
                      {item.label}
                    </strong>
                    <span
                      className={`block text-[10px] truncate ${isSelected ? "text-[#C6B6A8]" : "text-[#6E5D53]"}`}
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
                      Property Title
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
                      Monthly rent (₹)
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
                      Security deposit (₹)
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
                      Built-up area (sq. ft.)
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
                      Floor / total floors
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
                            Tenant can ask for a time outside your open slots —
                            it stays pending until you accept it
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
                              className={`w-1.5 h-1.5 rounded-full ${hasOpenSlot ? "bg-[#C5924E]" : "bg-transparent"}`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-center py-2 bg-white rounded-xl border border-[#E3D9CC] text-xs text-[#6E5D53]">
                      Tap a day to see open times
                    </div>

                    <div className="border-2 border-dashed border-[#C5924E]/60 bg-white p-4 rounded-2xl space-y-3">
                      <div>
                        <strong className="block text-xs font-bold text-[#2D1F1A]">
                          Other day requested
                        </strong>
                        <p className="text-[10px] text-[#6E5D53]">
                          A tenant asked to visit on a day you haven't opened —
                          it waits here until you decide.
                        </p>
                      </div>

                      <div className="bg-[#F8F5EE] p-3 rounded-xl border border-[#E3D9CC] flex items-center justify-between gap-2 text-xs">
                        <div>
                          <strong className="block text-[#2D1F1A] font-bold">
                            Priya wants Wed, 8:00 PM
                          </strong>
                          <span className="text-[10px] text-[#6E5D53]">
                            Outside your current slots
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-white border border-[#E3D9CC] rounded-lg text-[10px] font-bold text-[#2D1F1A] hover:bg-gray-50 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-[#C5924E] text-[#2D1F1A] rounded-lg text-[10px] font-bold hover:bg-[#b07f3e] cursor-pointer"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
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
                    Confirm the location
                  </h3>
                  <p className="text-xs text-[#6E5D53] mt-0.5">
                    Search your address or click/drag the pin on the map so
                    tenants find the exact building.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search your address or locality"
                    value={locationData.addressSearch}
                    onChange={(e) =>
                      setLocationData({
                        ...locationData,
                        addressSearch: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                  <button
                    onClick={handleUseCurrentLocation}
                    type="button"
                    className="px-4 py-2.5 bg-white border border-[#C5924E] text-[#2D1F1A] rounded-xl text-xs font-bold hover:bg-[#C5924E]/10 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MapPin className="w-4 h-4 text-[#C5924E]" /> Use current
                    location
                  </button>
                </div>

                <div className="relative h-80 w-full rounded-2xl border border-[#E3D9CC] overflow-hidden shadow-inner bg-[#EFECE3]">
                  {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8F5EE]/80 z-10 text-xs text-[#6E5D53] gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />{" "}
                      Loading Google Maps...
                    </div>
                  )}
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>

                <div className="text-xs flex flex-col sm:flex-row justify-between gap-2 bg-[#F8F5EE] p-3 rounded-xl border border-[#E3D9CC]">
                  <div>
                    <span className="font-bold text-[#2D1F1A]">
                      Pinned Address:{" "}
                    </span>
                    <span className="text-[#6E5D53]">
                      {locationData.addressText}
                    </span>
                  </div>
                  <div className="text-[#6E5D53] font-mono text-[11px]">
                    Lat: {locationData.lat}, Lng: {locationData.lng}
                  </div>
                </div>
              </div>
            )}

            {/* STEP FOOTER NAVIGATION */}
            <div className="flex items-center justify-between pt-8 border-t border-[#E3D9CC] mt-8">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
                type="button"
                className="px-6 py-2.5 bg-white border border-[#E3D9CC] text-[#2D1F1A] rounded-xl text-xs font-bold hover:bg-[#F8F5EE] transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (currentStep < totalSteps) {
                    setCurrentStep((prev) => prev + 1);
                  } else {
                    handlePublishProperty();
                  }
                }}
                disabled={isSubmitting}
                type="button"
                className="px-6 py-2.5 bg-[#C5924E] text-[#2D1F1A] hover:bg-[#b07f3e] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {currentStep === totalSteps ? "Review and publish" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

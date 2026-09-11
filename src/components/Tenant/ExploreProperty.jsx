import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Map,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Home,
  Compass,
  X,
  Armchair,
  Navigation,
  Sparkles,
  Sliders
} from "lucide-react";

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ExploreProperty() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Location Input & Suggestion States
  const [locationInput, setLocationInput] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef(null);

  const [selectedType, setSelectedType] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");
  const [isMapView, setIsMapView] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle closing location dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      // Get current logged-in user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const tenantId = session?.user?.id;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If user is logged in, also fetch their saved properties wishlist
      let savedPropertyIds = new Set();
      if (tenantId) {
        const { data: savedData, error: savedError } = await supabase
          .from("saved_properties")
          .select("property_id")
          .eq("tenant_id", tenantId);

        if (!savedError && savedData) {
          savedData.forEach((item) => savedPropertyIds.add(item.property_id));
        }
      }

      const formattedData = (data || []).map((p) => ({
        ...p,
        lat: Number(p.latitude || p.lat || 12.9716),
        lng: Number(p.longitude || p.lng || 77.5946),
        isSaved: savedPropertyIds.has(p.id),
      }));

      setProperties(formattedData);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (e, propertyId) => {
    e.stopPropagation(); // Prevent card click event from triggering when clicking heart
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in as a tenant to save properties to your wishlist.");
        return;
      }

      const tenantId = session.user.id;
      const targetProperty = properties.find((p) => p.id === propertyId);
      if (!targetProperty) return;

      const currentlySaved = targetProperty.isSaved;

      if (currentlySaved) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("tenant_id", tenantId)
          .eq("property_id", propertyId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_properties")
          .insert([{ tenant_id: tenantId, property_id: propertyId }]);

        if (error) throw error;
      }

      setProperties(
        properties.map((p) =>
          p.id === propertyId ? { ...p, isSaved: !currentlySaved } : p,
        ),
      );
    } catch (err) {
      console.error("Error toggling saved property:", err.message || err);
    }
  };

  const categories = [
    "All",
    "Apartment",
    "Villa",
    "Independent House",
    "Studio",
    "PG/Co-living",
  ];

  // Extract unique locations for suggestions
  const uniqueLocations = [
    ...new Set(
      properties.map((p) => p.location || p.city || p.address).filter(Boolean),
    ),
  ];

  const filteredLocationSuggestions = uniqueLocations.filter((loc) =>
    loc.toLowerCase().includes(locationInput.toLowerCase()),
  );

  // Comprehensive Filtering Logic
  const filteredProperties = properties
    .filter((prop) => {
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !query ||
        prop.title?.toLowerCase().includes(query) ||
        prop.city?.toLowerCase().includes(query) ||
        prop.location?.toLowerCase().includes(query) ||
        prop.address?.toLowerCase().includes(query);

      const propType = (prop.type || prop.property_type || "").toLowerCase();
      const matchesCategory =
        selectedCategory === "All" ||
        propType.includes(selectedCategory.toLowerCase());

      const matchesTypeDropdown =
        selectedType === "All" || propType.includes(selectedType.toLowerCase());

      const propLoc = (
        prop.location ||
        prop.city ||
        prop.address ||
        ""
      ).toLowerCase();
      const matchesLocation =
        !locationInput ||
        locationInput === "All" ||
        propLoc.includes(locationInput.toLowerCase());

      const propBeds = Number(
        prop.configuration || prop.bedrooms || prop.bhk || prop.beds || 0,
      );
      const matchesBhk =
        selectedBhk === "All" ||
        (selectedBhk === "1 BHK" &&
          (prop.configuration?.includes("1") || propBeds === 1)) ||
        (selectedBhk === "2 BHK" &&
          (prop.configuration?.includes("2") || propBeds === 2)) ||
        (selectedBhk === "3 BHK" &&
          (prop.configuration?.includes("3") || propBeds === 3)) ||
        (selectedBhk === "4+ BHK" &&
          (prop.configuration?.includes("4") || propBeds >= 4));

      const rentPrice = Number(prop.price || prop.rent || 0);
      const matchesBudget =
        selectedBudget === "All" ||
        (selectedBudget === "Under ₹15,000" && rentPrice <= 15000) ||
        (selectedBudget === "₹15,000 - ₹30,000" &&
          rentPrice > 15000 &&
          rentPrice <= 30000) ||
        (selectedBudget === "Above ₹30,000" && rentPrice > 30000);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTypeDropdown &&
        matchesLocation &&
        matchesBhk &&
        matchesBudget
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.price || a.rent || 0);
      const priceB = Number(b.price || b.rent || 0);
      if (sortBy === "PriceLow") return priceA - priceB;
      if (sortBy === "PriceHigh") return priceB - priceA;
      return 0;
    });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setLocationInput("");
    setSelectedType("All");
    setSelectedBudget("All");
    setSelectedBhk("All");
    setSortBy("Relevance");
  };

  const mapCenter =
    filteredProperties.length > 0
      ? [filteredProperties[0].lat, filteredProperties[0].lng]
      : [12.9716, 77.5946];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 w-full">
        <div className="w-16 h-16 rounded-3xl bg-[#C5924E]/10 flex items-center justify-center text-[#C5924E] animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-xs font-serif font-medium tracking-wide text-[#6E5D53]">Curating available properties...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full bg-[#FAF7F2]/50 min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EADBCE]/60 w-full">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EADBCE] text-xs font-semibold text-[#2D1F1A] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5924E]" />
            <span>Verified Living Spaces</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D1F1A] tracking-tight">
            Explore Properties
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl font-normal">
            Discover handpicked homes loaded straight from our secure backend database, tailored for your next ideal move.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setIsMapView(!isMapView)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2.5 transition-all duration-300 transform active:scale-95 cursor-pointer ${isMapView
                ? "bg-[#2D1F1A] text-white shadow-md shadow-[#2D1F1A]/20"
                : "bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] text-[#2D1F1A]"
              }`}
          >
            <Map className={`w-4 h-4 ${isMapView ? "text-[#C5924E]" : "text-[#C5924E]"}`} />
            <span>{isMapView ? "Switch to Grid View" : "Explore on Map"}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EADBCE]/80 shadow-xs backdrop-blur-md grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
        {/* Interactive Searchable Location Input with Suggestions */}
        <div className="space-y-1 relative col-span-2 sm:col-span-1" ref={locationRef}>
          <label className="text-[10px] sm:text-[11px] font-bold text-[#8A7568] tracking-wider uppercase">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder="Search area..."
              className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#FAF7F2]/70 border border-[#EADBCE] rounded-xl sm:rounded-2xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] focus:bg-white transition-all shadow-2xs"
            />
            {locationInput && (
              <button
                onClick={() => setLocationInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D1F1A] p-1 cursor-pointer"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showLocationSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#EADBCE] rounded-2xl shadow-xl max-h-52 overflow-y-auto z-50 divide-y divide-[#FAF7F2]">
              <div
                onClick={() => {
                  setLocationInput("");
                  setShowLocationSuggestions(false);
                }}
                className="px-4 py-2.5 text-xs text-[#6E5D53] hover:bg-[#FAF7F2] cursor-pointer font-semibold transition-colors"
              >
                All Locations
              </div>
              {filteredLocationSuggestions.length > 0 ? (
                filteredLocationSuggestions.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setLocationInput(loc);
                      setShowLocationSuggestions(false);
                    }}
                    className="px-4 py-2.5 text-xs text-[#2D1F1A] hover:bg-[#FAF7F2] cursor-pointer font-medium truncate flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                    <span className="truncate">{loc}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 italic">
                  No matching locations found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] font-bold text-[#8A7568] tracking-wider uppercase">
            Property Type
          </label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#FAF7F2]/70 border border-[#EADBCE] rounded-xl sm:rounded-2xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] focus:bg-white transition-all cursor-pointer shadow-2xs truncate"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Independent House">Independent House</option>
              <option value="Studio">Studio</option>
              <option value="PG/Co-living">PG/Co-living</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5924E] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] font-bold text-[#8A7568] tracking-wider uppercase">
            Budget
          </label>
          <div className="relative">
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#FAF7F2]/70 border border-[#EADBCE] rounded-xl sm:rounded-2xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] focus:bg-white transition-all cursor-pointer shadow-2xs truncate"
            >
              <option value="All">Any Budget</option>
              <option value="Under ₹15,000">Under ₹15,000</option>
              <option value="₹15,000 - ₹30,000">₹15,000 - ₹30,000</option>
              <option value="Above ₹30,000">Above ₹30,000</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5924E] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] font-bold text-[#8A7568] tracking-wider uppercase">
            BHK
          </label>
          <div className="relative">
            <select
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#FAF7F2]/70 border border-[#EADBCE] rounded-xl sm:rounded-2xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] focus:bg-white transition-all cursor-pointer shadow-2xs truncate"
            >
              <option value="All">Any BHK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4+ BHK">4+ BHK</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5924E] pointer-events-none" />
          </div>
        </div>

        <div className="flex items-end col-span-2 sm:col-span-2 lg:col-span-1">
          <button
            onClick={resetFilters}
            className="w-full h-[38px] sm:h-[42px] bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#2D1F1A] rounded-xl sm:rounded-2xl text-xs font-bold transition-all duration-200 shadow-2xs flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5924E] group-hover:rotate-90 transition-transform duration-300" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Category Chips & Sorting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 shadow-2xs cursor-pointer ${selectedCategory === cat
                  ? "bg-[#2D1F1A] text-white shadow-md shadow-[#2D1F1A]/10 scale-[1.02]"
                  : "bg-white hover:bg-[#FAF7F2] text-[#6E5D53] border border-[#EADBCE]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
          <span className="text-xs font-medium text-[#6E5D53]">
            Showing <strong className="text-[#2D1F1A] font-bold">{filteredProperties.length}</strong> properties
          </span>
          <div className="flex items-center gap-2 bg-white border border-[#EADBCE] px-3.5 py-2 rounded-2xl text-xs text-[#2D1F1A] shadow-2xs">
            <span className="text-[#8A7568] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-[#2D1F1A] focus:outline-none cursor-pointer"
            >
              <option value="Relevance">Relevance</option>
              <option value="PriceLow">Price: Low to High</option>
              <option value="PriceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map View Integration */}
      {isMapView ? (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-[#EADBCE] shadow-md relative z-0">
          <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}`}
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredProperties.map((prop) => {
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${prop.lat},${prop.lng}`;
              return (
                <Marker key={prop.id} position={[prop.lat, prop.lng]}>
                  <Popup>
                    <div className="p-2 space-y-2.5 max-w-[220px] font-sans">
                      <p className="font-serif font-bold text-xs text-[#2D1F1A] leading-snug">
                        {prop.title}
                      </p>
                      <p className="text-xs text-[#C5924E] font-bold">
                        ₹{Number(prop.price || prop.rent || 0).toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                      </p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5924E] shrink-0" />
                        {prop.location || prop.city || prop.address}
                      </p>
                      <div className="flex gap-1.5 pt-1">
                        <Link
                          to={`/tenant-dashboard/property/${prop.id}`}
                          className="flex-1 text-center bg-[#2D1F1A] hover:bg-black text-white text-[11px] py-2 rounded-xl font-bold transition-all shadow-xs"
                        >
                          View Details
                        </Link>
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#C5924E] text-[11px] py-2 rounded-xl font-bold flex items-center justify-center transition-all shadow-xs"
                          title="Get Directions"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-[#EADBCE] space-y-5 shadow-xs max-w-2xl mx-auto my-12 w-full">
          <div className="w-20 h-20 bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl flex items-center justify-center mx-auto text-[#C5924E] shadow-inner">
            <Home className="w-10 h-10" />
          </div>
          <div className="space-y-1.5 px-6">
            <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
              No properties match your filters
            </h3>
            <p className="text-xs text-[#6E5D53] max-w-md mx-auto">
              Try adjusting or resetting your filter selections to view all available active listings in our database.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-[#2D1F1A] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {filteredProperties.map((property) => {
            let imageUrl =
              property.image_url ||
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";
            if (property.images) {
              if (
                Array.isArray(property.images) &&
                property.images.length > 0
              ) {
                imageUrl = property.images[0];
              } else if (typeof property.images === "string") {
                try {
                  const parsed = JSON.parse(property.images);
                  if (Array.isArray(parsed) && parsed.length > 0)
                    imageUrl = parsed[0];
                } catch {
                  imageUrl = property.images;
                }
              }
            }

            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`;

            return (
              <div
                key={property.id}
                onClick={() => navigate(`/tenant-dashboard/property/${property.id}`)}
                className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE]/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={property.title || "Property"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  <span className="absolute top-3.5 left-3.5 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-bold text-[#2D1F1A] uppercase tracking-wider shadow-sm border border-[#EADBCE]/50">
                    {property.type || property.property_type || "Apartment"}
                  </span>

                  <button
                    onClick={(e) => toggleSave(e, property.id)}
                    className="absolute top-3.5 right-3.5 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-rose-600 hover:bg-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${property.isSaved ? "fill-rose-600 text-rose-600" : "text-[#2D1F1A]"}`}
                    />
                  </button>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-[#2D1F1A] text-base leading-snug line-clamp-1 group-hover:text-[#C5924E] transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-xs text-[#6E5D53] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span className="truncate">
                        {property.location ||
                          property.city ||
                          property.address ||
                          "Location not specified"}
                      </span>
                    </p>
                  </div>

                  {/* Schema-Matched Display for BHK, Built-up Area, and Furnishing status */}
                  <div className="grid grid-cols-3 gap-1 text-[11px] text-[#6E5D53] bg-[#FAF7F2]/60 rounded-2xl border border-[#EADBCE]/50 p-2.5 text-center">
                    <div className="flex flex-col items-center justify-center border-r border-[#EADBCE]/60 pr-1">
                      <span className="flex items-center gap-1 font-bold text-[#2D1F1A] truncate">
                        <Bed className="w-3.5 h-3.5 text-[#C5924E]" />
                        {property.configuration || property.bhk || "-"}
                      </span>
                      <span className="text-[9px] font-medium text-[#8A7568] uppercase tracking-wider">BHK</span>
                    </div>

                    <div className="flex flex-col items-center justify-center border-r border-[#EADBCE]/60 px-1">
                      <span className="flex items-center gap-1 font-bold text-[#2D1F1A] truncate">
                        <Maximize2 className="w-3.5 h-3.5 text-[#C5924E]" />
                        {property.built_up_area || property.sqft || "-"}
                      </span>
                      <span className="text-[9px] font-medium text-[#8A7568] uppercase tracking-wider">Sq.Ft</span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1">
                      <span className="flex items-center gap-1 font-bold text-[#2D1F1A] truncate">
                        <Armchair className="w-3.5 h-3.5 text-[#C5924E]" />
                        {property.furnishing || "Unfurnished"}
                      </span>
                      <span className="text-[9px] font-medium text-[#8A7568] uppercase tracking-wider">Status</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-[#8A7568] uppercase tracking-wider">Rent</span>
                        <p className="font-serif font-bold text-lg text-[#C5924E] leading-tight">
                          ₹
                          {Number(
                            property.price || property.rent || 0,
                          ).toLocaleString()}
                          <span className="text-[10px] font-sans font-normal text-[#8A7568]">
                            /mo
                          </span>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link
                        to={`/tenant-dashboard/property/${property.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-3 bg-[#FAF7F2] hover:bg-[#2D1F1A] hover:text-white border border-[#EADBCE] text-[#2D1F1A] font-bold text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 text-center shadow-2xs group/btn"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C5924E] group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="py-3 px-3.5 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#C5924E] font-bold text-xs rounded-2xl transition-all flex items-center justify-center shadow-2xs"
                        title="Get Directions"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
        lat: Number(p.latitude || p.lat || 28.6139),
        lng: Number(p.longitude || p.lng || 77.209),
        isSaved: savedPropertyIds.has(p.id),
      }));

      setProperties(formattedData);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (propertyId) => {
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
        // Remove from saved_properties table
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("tenant_id", tenantId)
          .eq("property_id", propertyId);

        if (error) throw error;
      } else {
        // Insert into saved_properties table
        const { error } = await supabase
          .from("saved_properties")
          .insert([{ tenant_id: tenantId, property_id: propertyId }]);

        if (error) throw error;
      }

      // Update local state if successful
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
      : [28.6139, 77.209];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
            <Compass className="w-3.5 h-3.5 text-[#C5924E]" />
            <span>Property Marketplace</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            Explore Properties
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1">
            Find verified homes for rent loaded straight from our backend
            database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMapView(!isMapView)}
            className={`px-4 py-2.5 border rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all ${
              isMapView
                ? "bg-[#2D1F1A] text-white border-[#2D1F1A]"
                : "bg-white hover:bg-[#FAF7F2] border-[#EADBCE] text-[#2D1F1A]"
            }`}
          >
            <Map className="w-4 h-4 text-[#C5924E]" />
            <span>{isMapView ? "Grid View" : "Map View"}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Interactive Searchable Location Input with Suggestions */}
        <div className="space-y-1 relative" ref={locationRef}>
          <label className="text-[10px] font-bold text-[#8A7568] uppercase">
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
              placeholder="Type or select location..."
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E]"
            />
            {locationInput && (
              <button
                onClick={() => setLocationInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D1F1A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showLocationSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#EADBCE] rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
              <div
                onClick={() => {
                  setLocationInput("");
                  setShowLocationSuggestions(false);
                }}
                className="px-3 py-2 text-xs text-[#6E5D53] hover:bg-[#FAF7F2] cursor-pointer font-medium border-b border-[#F0E6D8]"
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
                    className="px-3 py-2 text-xs text-[#2D1F1A] hover:bg-[#FAF7F2] cursor-pointer font-medium truncate flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-[#C5924E] shrink-0" />
                    <span className="truncate">{loc}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 italic">
                  No matching locations found (type custom search)
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8A7568] uppercase">
            Property Type
          </label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Independent House">Independent House</option>
              <option value="Studio">Studio</option>
              <option value="PG/Co-living">PG/Co-living</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C5924E] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8A7568] uppercase">
            Budget
          </label>
          <div className="relative">
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] cursor-pointer"
            >
              <option value="All">Any Budget</option>
              <option value="Under ₹15,000">Under ₹15,000</option>
              <option value="₹15,000 - ₹30,000">₹15,000 - ₹30,000</option>
              <option value="Above ₹30,000">Above ₹30,000</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C5924E] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8A7568] uppercase">
            BHK
          </label>
          <div className="relative">
            <select
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] font-medium focus:outline-none focus:border-[#C5924E] cursor-pointer"
            >
              <option value="All">Any BHK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4+ BHK">4+ BHK</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C5924E] pointer-events-none" />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full h-[38px] bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#2D1F1A] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <X className="w-3.5 h-3.5 text-[#C5924E]" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Category Chips & Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#2D1F1A] text-white shadow-sm"
                  : "bg-white hover:bg-[#FAF7F2] text-[#6E5D53] border border-[#EADBCE]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-[#6E5D53]">
            Showing {filteredProperties.length} properties
          </span>
          <div className="flex items-center gap-2 bg-white border border-[#EADBCE] px-3 py-1.5 rounded-xl text-xs text-[#2D1F1A]">
            <span className="text-[#8A7568]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
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
        <div className="w-full h-[550px] rounded-3xl overflow-hidden border border-[#EADBCE] shadow-sm relative z-0">
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
            {filteredProperties.map((prop) => (
              <Marker key={prop.id} position={[prop.lat, prop.lng]}>
                <Popup>
                  <div className="p-1 space-y-2 max-w-[200px]">
                    <p className="font-bold text-xs text-[#2D1F1A]">
                      {prop.title}
                    </p>
                    <p className="text-[11px] text-[#C5924E] font-bold">
                      ₹{Number(prop.price || prop.rent || 0).toLocaleString()}
                      /mo
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {prop.location || prop.city || prop.address}
                    </p>
                    <Link
                      to={`/tenant-dashboard/property/${prop.id}`}
                      className="block text-center bg-[#2D1F1A] text-white text-[10px] py-1 rounded-lg font-bold"
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#EADBCE] space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl flex items-center justify-center mx-auto text-[#8C7A6B]">
            <Home className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              No properties match your filters
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Try resetting your filter selections to view all available
              listings.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3E2E27] transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            return (
              <div
                key={property.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] shadow-sm flex flex-col justify-between group hover:shadow-md transition-all"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={property.title || "Property"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold text-[#2D1F1A] uppercase tracking-wider shadow-sm border border-[#EADBCE]">
                    {property.type || property.property_type || "Apartment"}
                  </span>

                  <button
                    onClick={() => toggleSave(property.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-rose-600 hover:bg-white shadow-md transition-all"
                  >
                    <Heart
                      className={`w-4 h-4 ${property.isSaved ? "fill-rose-600 text-rose-600" : "text-[#2D1F1A]"}`}
                    />
                  </button>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-[#2D1F1A] text-base leading-snug line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-[#6E5D53] flex items-center gap-1">
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
                  <div className="grid grid-cols-3 gap-1 text-[11px] text-[#6E5D53] border-t border-b border-[#F0E6D8] py-2.5 text-center">
                    <div className="flex flex-col items-center justify-center border-r border-[#F0E6D8] pr-1">
                      <span className="flex items-center gap-0.5 font-bold text-[#2D1F1A] truncate">
                        <Bed className="w-3 h-3 text-[#C5924E]" />
                        {property.configuration || property.bhk || "-"}
                      </span>
                      <span className="text-[9px] text-[#8A7568]">BHK</span>
                    </div>

                    <div className="flex flex-col items-center justify-center border-r border-[#F0E6D8] px-1">
                      <span className="flex items-center gap-0.5 font-bold text-[#2D1F1A] truncate">
                        <Maximize2 className="w-3 h-3 text-[#C5924E]" />
                        {property.built_up_area || property.sqft || "-"}
                      </span>
                      <span className="text-[9px] text-[#8A7568]">Sq.Ft</span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1">
                      <span className="flex items-center gap-0.5 font-bold text-[#2D1F1A] truncate">
                        <Armchair className="w-3 h-3 text-[#C5924E]" />
                        {property.furnishing || "Unfurnished"}
                      </span>
                      <span className="text-[9px] text-[#8A7568]">Status</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#8A7568]">Rent</span>
                        <p className="font-serif font-bold text-base text-[#C5924E]">
                          ₹
                          {Number(
                            property.price || property.rent || 0,
                          ).toLocaleString()}
                          <span className="text-[10px] font-sans text-[#8A7568]">
                            /mo
                          </span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </span>
                    </div>

                    <div className="pt-1">
                      <Link
                        to={`/tenant-dashboard/property/${property.id}`}
                        className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#2D1F1A] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 text-center shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C5924E]" />
                      </Link>
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

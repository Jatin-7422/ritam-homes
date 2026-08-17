import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Search,
  MapPin,
  Compass,
  Loader2,
  MessageSquare,
  Home,
} from "lucide-react";

export default function ExploreProperty() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  // Advanced Location & Keyword Filtering
  const filteredProperties = properties.filter((prop) => {
    const query = searchTerm.toLowerCase().trim();

    // Check if search matches title, city, location, or full address
    const matchesSearch =
      !query ||
      prop.title?.toLowerCase().includes(query) ||
      prop.city?.toLowerCase().includes(query) ||
      prop.location?.toLowerCase().includes(query) ||
      prop.address?.toLowerCase().includes(query);

    // Check category filter
    const matchesCategory =
      selectedCategory === "All" ||
      prop.property_type?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header & Search Bar Banner */}
      <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
            <Compass className="w-3.5 h-3.5 text-[#C5924E]" />
            <span>Property Marketplace</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            Explore Available Properties 🏡
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl">
            Browse verified listings posted by owners, filter by location or
            city, and connect instantly.
          </p>
        </div>

        {/* Real-time Location/Title Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6B]" />
          <input
            type="text"
            placeholder="Search by city, location, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs text-[#2D1F1A] placeholder-[#8C7A6B] focus:outline-none focus:border-[#C5924E] transition-all"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["All", "Apartment", "Villa", "Independent House", "Studio"].map(
          (category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-[#2D1F1A] text-white shadow-sm"
                  : "bg-white border border-[#EADBCE] text-[#6E5D53] hover:border-[#C5924E]"
              }`}
            >
              {category}
            </button>
          ),
        )}
      </div>

      {/* Property Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            let imageUrl =
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
                className="bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={imageUrl}
                      alt={property.title || "Property"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#EADBCE] text-[10px] font-bold text-[#2D1F1A] uppercase tracking-wider">
                      {property.property_type || "Apartment"}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-bold text-[#2D1F1A] line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                        <span>
                          {property.location ||
                            property.city ||
                            property.address ||
                            "Location not specified"}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#EADBCE]/60 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-[#2D1F1A]">
                          {property.bedrooms || 2}
                        </span>
                        <span className="text-[10px] text-[#8C7A6B]">Beds</span>
                      </div>
                      <div className="flex flex-col items-center border-x border-[#EADBCE]/60">
                        <span className="text-xs font-bold text-[#2D1F1A]">
                          {property.bathrooms || 2}
                        </span>
                        <span className="text-[10px] text-[#8C7A6B]">
                          Baths
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-[#2D1F1A]">
                          {property.area || 1200}
                        </span>
                        <span className="text-[10px] text-[#8C7A6B]">
                          Sq.ft
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6E5D53] line-clamp-2">
                      {property.description ||
                        "Furnished modern space ready for move-in with excellent ventilation."}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">
                      Rent
                    </span>
                    <span className="text-base font-serif font-bold text-[#2D1F1A]">
                      ₹
                      {Number(
                        property.rent || property.price || 12000,
                      ).toLocaleString()}
                      <span className="text-[10px] font-normal text-[#6E5D53]">
                        /mo
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/tenant-dashboard/property/${property.id}`}
                      className="px-3 py-2 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#2D1F1A] text-xs font-bold rounded-xl transition-all shadow-sm text-center"
                    >
                      View Details
                    </Link>
                    <a
                      href={`/tenant-dashboard/messages?owner=${property.owner_id || ""}`}
                      className="px-3 py-2 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C5924E]" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#EADBCE] space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl flex items-center justify-center mx-auto text-[#8C7A6B]">
            <Home className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              No properties match your location search
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Try searching for a different city or clearing your filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3E2E27] transition-all"
          >
            Show All Listings
          </button>
        </div>
      )}
    </div>
  );
}

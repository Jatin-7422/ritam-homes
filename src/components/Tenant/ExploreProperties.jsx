import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/newlogo.png";
import {
  Home,
  Heart,
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  BedDouble,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Bell,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Loader2,
  Filter,
  X,
} from "lucide-react";

// Mock fallbacks if Supabase table is empty initially
const INITIAL_PROPERTIES = [
  {
    id: "1",
    title: "2BHK Luxury Apartment",
    location: "Koramangala, Bangalore",
    price: 22000,
    bhk: "2 BHK",
    area: "1200 sq.ft",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: "2",
    title: "Cozy 1BHK Studio Flat",
    location: "Indiranagar, Bangalore",
    price: 15000,
    bhk: "1 BHK",
    area: "650 sq.ft",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    featured: false,
  },
  {
    id: "3",
    title: "3BHK Spacious Home",
    location: "Whitefield, Bangalore",
    price: 28000,
    bhk: "3 BHK",
    area: "1600 sq.ft",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    featured: true,
  },
  {
    id: "4",
    title: "4BHK Premium Villa",
    location: "HSR Layout, Bangalore",
    price: 45000,
    bhk: "4 BHK",
    area: "2500 sq.ft",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    featured: false,
  },
  {
    id: "5",
    title: "Modern 2BHK Penthouse",
    location: "MG Road, Bangalore",
    price: 35000,
    bhk: "2 BHK",
    area: "1400 sq.ft",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    featured: false,
  },
  {
    id: "6",
    title: "Minimalist 1BHK Apartment",
    location: "Jayanagar, Bangalore",
    price: 18000,
    bhk: "1 BHK",
    area: "750 sq.ft",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
    featured: false,
  },
];

export default function ExploreProperties() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tenantName, setTenantName] = useState("Rahul Sharma");
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [favorites, setFavorites] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [maxPrice, setMaxPrice] = useState(50000);

  useEffect(() => {
    const fetchUserAndProperties = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setTenantName(
            session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "Rahul Sharma"
          );
        }

        // Fetch properties from Supabase table if available
        const { data: dbProperties, error } = await supabase
          .from("properties")
          .select("*");

        if (!error && dbProperties && dbProperties.length > 0) {
          setProperties(dbProperties);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProperties();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  // Filter Logic
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBhk =
      selectedBhk === "All" || prop.bhk.includes(selectedBhk);

    const matchesPrice = prop.price <= maxPrice;

    return matchesSearch && matchesBhk && matchesPrice;
  });

  if (loading) {
    return (
      <div className="h-screen bg-[#F8F5EE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8F5EE] font-sans text-[#2D1F1A] flex flex-row">
      {/* SIDEBAR NAVIGATION - MATCHED THEME */}
      <aside className="w-72 bg-[#F2ECE1] border-r border-[#E3D9CC] flex flex-col justify-between hidden lg:flex h-screen sticky top-0 p-6 shrink-0">
        <div className="space-y-8 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center">
            <img
              src={logoWhite}
              alt="Ritam Homes Logo"
              className="w-24 h-24 object-contain"
            />
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-[#E3D9CC] shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
              alt="User"
              className="w-12 h-12 rounded-full object-cover border border-[#C5924E]"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-[#2D1F1A] truncate">
                {tenantName}
              </h4>
              <p className="text-xs text-[#6E5D53]">Tenant</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 font-semibold px-2 py-0.5 rounded-md mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Tenant
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              to="/tenant-dashboard"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <Home className="w-5 h-5" /> Dashboard
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-3.5 px-4 py-3.5 bg-[#E3D9CC]/60 text-[#2D1F1A] rounded-xl text-sm font-bold transition-all"
            >
              <Search className="w-5 h-5 text-[#C5924E]" /> Explore Properties
            </Link>
            <Link
              to="#"
              className="flex items-center justify-between px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3.5">
                <Calendar className="w-5 h-5" /> My Bookings
              </div>
              <span className="bg-[#2D1F1A] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                3
              </span>
            </Link>
            <Link
              to="#"
              className="flex items-center justify-between px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3.5">
                <Heart className="w-5 h-5" /> Saved Properties
              </div>
              <span className="bg-[#2D1F1A] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {favorites.length}
              </span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <MessageSquare className="w-5 h-5" /> Messages
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <Settings className="w-5 h-5" /> Account Settings
            </Link>
          </nav>
        </div>

        {/* Upgrade & Logout */}
        <div className="space-y-4 pt-4 bg-[#F2ECE1]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 px-4 py-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP BAR / SEARCH BANNER */}
        <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                Explore Premium Homes
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5D53] mt-0.5">
                Discover verified properties available for instant visits and lease.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-[#2D1F1A]">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-[#C5924E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  5
                </span>
              </div>
            </div>
          </div>

          {/* SEARCH & CONTROLS STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {/* Location / Keyword Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#6E5D53]" />
              <input
                type="text"
                placeholder="Search by area, locality, or property title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
              />
            </div>

            {/* BHK Filter Dropdown */}
            <div>
              <select
                value={selectedBhk}
                onChange={(e) => setSelectedBhk(e.target.value)}
                className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
              >
                <option value="All">All Room Types (BHK)</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK / Villa</option>
              </select>
            </div>

            {/* Price Filter Slider */}
            <div className="bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl px-3 py-1.5 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#6E5D53]">
                <span>Max Rent:</span>
                <span className="text-[#2D1F1A]">₹{maxPrice.toLocaleString()} / mo</span>
              </div>
              <input
                type="range"
                min="10000"
                max="60000"
                step="2000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-[#C5924E] h-1.5 w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-[#6E5D53]">
            Showing <span className="text-[#2D1F1A] font-bold">{filteredProperties.length}</span> properties
          </p>
          {(searchQuery || selectedBhk !== "All" || maxPrice < 50000) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedBhk("All");
                setMaxPrice(50000);
              }}
              className="text-xs text-[#C5924E] font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* PROPERTY CARDS GRID */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white border border-[#E3D9CC] rounded-3xl p-12 text-center space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-[#C5924E] mx-auto" />
            <h3 className="text-base font-bold text-[#2D1F1A]">No properties matched your search</h3>
            <p className="text-xs text-[#6E5D53]">Try adjusting your search query or increasing your budget range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const isFav = favorites.includes(prop.id);
              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-3xl border border-[#E3D9CC] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prop.featured && (
                      <span className="absolute top-3 left-3 bg-[#2D1F1A] text-[#C5924E] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(prop.id)}
                      className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[#2D1F1A] shadow-xs hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? "fill-current text-red-500" : "text-[#2D1F1A]"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C5924E] flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" /> {prop.rating}
                        </span>
                        <span className="text-[11px] font-medium text-[#6E5D53]">
                          Verified Owner
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-[#2D1F1A] truncate">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                        {prop.location}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="flex items-center justify-between py-2.5 border-y border-[#F8F5EE] text-xs text-[#6E5D53]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <BedDouble className="w-4 h-4 text-[#2D1F1A]" /> {prop.bhk}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Maximize2 className="w-3.5 h-3.5 text-[#2D1F1A]" /> {prop.area}
                      </span>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-lg font-serif font-bold text-[#2D1F1A]">
                          ₹{prop.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#6E5D53] font-normal"> / mo</span>
                      </div>
                      <button className="px-4 py-2 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all flex items-center gap-1 cursor-pointer">
                        Book Visit <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
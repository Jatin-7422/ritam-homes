import React, { useState, useEffect } from "react";
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
  Plus,
  Eye,
  ShieldCheck,
  Loader2,
  MoreVertical,
  Check,
  X,
  Award,
  Clock,
} from "lucide-react";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Rahul",
    email: "",
    avatar: "",
  });
  const navigate = useNavigate();

  // Fetch logged-in user details from Supabase Session
  useEffect(() => {
    const fetchUserData = async () => {
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
        console.error("Error fetching user session data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Background auth state listener to handle session management safely
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Smooth transition logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Logout clearance error:", e);
    }

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 600);
  };

  return (
    <div
      className={`min-h-screen bg-[#F8F5EE] font-sans text-[#2D1F1A] flex flex-col md:flex-row relative transition-opacity duration-500 ${isLoggingOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* LOGOUT LOADING OVERLAY */}
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

      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-[#2D1F1A] text-[#D1C4B9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Logo & Brand Image */}
          <div className="p-6 flex items-center gap-3 border-b border-white/15">
            <Link to="/" className="flex items-center">
              <img
                src={logoWhite}
                alt="Ritam Homes"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Dynamic Owner Profile Card Widget */}
          <div className="mx-4 my-5 p-3.5 bg-[#221A17] border border-[#3A2E2A] rounded-2xl flex items-center gap-3 shadow-inner">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-11 h-11 rounded-full object-cover border border-[#C5924E]/50"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#C5924E] flex items-center justify-center text-[#2D1F1A] font-bold text-base shadow">
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

          {/* Navigation Menu Links */}
          <nav className="px-3 space-y-1 text-xs font-medium pb-6">
            {[
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "My Properties", icon: Building2 },
              { name: "Add New Property", icon: PlusCircle },
              { name: "Visit Requests", icon: CalendarCheck, badge: "12" },
              { name: "Bookings", icon: Calendar },
              { name: "Tenants", icon: Users },
              { name: "Earnings", icon: IndianRupee },
              { name: "Documents", icon: FileText },
              { name: "Messages", icon: MessageSquare, badge: "5" },
              { name: "Reviews", icon: Star },
              { name: "Account Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
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
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#2D1F1A] text-white"
                          : "bg-[#C5924E] text-[#2D1F1A]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Logout Only) */}
        <div className="p-4 border-t border-white/10 bg-[#221A17]/50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="w-full bg-white border-b border-[#E3D9CC] px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
              Welcome back, {userProfile.name}! 👋
            </h2>
            <p className="text-xs text-[#6E5D53] mt-0.5">
              Here's what's happening with your properties today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-[#F8F5EE] border border-[#E3D9CC] rounded-full text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <Link
              to="/owner-properties"
              className="px-4 py-2.5 bg-[#2D1F1A] text-white hover:bg-[#3E2E27] rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C5924E]" /> Add New Property
            </Link>
          </div>
        </header>

        {/* DASHBOARD CONTENT BODY */}
        <div className="p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* STATS OVERVIEW CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: "Total Properties",
                value: "8",
                sub: "Active Listings",
                icon: Building2,
              },
              {
                title: "Total Views",
                value: "2,456",
                sub: "+18.6% This Month",
                icon: Eye,
                trend: true,
              },
              {
                title: "Visit Requests",
                value: "12",
                sub: "Pending",
                icon: CalendarCheck,
                badge: "12",
              },
              {
                title: "Confirmed Bookings",
                value: "5",
                sub: "This Month",
                icon: Calendar,
              },
              {
                title: "Total Earnings",
                value: "₹1,24,500",
                sub: "+22.5% This Month",
                icon: IndianRupee,
                trend: true,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#6E5D53]">
                      {stat.title}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#F8F5EE] flex items-center justify-center text-[#C5924E]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                      {stat.value}
                    </h3>
                  </div>
                  <p
                    className={`text-[11px] font-medium ${stat.trend ? "text-green-600" : "text-[#6E5D53]"}`}
                  >
                    {stat.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* MAIN GRID: PROPERTIES & VISIT REQUESTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: MY PROPERTIES */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3D9CC] p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#2D1F1A]">
                  My Properties
                </h3>
                <button className="text-xs font-bold text-[#C5924E] hover:underline cursor-pointer">
                  View All Properties →
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "2BHK Luxury Apartment",
                    location: "Koramangala, Bangalore",
                    price: "₹22,000",
                    type: "2 BHK • 1200 sq.ft • Semi Furnished",
                    status: "Active",
                    statusBg: "bg-emerald-50 text-emerald-700",
                    views: "24 Views",
                    requests: "3 Requests",
                    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&auto=format&fit=crop&q=80",
                  },
                  {
                    title: "1BHK Modern Flat",
                    location: "Indiranagar, Bangalore",
                    price: "₹15,000",
                    type: "1 BHK • 650 sq.ft • Furnished",
                    status: "Active",
                    statusBg: "bg-emerald-50 text-emerald-700",
                    views: "18 Views",
                    requests: "2 Requests",
                    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&auto=format&fit=crop&q=80",
                  },
                  {
                    title: "3BHK Spacious Home",
                    location: "Whitefield, Bangalore",
                    price: "₹28,000",
                    type: "3 BHK • 1600 sq.ft • Semi Furnished",
                    status: "Active",
                    statusBg: "bg-emerald-50 text-emerald-700",
                    views: "36 Views",
                    requests: "4 Requests",
                    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80",
                  },
                  {
                    title: "4BHK Premium House",
                    location: "HSR Layout, Bangalore",
                    price: "₹45,000",
                    type: "4 BHK • 2500 sq.ft • Furnished",
                    status: "Pending",
                    statusBg: "bg-amber-50 text-amber-700",
                    views: "8 Views",
                    requests: "1 Request",
                    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&auto=format&fit=crop&q=80",
                  },
                ].map((prop, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-[#E3D9CC]/60 bg-[#F8F5EE]/40 gap-4 hover:border-[#C5924E]/50 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={prop.img}
                        alt={prop.title}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#E3D9CC]"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#2D1F1A] truncate">
                            {prop.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prop.statusBg}`}
                          >
                            ● {prop.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E5D53]">
                          {prop.location}
                        </p>
                        <p className="text-xs font-bold text-[#2D1F1A]">
                          {prop.price}{" "}
                          <span className="text-[10px] font-normal text-[#6E5D53]">
                            /month
                          </span>
                        </p>
                        <p className="text-[10px] text-[#8C7A6B]">
                          {prop.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto text-right gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E3D9CC]">
                      <div className="text-[11px] text-[#6E5D53] space-y-0.5">
                        <p>{prop.views}</p>
                        <p>{prop.requests}</p>
                      </div>
                      <button className="p-1.5 hover:bg-[#E3D9CC]/50 rounded-lg text-[#6E5D53] cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/owner-properties"
                className="w-full py-3 bg-[#F8F5EE] border border-dashed border-[#C5924E]/60 text-[#2D1F1A] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#E3D9CC]/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C5924E]" /> Add New Property
              </Link>
            </div>

            {/* RIGHT COLUMN: VISIT REQUESTS & EARNINGS */}
            <div className="lg:col-span-5 space-y-8">
              {/* VISIT REQUESTS */}
              <div className="bg-white rounded-3xl border border-[#E3D9CC] p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#2D1F1A]">
                    Visit Requests
                  </h3>
                  <button className="text-xs font-bold text-[#C5924E] hover:underline cursor-pointer">
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Amit Verma",
                      property: "2BHK Luxury Apartment",
                      time: "10 May 2025 • 11:00 AM",
                      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    },
                    {
                      name: "Priya Nair",
                      property: "1BHK Modern Flat",
                      time: "10 May 2025 • 04:00 PM",
                      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                    },
                    {
                      name: "Vikas Singh",
                      property: "3BHK Spacious Home",
                      time: "11 May 2025 • 10:00 AM",
                      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    },
                    {
                      name: "Sneha Reddy",
                      property: "2BHK Luxury Apartment",
                      time: "11 May 2025 • 03:00 PM",
                      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    },
                  ].map((req, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl border border-[#E3D9CC]/60 bg-[#F8F5EE]/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.img}
                            alt={req.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#C5924E]/40"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-[#2D1F1A]">
                              {req.name}
                            </h4>
                            <p className="text-[11px] text-[#6E5D53]">
                              {req.property}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
                          Pending
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC]/50 text-[11px]">
                        <span className="text-[#6E5D53] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                          {req.time}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button className="px-3 py-1 bg-[#2D1F1A] text-white rounded-lg text-[10px] font-bold hover:bg-[#3E2E27] cursor-pointer">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-white border border-[#E3D9CC] text-[#2D1F1A] rounded-lg text-[10px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EARNINGS OVERVIEW */}
              <div className="bg-white rounded-3xl border border-[#E3D9CC] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#2D1F1A]">
                    Earnings Overview
                  </h3>
                  <button className="text-xs font-bold text-[#C5924E] hover:underline cursor-pointer">
                    View Details →
                  </button>
                </div>

                <div>
                  <p className="text-xs text-[#6E5D53]">
                    Total Earnings (This Month)
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                      ₹1,24,500
                    </h4>
                    <span className="text-xs font-bold text-green-600">
                      ↑ 22.5%{" "}
                      <span className="font-normal text-[#6E5D53]">
                        from last month
                      </span>
                    </span>
                  </div>
                </div>

                {/* SVG Earnings Trend Chart */}
                <div className="pt-2">
                  <div className="relative h-28 w-full">
                    <svg
                      viewBox="0 0 400 120"
                      className="w-full h-full overflow-visible"
                    >
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#C5924E"
                            stopOpacity="0.25"
                          />
                          <stop
                            offset="100%"
                            stopColor="#C5924E"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 100 Q 50 80, 100 40 T 200 70 T 300 50 T 380 20 L 380 120 L 0 120 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 0 100 Q 50 80, 100 40 T 200 70 T 300 50 T 380 20"
                        fill="none"
                        stroke="#C5924E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="40" r="4" fill="#C5924E" />
                      <circle cx="200" cy="70" r="4" fill="#C5924E" />
                      <circle cx="300" cy="50" r="4" fill="#C5924E" />
                      <circle cx="380" cy="20" r="4" fill="#C5924E" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8C7A6B] mt-2 border-t border-[#E3D9CC] pt-2">
                    <span>1 May</span>
                    <span>8 May</span>
                    <span>15 May</span>
                    <span>22 May</span>
                    <span>29 May</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM TRUST & METRICS BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-3xl border border-[#E3D9CC] p-6 shadow-xs">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F8F5EE]/60 border border-[#E3D9CC]/50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#2D1F1A]">
                  Verified Owner
                </h4>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  Your profile is verified ✓
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F8F5EE]/60 border border-[#E3D9CC]/50">
              <div className="w-12 h-12 rounded-2xl bg-[#C5924E]/10 text-[#C5924E] flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#2D1F1A]">
                  Properties Verified
                </h4>
                <p className="text-[11px] text-[#6E5D53] mt-0.5">
                  8/8 properties verified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F8F5EE]/60 border border-[#E3D9CC]/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#2D1F1A]">
                  Average Rating
                </h4>
                <p className="text-[11px] text-[#6E5D53] mt-0.5">
                  4.8/5 (32 Reviews)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F8F5EE]/60 border border-[#E3D9CC]/50">
              <div className="w-12 h-12 rounded-2xl bg-[#2D1F1A] text-white flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#C5924E]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#2D1F1A]">
                  Response Time
                </h4>
                <p className="text-[11px] text-green-600 font-medium mt-0.5">
                  Within 2 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

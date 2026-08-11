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
  Award,
  Clock,
  Menu,
  X,
} from "lucide-react";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Rahul",
    email: "",
    avatar: "",
  });

  // Dynamic states for database integration
  const [properties, setProperties] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);
  const [earningsOverview, setEarningsOverview] = useState({
    totalEarnings: "₹0",
    percentageChange: "0%",
    chartData: [],
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalViews: "0",
    viewsTrend: "0%",
    pendingVisitRequests: 0,
    confirmedBookings: 0,
    totalEarningsValue: "₹0",
  });
  const [ownerMetrics, setOwnerMetrics] = useState({
    propertiesVerifiedCount: 0,
    totalPropertiesCount: 0,
    averageRating: "0/5",
    totalReviews: 0,
    responseTime: "N/A",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch logged-in user details from Supabase Session and fetch dynamic data
  useEffect(() => {
    const fetchDashboardData = async () => {
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

          // Simulating empty/dynamic initial states ready for database mapping
          setProperties([]);
          setVisitRequests([]);
          setEarningsOverview({
            totalEarnings: "₹0",
            percentageChange: "0%",
            chartData: [],
          });
          setDashboardStats({
            totalProperties: 0,
            totalViews: "0",
            viewsTrend: "0%",
            pendingVisitRequests: 0,
            confirmedBookings: 0,
            totalEarningsValue: "₹0",
          });
          setOwnerMetrics({
            propertiesVerifiedCount: 0,
            totalPropertiesCount: 0,
            averageRating: "0/5",
            totalReviews: 0,
            responseTime: "N/A",
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  // Handle Visit Request Actions (Hook up to database update handler)
  const handleRequestAction = async (id, actionStatus) => {
    setVisitRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: actionStatus } : req,
      ),
    );
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

      {/* MOBILE SIDEBAR BACKDROP OVERLAY */}
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
          {/* Logo & Mobile Close Button */}
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

          {/* Dynamic Owner Profile Card Widget */}
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

          {/* Navigation Menu Links */}
          <nav className="px-3 space-y-1 text-xs font-medium overflow-y-auto flex-1 custom-scrollbar">
            {[
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "My Properties", icon: Building2 },
              {
                name: "Add New Property",
                icon: PlusCircle,
                path: "/owner-properties",
              },
              {
                name: "Visit Requests",
                icon: CalendarCheck,
                badge:
                  visitRequests.filter((r) => r.status === "Pending").length > 0
                    ? visitRequests
                        .filter((r) => r.status === "Pending")
                        .length.toString()
                    : null,
              },
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
                    setIsSidebarOpen(false); // Close mobile menu on navigation
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

          {/* Sidebar Footer (Logout Only) */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="w-full bg-white border-b border-[#E3D9CC] px-6 sm:px-10 py-4 flex flex-col gap-4 shadow-xs">
          {/* Top row: Logo on the left, Hamburger menu and actions on the right */}
          <div className="flex items-center justify-between w-full">
            {/* Logo on the Left */}
            <Link to="/" className="flex items-center">
              <img
                src={logoWhite}
                alt="Ritam Homes"
                className="h-8 md:h-10 w-auto object-contain filter brightness-0 md:filter-none"
              />
            </Link>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 bg-[#F8F5EE] border border-[#E3D9CC] rounded-full text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer">
                <Bell className="w-4 h-4" />
              </button>

              {/* Add New Property Button - Hidden on mobile view */}
              <Link
                to="/owner-properties"
                className="hidden md:flex px-4 py-2.5 bg-[#2D1F1A] text-white hover:bg-[#3E2E27] rounded-xl text-xs font-bold transition-all shadow-md items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C5924E]" /> Add New Property
              </Link>

              {/* Hamburger Toggle Button on the Right */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Welcome Text Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
              Welcome back, {userProfile.name}! 👋
            </h2>
            <p className="text-xs text-[#6E5D53] mt-0.5">
              Here's what's happening with your properties today.
            </p>
          </div>
        </header>

        {/* DASHBOARD CONTENT BODY */}
        <div className="p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
            </div>
          ) : (
            <>
              {/* STATS OVERVIEW CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    title: "Total Properties",
                    value: dashboardStats.totalProperties,
                    sub: "Active Listings",
                    icon: Building2,
                  },
                  {
                    title: "Total Views",
                    value: dashboardStats.totalViews,
                    sub: `${dashboardStats.viewsTrend} This Month`,
                    icon: Eye,
                    trend: true,
                  },
                  {
                    title: "Visit Requests",
                    value: dashboardStats.pendingVisitRequests,
                    sub: "Pending",
                    icon: CalendarCheck,
                    badge:
                      dashboardStats.pendingVisitRequests > 0
                        ? dashboardStats.pendingVisitRequests
                        : null,
                  },
                  {
                    title: "Confirmed Bookings",
                    value: dashboardStats.confirmedBookings,
                    sub: "This Month",
                    icon: Calendar,
                  },
                  {
                    title: "Total Earnings",
                    value: dashboardStats.totalEarningsValue,
                    sub: "This Month",
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
                    {properties.length === 0 ? (
                      <div className="text-center py-10 bg-[#F8F5EE]/40 rounded-2xl border border-dashed border-[#E3D9CC]">
                        <Building2 className="w-10 h-10 text-[#C5924E] mx-auto mb-2 opacity-60" />
                        <p className="text-xs font-bold text-[#2D1F1A]">
                          No properties found
                        </p>
                        <p className="text-[11px] text-[#6E5D53] mt-0.5">
                          Properties added from database will appear here.
                        </p>
                      </div>
                    ) : (
                      properties.map((prop) => (
                        <div
                          key={prop.id}
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
                      ))
                    )}
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
                      {visitRequests.length === 0 ? (
                        <div className="text-center py-8 bg-[#F8F5EE]/40 rounded-2xl border border-dashed border-[#E3D9CC]">
                          <CalendarCheck className="w-8 h-8 text-[#C5924E] mx-auto mb-2 opacity-60" />
                          <p className="text-xs font-bold text-[#2D1F1A]">
                            No visit requests
                          </p>
                          <p className="text-[11px] text-[#6E5D53] mt-0.5">
                            Incoming requests from database will appear here.
                          </p>
                        </div>
                      ) : (
                        visitRequests.map((req) => (
                          <div
                            key={req.id}
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
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  req.status === "Accepted"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : req.status === "Declined"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {req.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC]/50 text-[11px]">
                              <span className="text-[#6E5D53] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                                {req.time}
                              </span>
                              {req.status === "Pending" ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleRequestAction(req.id, "Accepted")
                                    }
                                    className="px-3 py-1 bg-[#2D1F1A] text-white rounded-lg text-[10px] font-bold hover:bg-[#3E2E27] cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRequestAction(req.id, "Declined")
                                    }
                                    className="px-3 py-1 bg-white border border-[#E3D9CC] text-[#2D1F1A] rounded-lg text-[10px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-medium text-[#8C7A6B]">
                                  Request {req.status.toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
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
                          {earningsOverview.totalEarnings}
                        </h4>
                        <span className="text-xs font-bold text-green-600">
                          {earningsOverview.percentageChange}{" "}
                          <span className="font-normal text-[#6E5D53]">
                            from last month
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* SVG Earnings Trend Chart */}
                    <div className="pt-2">
                      <div className="relative h-28 w-full flex items-center justify-center bg-[#F8F5EE]/40 rounded-xl border border-dashed border-[#E3D9CC]">
                        {earningsOverview.chartData.length === 0 ? (
                          <p className="text-[11px] text-[#6E5D53]">
                            Earnings graph data will load from database
                          </p>
                        ) : (
                          <svg
                            viewBox="0 0 400 120"
                            className="w-full h-full overflow-visible"
                          >
                            {/* Chart path mapping goes here when populated */}
                          </svg>
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-[#8C7A6B] mt-2 border-t border-[#E3D9CC] pt-2">
                        <span>Start</span>
                        <span>Mid</span>
                        <span>End</span>
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
                      {ownerMetrics.propertiesVerifiedCount}/
                      {ownerMetrics.totalPropertiesCount} properties verified
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
                      {ownerMetrics.averageRating} ({ownerMetrics.totalReviews}{" "}
                      Reviews)
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
                      {ownerMetrics.responseTime}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

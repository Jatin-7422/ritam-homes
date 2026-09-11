import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/whitelogo.png";
import logoDark from "../../assets/newlogo.png";
import { AppContext } from "../../App";
import TenantNotifications from "./TenantNotifications";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Calendar,
  Heart,
  FileText,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
  Loader2,
  Menu,
  X,
  Building2
} from "lucide-react";

export default function TenantDashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const notificationRef = useRef(null);

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasActiveBookingsUpdate, setHasActiveBookingsUpdate] = useState(false);

  const context = useContext(AppContext);
  if (!context) {
    throw new Error("TenantDashboard must be used within an AppProvider");
  }
  const { userInfo, setUserInfo, preferences } = context;

  const isDarkTheme = preferences?.theme === "Dark Mode" || preferences?.theme === "Dark";
  const useNavigateInstance = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchTenantNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) return;
        const userId = session.user.id;

        const { count: msgCount, error: msgError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", userId)
          .eq("is_read", false);

        if (!msgError) {
          setHasUnreadMessages(Boolean(msgCount && msgCount > 0));
        }

        const { count: bookingCount, error: bookingError } = await supabase
          .from("property_visit_slots")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", userId)
          .in("status", ["confirmed", "rescheduled"]);

        if (!bookingError) {
          setHasActiveBookingsUpdate(Boolean(bookingCount && bookingCount > 0));
        } else {
          setHasActiveBookingsUpdate(false);
        }
      } catch (err) {
        console.error("Error fetching tenant notifications:", err);
      }
    };

    fetchTenantNotifications();

    const messageSubscription = supabase
      .channel("tenant-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || !session.user) return;

          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", session.user.id)
            .eq("is_read", false);

          setHasUnreadMessages(Boolean(count && count > 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const user = session.user;
          setUserInfo((prev) => ({
            ...prev,
            email: prev.email || user.email,
            fullName: user.user_metadata?.full_name || prev.fullName || "Tenant User",
            businessName: user.user_metadata?.business_name || prev.businessName,
            phone: user.user_metadata?.phone || prev.phone,
            location: user.user_metadata?.location || prev.location,
            avatar: user.user_metadata?.avatar_url || prev.avatar || "",
          }));
        }
      } catch (err) {
        console.error("Auth session error:", err);
      }
    };
    fetchSession();
  }, [setUserInfo]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        useNavigateInstance("/login", { replace: true });
      }
    });
    return () => subscription?.unsubscribe();
  }, [useNavigateInstance]);

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
      useNavigateInstance("/login", { replace: true });
    }, 600);
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/tenant-dashboard" },
    { name: "Explore", icon: Search, path: "/tenant-dashboard/explore" },
    { name: "Messages", icon: MessageSquare, path: "/tenant-dashboard/messages", hasNotification: hasUnreadMessages },
    { name: "Bookings", icon: Calendar, path: "/tenant-dashboard/bookings", hasNotification: hasActiveBookingsUpdate },
    { name: "Saved", icon: Heart, path: "/tenant-dashboard/saved" },
    { name: "Documents", icon: FileText, path: "/tenant-dashboard/documents" },
    { name: "Settings", icon: Settings, path: "/tenant-dashboard/settings" },
  ];

  return (
    <div
      className={`min-h-screen font-sans flex flex-col relative transition-colors duration-300 ${
        isDarkTheme ? "bg-[#1A120B] text-white" : "bg-[#F8F5EE] text-[#2D1F1A]"
      } ${isLoggingOut ? "opacity-90" : "opacity-100"}`}
    >
      {isLoggingOut && (
        <div className="fixed inset-0 bg-[#2D1F1A]/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5924E] mb-4" />
          <p className="font-serif font-bold text-xl">Logging out securely...</p>
        </div>
      )}

      {/* TOP HEADER */}
      <header
        className={`w-full z-40 sticky top-0 flex-shrink-0 transition-colors shadow-sm ${
          isDarkTheme ? "bg-[#221A17] border-b border-neutral-800" : "bg-white border-b border-[#E3D9CC]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 relative flex items-center justify-between gap-4">
          
          {/* 1. LEFT SECTION: Mobile Hamburger Menu & Left-aligned content helpers */}
          <div className="flex items-center gap-3 z-10 shrink-0 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkTheme ? "text-white hover:bg-neutral-800" : "text-[#2D1F1A] hover:bg-[#F8F5EE]"
              }`}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Left Logo */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link to="/tenant-dashboard" className="flex items-center">
              <img
                src={isDarkTheme ? logoWhite : (logoDark || logoWhite)} 
                alt="Ritam Homes"
                className="h-14 lg:h-16 w-auto object-contain max-w-[200px]"
              />
            </Link>
          </div>

          {/* Mobile Absolute Centered Big Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center justify-center pointer-events-auto">
            <Link to="/tenant-dashboard" className="flex items-center">
              <img
                src={isDarkTheme ? logoWhite : (logoDark || logoWhite)} 
                alt="Ritam Homes"
                className="h-14 sm:h-16 w-auto object-contain max-w-[210px]"
              />
            </Link>
          </div>

          {/* 2. CENTER SECTION: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/tenant-dashboard"
                ? location.pathname === "/tenant-dashboard"
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#C5924E] text-white shadow-md"
                      : isDarkTheme 
                        ? "text-[#D1C4B9] hover:bg-white/5 hover:text-white" 
                        : "text-[#6E5D53] hover:bg-[#F8F5EE] hover:text-[#2D1F1A]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                  {item.hasNotification && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm border border-white/50"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT SECTION: Notifications, Host Action, & Profile Dropdown/Logout */}
          <div className="flex items-center gap-3 z-10 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2.5 rounded-full transition-colors ${
                  isDarkTheme ? "bg-neutral-800 hover:bg-neutral-700 text-white" : "bg-[#F8F5EE] hover:bg-[#EADBCE] text-[#2D1F1A]"
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {(hasUnreadMessages || hasActiveBookingsUpdate) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-white"></span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 z-50 shadow-2xl rounded-2xl overflow-hidden">
                  <TenantNotifications />
                </div>
              )}
            </div>

            {/* Desktop Switch to Hosting Button */}
            <Link
              to="/owner-dashboard"
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                isDarkTheme 
                  ? "border-neutral-700 hover:bg-neutral-800 text-[#C5924E]" 
                  : "border-[#E3D9CC] hover:bg-[#F8F5EE] text-[#C5924E]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Switch to Hosting
            </Link>

            {/* Desktop Profile Pill */}
            <div className={`hidden md:flex items-center gap-2 pl-3 border-l ${
              isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"
            }`}>
              <div className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl border ${
                isDarkTheme ? "bg-neutral-900 border-neutral-800" : "bg-[#FAF7F2] border-[#EFEBE4]"
              }`}>
                {userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-[#C5924E]/50 shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#C5924E] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "T"}
                  </div>
                )}
                <div className="text-left hidden xl:block max-w-[110px]">
                  <p className="text-xs font-bold truncate leading-tight">{userInfo?.fullName || "Tenant User"}</p>
                  <p className="text-[10px] text-gray-400 truncate leading-tight">{userInfo?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout Account"
                className={`p-2.5 rounded-xl transition-colors text-rose-500 ${
                  isDarkTheme ? "bg-neutral-800 hover:bg-neutral-700" : "bg-[#F8F5EE] hover:bg-[#EADBCE]"
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Medium-screen (MD to LG) Row for Nav Items to Avoid Crowding */}
        <div className={`hidden md:flex lg:hidden items-center justify-center gap-1 px-4 py-2 border-t ${
          isDarkTheme ? "border-neutral-800 bg-[#1A120B]" : "border-[#E3D9CC] bg-[#FAF7F2]"
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/tenant-dashboard"
              ? location.pathname === "/tenant-dashboard"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#C5924E] text-white shadow-md"
                    : isDarkTheme 
                      ? "text-[#D1C4B9] hover:bg-white/5 hover:text-white" 
                      : "text-[#6E5D53] hover:bg-white hover:text-[#2D1F1A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.name}</span>
                {item.hasNotification && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm"></span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER & BACKDROP */}
      <div 
        className={`fixed inset-0 z-50 md:hidden flex transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className={`relative w-72 max-w-full flex flex-col h-full shadow-2xl z-10 transition-transform duration-300 ease-in-out ${
          isDarkTheme ? "bg-[#221A17] text-white border-r border-neutral-800" : "bg-white text-[#2D1F1A] border-r border-[#E3D9CC]"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className={`p-4 flex items-center justify-between border-b ${
            isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"
          }`}>
            <div className="flex items-center gap-3">
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-[#C5924E]/50" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#C5924E] flex items-center justify-center text-white font-bold text-base">
                  {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "T"}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{userInfo?.fullName || "Tenant User"}</p>
                <p className="text-xs text-gray-400 truncate">{userInfo?.email}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-green-500 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Verified Tenant
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkTheme ? "hover:bg-neutral-800 text-white" : "hover:bg-[#F8F5EE] text-[#2D1F1A]"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/tenant-dashboard"
                ? location.pathname === "/tenant-dashboard"
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#C5924E] text-white shadow-md"
                      : isDarkTheme 
                        ? "text-[#D1C4B9] hover:bg-neutral-800/60 hover:text-white" 
                        : "text-[#6E5D53] hover:bg-[#F8F5EE] hover:text-[#2D1F1A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.hasNotification && (
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-sm"></span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className={`p-4 border-t space-y-2 ${
            isDarkTheme ? "border-neutral-800 bg-[#1A120B]" : "border-[#E3D9CC] bg-[#F8F5EE]"
          }`}>
            <Link
              to="/owner-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isDarkTheme ? "hover:bg-neutral-800 text-[#C5924E]" : "hover:bg-white text-[#C5924E]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Switch to Hosting
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-rose-500 ${
                isDarkTheme ? "hover:bg-neutral-800" : "hover:bg-white"
              }`}
            >
              <LogOut className="w-4 h-4" /> Logout Account
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT OUTLET */}
      <main className="flex-1 overflow-y-auto w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col items-center">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
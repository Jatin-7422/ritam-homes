import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/whitelogo.png";
import logoDark from "../../assets/newlogo.png";
import { AppContext } from "../../App";
import TenantNotifications from "./TenantNotifications";
import SettingsComponent from "../../components/Settings"; 
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

  const isTenantSection = location.pathname.startsWith("/tenant-dashboard");

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/tenant-dashboard" },
    { name: "Explore", icon: Search, path: "/tenant-dashboard/explore" },
    { name: "Messages", icon: MessageSquare, path: "/tenant-dashboard/messages", hasNotification: hasUnreadMessages },
    { name: "Bookings", icon: Calendar, path: "/tenant-dashboard/bookings", hasNotification: hasActiveBookingsUpdate },
    { name: "Saved", icon: Heart, path: "/tenant-dashboard/saved" },
    { name: "Documents", icon: FileText, path: "/tenant-dashboard/documents" },
    ...(isTenantSection ? [{ name: "Settings", icon: Settings, path: "/tenant-dashboard/settings" }] : []),
  ];

  useEffect(() => {
    const fetchTenantNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) return;
        const userId = session.user.id;

        const { count: msgCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", userId)
          .eq("is_read", false);

        setHasUnreadMessages(Boolean(msgCount && msgCount > 0));

        const { count: bookingCount } = await supabase
          .from("property_visit_slots")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", userId)
          .in("status", ["confirmed", "rescheduled"]);

        setHasActiveBookingsUpdate(Boolean(bookingCount && bookingCount > 0));
      } catch (err) {
        console.error("Error fetching tenant notifications:", err);
      }
    };

    fetchTenantNotifications();
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
            avatar: user.user_metadata?.avatar_url || prev.avatar || "",
          }));
        }
      } catch (err) {
        console.error("Auth session error:", err);
      }
    };
    fetchSession();
  }, [setUserInfo]);

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

  return (
    <div
      className={`min-h-screen font-sans flex flex-col relative transition-colors duration-300 ${
        isDarkTheme ? "bg-[#1A120B] text-white" : "bg-[#F8F5EE] text-[#2D1F1A]"
      }`}
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-20 relative flex items-center justify-between gap-2">
          
          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-1 z-10 shrink-0 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkTheme ? "text-white hover:bg-neutral-800" : "text-[#2D1F1A] hover:bg-[#F8F5EE]"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Logo (Compact sizing) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link to="/tenant-dashboard" className="flex items-center">
              <img
                src={isDarkTheme ? logoWhite : (logoDark || logoWhite)} 
                alt="Ritam Homes"
                className="h-10 lg:h-12 w-auto object-contain max-w-[140px]"
              />
            </Link>
          </div>

          {/* Mobile Centered Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center justify-center pointer-events-auto">
            <Link to="/tenant-dashboard" className="flex items-center">
              <img
                src={isDarkTheme ? logoWhite : (logoDark || logoWhite)} 
                alt="Ritam Homes"
                className="h-12 sm:h-14 w-auto object-contain max-w-[190px]"
              />
            </Link>
          </div>

          {/* DESKTOP NAVIGATION (Tuned spacing & sizing to fit standard screens perfectly) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/tenant-dashboard"
                ? location.pathname === "/tenant-dashboard"
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#C5924E] text-white shadow-md"
                      : isDarkTheme 
                        ? "text-[#D1C4B9] hover:bg-white/5 hover:text-white" 
                        : "text-[#6E5D53] hover:bg-[#F8F5EE] hover:text-[#2D1F1A]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.hasNotification && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-sm border border-white/50"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SECTION (Compact & guaranteed visible layout) */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-full transition-colors ${
                  isDarkTheme ? "bg-neutral-800 hover:bg-neutral-700 text-white" : "bg-[#F8F5EE] hover:bg-[#EADBCE] text-[#2D1F1A]"
                }`}
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

            {/* Switch to Hosting Button */}
            <Link
              to="/owner-dashboard"
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-colors border shrink-0 ${
                isDarkTheme 
                  ? "border-neutral-700 hover:bg-neutral-800 text-[#C5924E]" 
                  : "border-[#E3D9CC] hover:bg-[#F8F5EE] text-[#C5924E]"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" /> 
              <span className="hidden xl:inline">Switch to Hosting</span>
              <span className="xl:hidden">Host</span>
            </Link>

            {/* Profile Pill & Logout */}
            <div className={`hidden md:flex items-center gap-2 pl-2 border-l shrink-0 ${
              isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"
            }`}>
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-2xl border ${
                isDarkTheme ? "bg-neutral-900 border-neutral-800" : "bg-[#FAF7F2] border-[#EFEBE4]"
              }`}>
                {userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-[#C5924E]/50 shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#C5924E] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "T"}
                  </div>
                )}
                <span className="text-xs font-bold truncate max-w-[90px] hidden xl:inline">
                  {userInfo?.fullName || "Tenant User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout Account"
                className={`p-2 rounded-xl transition-colors text-rose-500 shrink-0 ${
                  isDarkTheme ? "bg-neutral-800 hover:bg-neutral-700" : "bg-[#F8F5EE] hover:bg-[#EADBCE]"
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Medium-screen (MD to LG) Navigation Row */}
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
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      <div className={`fixed inset-0 z-50 md:hidden flex transition-all duration-300 ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`relative w-72 max-w-full flex flex-col h-full shadow-2xl z-10 transition-transform ${isDarkTheme ? "bg-[#221A17] text-white" : "bg-white text-[#2D1F1A]"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-4 flex items-center justify-between border-b border-neutral-700/30">
            <div className="flex items-center gap-3">
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-[#C5924E]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#C5924E] flex items-center justify-center text-white font-bold text-base">
                  {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "T"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold truncate">{userInfo?.fullName || "Tenant User"}</p>
                <p className="text-xs text-gray-400 truncate">{userInfo?.email}</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive ? "bg-[#C5924E] text-white" : "hover:bg-neutral-800/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t space-y-2">
            <Link to="/owner-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#C5924E]">
              <Building2 className="w-4 h-4" /> Switch to Hosting
            </Link>
            <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500">
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
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
  Building2,
  ChevronDown
} from "lucide-react";

export default function TenantDashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
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
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                isDarkTheme ? "text-white hover:bg-neutral-800" : "text-[#2D1F1A] hover:bg-[#F8F5EE]"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/tenant-dashboard" className="flex items-center">
              <img
                src={isDarkTheme ? logoWhite : (logoDark || logoWhite)} 
                alt="Ritam Homes"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 mx-6 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/tenant-dashboard"
                ? location.pathname === "/tenant-dashboard"
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#C5924E] text-white shadow-md"
                      : isDarkTheme 
                        ? "text-[#D1C4B9] hover:bg-white/5 hover:text-white" 
                        : "text-[#6E5D53] hover:bg-[#F8F5EE] hover:text-[#2D1F1A]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.hasNotification && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm border border-white/50"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2.5 rounded-full transition-colors ${
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

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all ${
                  isDarkTheme ? "border-neutral-800 hover:bg-neutral-800/50" : "border-[#E3D9CC] hover:bg-[#F8F5EE]"
                }`}
              >
                {userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#C5924E]/50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#C5924E] flex items-center justify-center text-white font-bold text-sm">
                    {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "T"}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold truncate max-w-[100px]">{userInfo?.fullName || "Tenant"}</p>
                </div>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-500" />
              </button>

              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-xl border py-2 z-50 ${
                  isDarkTheme ? "bg-[#221A17] border-neutral-800" : "bg-white border-[#E3D9CC]"
                }`}>
                  <div className="px-4 py-3 border-b border-gray-200/20 mb-2">
                    <p className="text-sm font-bold truncate">{userInfo?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{userInfo?.email}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-green-500 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Verified Tenant
                    </div>
                  </div>
                  
                  <Link
                    to="/owner-dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isDarkTheme ? "hover:bg-white/5 text-[#C5924E]" : "hover:bg-[#F8F5EE] text-[#C5924E]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Switch to Hosting
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-red-500 ${
                      isDarkTheme ? "hover:bg-white/5" : "hover:bg-red-50"
                    }`}
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-top px-4 py-4 space-y-1 shadow-inner ${
            isDarkTheme ? "bg-[#1A120B] border-neutral-800" : "bg-[#F8F5EE] border-[#E3D9CC]"
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#C5924E] text-white shadow-md"
                      : isDarkTheme 
                        ? "text-[#D1C4B9] hover:bg-[#221A17]" 
                        : "text-[#6E5D53] hover:bg-white"
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
        )}
      </header>

      {/* MAIN DYNAMIC CONTENT OUTLET */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
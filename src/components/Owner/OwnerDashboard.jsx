import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";

export default function OwnerDashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Rahul",
    email: "",
    avatar: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

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

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/owner-dashboard" },
    { name: "My Properties", icon: Building2, path: "/owner-properties" },
    { name: "Add New Property", icon: PlusCircle, path: "/add-property" },
    { name: "Visit Requests", icon: CalendarCheck, path: "/owner-visits" }, // Fixed route path matching App.jsx
    { name: "Bookings", icon: Calendar, path: "/owner-bookings" },
    { name: "Tenants", icon: Users, path: "/owner-tenants" },
    { name: "Earnings", icon: IndianRupee, path: "/owner-earnings" },
    { name: "Documents", icon: FileText, path: "/owner-documents" },
    { name: "Messages", icon: MessageSquare, path: "/owner-messages" },
    { name: "Reviews", icon: Star, path: "/owner-reviews" },
    { name: "Account Settings", icon: Settings, path: "/owner-settings" },
  ];

  return (
    <div
      className={`min-h-screen bg-[#F8F5EE] font-sans text-[#2D1F1A] flex flex-col md:flex-row relative transition-opacity duration-500 ${isLoggingOut ? "opacity-90" : "opacity-100"}`}
    >
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

      {/* PERSISTENT SIDEBAR */}
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path || "#"}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#C5924E] text-[#2D1F1A] font-bold shadow-lg"
                      : "hover:bg-[#3A2E2A] text-[#D1C4B9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#2D1F1A]" : "text-[#9E8B7F]"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
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

      {/* MAIN CONTAINER FOR OUTLET CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="w-full bg-[#F8F5EE] px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 bg-white border border-[#E3D9CC] rounded-xl text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto">
            <button className="relative p-2.5 bg-white border border-[#E3D9CC] rounded-full text-[#2D1F1A] hover:bg-[#E3D9CC]/50 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Outlet Renders Individual Tab Files Cleanly */}
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

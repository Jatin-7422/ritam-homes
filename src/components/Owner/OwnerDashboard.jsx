import React, { useState, useEffect, useContext } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/whitelogo.png";
import { AppContext } from "../../App"; // Adjust path if needed
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

  // Notification state indicators
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasPendingBookings, setHasPendingBookings] = useState(false);

  // Dynamic verification status state
  const [verificationStatus, setVerificationStatus] = useState("Loading...");

  // Consume global context data
  const { userInfo, setUserInfo, preferences } = useContext(AppContext);
  const isDarkTheme =
    preferences.theme === "Dark Mode" || preferences.theme === "Dark";

  const useNavigateInstance = useNavigate();
  const location = useLocation();

  // Fetch unread messages, pending bookings, and document verification status on load
  useEffect(() => {
    const fetchNotificationsAndStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session || !session.user) return;
        const userId = session.user.id;

        // 1. Initial check for unread messages
        const { count: msgCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", userId)
          .eq("is_read", false);

        if (msgCount && msgCount > 0) {
          setHasUnreadMessages(true);
        }

        // 2. Initial check for pending bookings on owner's properties
        const { data: props } = await supabase
          .from("properties")
          .select("id")
          .eq("owner_id", userId);

        if (props && props.length > 0) {
          const propertyIds = props.map((p) => p.id);
          const { count: slotCount } = await supabase
            .from("property_visit_slots")
            .select("*", { count: "exact", head: true })
            .in("property_id", propertyIds)
            .eq("status", "pending");

          if (slotCount && slotCount > 0) {
            setHasPendingBookings(true);
          }
        }

        // 3. Fetch all owner documents to determine a consolidated verification status accurately
        const { data: docData, error: docError } = await supabase
          .from("owner_documents")
          .select("status")
          .eq("owner_id", userId);

        if (docError) {
          console.error("Error fetching verification status:", docError);
        }

        if (docData && docData.length > 0) {
          // Check statuses across all uploaded records
          const statuses = docData.map((d) => (d.status || "").toLowerCase());
          
          // Priority 1: If ANY document is rejected, overall status is Rejected
          if (statuses.some((s) => s === "rejected")) {
            setVerificationStatus("Rejected");
          } 
          // Priority 2: If ANY document is pending, overall status is Pending
          else if (statuses.some((s) => s === "pending")) {
            setVerificationStatus("Pending");
          } 
          // Priority 3: ONLY if ALL documents are verified, status is Verified
          else if (statuses.every((s) => s === "verified")) {
            setVerificationStatus("Verified");
          } else {
            // Fallback if status strings vary slightly
            setVerificationStatus(docData[0].status || "Documents Uploaded");
          }
        } else {
          setVerificationStatus("Not Uploaded");
        }
      } catch (err) {
        console.error("Error fetching notifications and status:", err);
        setVerificationStatus("Not Uploaded");
      }
    };

    fetchNotificationsAndStatus();

    // Setup real-time listener for live notification updates
    const messageSubscription = supabase
      .channel("owner-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new && payload.new.is_read === false) {
            setHasUnreadMessages(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, []);

  // Sync basic auth data without overriding user-updated context states
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && session.user) {
          const user = session.user;
          setUserInfo((prev) => ({
            ...prev,
            email: prev.email || user.email,
            fullName:
              prev.fullName !== "Master"
                ? prev.fullName
                : user.user_metadata?.full_name || prev.fullName,
            businessName:
              user.user_metadata?.business_name || prev.businessName,
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

  // Auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
    { name: "Dashboard", icon: LayoutDashboard, path: "/owner-dashboard" },
    { name: "My Properties", icon: Building2, path: "/owner-properties" },
    { name: "Add New Property", icon: PlusCircle, path: "/add-property" },
    {
      name: "Bookings",
      icon: Calendar,
      path: "/owner-bookings",
      hasNotification: hasPendingBookings,
    },
    { name: "Tenants", icon: Users, path: "/owner-tenants" },
    { name: "Earnings", icon: IndianRupee, path: "/owner-earnings" },
    { name: "Documents", icon: FileText, path: "/owner-dashboard/documents" },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "/messages",
      hasNotification: hasUnreadMessages,
    },
    { name: "Reviews", icon: Star, path: "/owner-dashboard/reviews" },
    { name: "Account Settings", icon: Settings, path: "/owner-settings" },
  ];

  return (
    <div
      className={`min-h-screen font-sans flex flex-col md:flex-row relative transition-colors duration-300 ${
        isDarkTheme ? "bg-[#1A120B] text-white" : "bg-[#F8F5EE] text-[#2D1F1A]"
      } ${isLoggingOut ? "opacity-90" : "opacity-100"}`}
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
        className={`w-72 bg-[#2D1F1A] text-[#D1C4B9] flex flex-col justify-between flex-shrink-0 z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
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
            {userInfo.avatar ? (
              <img
                src={userInfo.avatar}
                alt={userInfo.fullName}
                className="w-9 h-9 rounded-full object-cover border border-[#C5924E]/50"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#C5924E] flex items-center justify-center text-[#2D1F1A] font-bold text-sm shadow">
                {userInfo.fullName
                  ? userInfo.fullName.charAt(0).toUpperCase()
                  : "M"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-xs truncate">
                {userInfo.fullName}
              </h4>
              <p className="text-[10px] text-[#9E8B7F] truncate">
                {userInfo.businessName}
              </p>
              
              {/* Dynamic Status Badge */}
              <div
                className={`flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md w-fit border ${
                  verificationStatus.toLowerCase() === "verified"
                    ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/40"
                    : verificationStatus.toLowerCase() === "rejected"
                    ? "text-rose-400 bg-rose-950/40 border-rose-800/40"
                    : verificationStatus.toLowerCase() === "pending"
                    ? "text-amber-400 bg-amber-950/40 border-amber-800/40"
                    : "text-neutral-400 bg-neutral-900/40 border-neutral-700/40"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {verificationStatus.toLowerCase() === "verified"
                  ? "Verified Owner"
                  : verificationStatus.toLowerCase() === "rejected"
                  ? "Verification Rejected"
                  : verificationStatus.toLowerCase() === "pending"
                  ? "Pending Verification"
                  : verificationStatus}
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
                      className={`w-4 h-4 ${
                        isActive ? "text-[#2D1F1A]" : "text-[#9E8B7F]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.hasNotification && (
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-sm"></span>
                  )}
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
        <header
          className={`w-full px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between transition-colors ${
            isDarkTheme ? "bg-[#1A120B]" : "bg-[#F8F5EE]"
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`md:hidden p-2 border rounded-xl transition-colors cursor-pointer ${
              isDarkTheme
                ? "bg-[#251B14] border-neutral-800 text-white hover:bg-neutral-800"
                : "bg-white border-[#E3D9CC] text-[#2D1F1A] hover:bg-[#E3D9CC]/50"
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto">
            <button
              className={`relative p-2.5 border rounded-full transition-colors cursor-pointer ${
                isDarkTheme
                  ? "bg-[#251B14] border-neutral-800 text-white hover:bg-neutral-800"
                  : "bg-white border-[#E3D9CC] text-[#2D1F1A] hover:bg-[#E3D9CC]/50"
              }`}
            >
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
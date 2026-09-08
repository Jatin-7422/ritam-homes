import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Calendar,
  Heart,
  MessageSquare,
  Compass,
  ArrowRight,
  Loader2,
  Home,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function TenantOverview() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Tenant");
  const [stats, setStats] = useState({
    activeBookings: 0,
    savedProperties: 0,
    unreadMessages: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const fullName =
            meta.full_name ||
            meta.name ||
            session.user.email?.split("@")[0] ||
            "Tenant";
          setUserName(fullName.charAt(0).toUpperCase() + fullName.slice(1));

          const userId = session.user.id;

          const { data: slotsData, error: slotsErr } = await supabase
            .from("property_visit_slots")
            .select(
              `
              id,
              date,
              time_slot,
              status,
              created_at,
              properties (
                title,
                location
              )
            `,
            )
            .eq("tenant_id", userId);

          if (!slotsErr && slotsData) {
            setStats((prev) => ({
              ...prev,
              activeBookings: slotsData.length,
            }));
            setRecentBookings(slotsData.slice(0, 3));
          }

          const { count: savedCount } = await supabase
            .from("saved_properties")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", userId);

          const { count: messagesCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", userId)
            .eq("is_read", false);

          setStats((prev) => ({
            ...prev,
            savedProperties: savedCount || 0,
            unreadMessages: messagesCount || 0,
          }));
        }
      } catch (err) {
        console.error("Error fetching tenant overview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-6xl mx-auto w-full pb-12">
      {/* Welcome Banner - Compact & Gorgeous */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#EADBCE] bg-gradient-to-r from-white via-[#FAF7F2] to-[#F5EFE6] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#EADBCE] text-[10px] sm:text-xs font-bold text-[#C5924E]">
            <Sparkles className="w-3 h-3" />
            <span>Verified Tenant Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A] tracking-tight">
            Hello, {userName} 👋
          </h1>
          <p className="text-xs text-[#6E5D53] max-w-md line-clamp-2 sm:line-clamp-none">
            Manage your scheduled visits, explore verified rentals, and keep track of your saved properties effortlessly.
          </p>
        </div>

        <Link
          to="/tenant-dashboard/explore"
          className="w-full sm:w-auto px-4 py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 z-10"
        >
          <Compass className="w-3.5 h-3.5 text-[#C5924E]" />
          <span>Explore Properties</span>
        </Link>
      </div>

      {/* Metrics Row - Compact Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Bookings */}
        <Link 
          to="/tenant-dashboard/bookings"
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#EADBCE] shadow-2xs hover:border-[#C5924E] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E5D53] uppercase tracking-wider truncate">
              Bookings
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] group-hover:bg-[#C5924E] group-hover:text-white transition-all shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2D1F1A]">
              {stats.activeBookings}
            </h3>
            <p className="text-[10px] text-[#8C7A6B] hidden sm:block">Scheduled tours</p>
          </div>
        </Link>

        {/* Wishlist */}
        <Link 
          to="/tenant-dashboard/saved"
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#EADBCE] shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E5D53] uppercase tracking-wider truncate">
              Wishlist
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2D1F1A]">
              {stats.savedProperties}
            </h3>
            <p className="text-[10px] text-[#8C7A6B] hidden sm:block">Bookmarked homes</p>
          </div>
        </Link>

        {/* Messages */}
        <Link 
          to="/tenant-dashboard/messages"
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#EADBCE] shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E5D53] uppercase tracking-wider truncate">
              Messages
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2D1F1A]">
              {stats.unreadMessages}
            </h3>
            <p className="text-[10px] text-[#8C7A6B] hidden sm:block">Unread chats</p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Bookings & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Bookings (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EADBCE] shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADBCE]/40 pb-3">
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#2D1F1A]">
                Recent Bookings
              </h2>
              <Link
                to="/tenant-dashboard/bookings"
                className="text-[11px] font-bold text-[#C5924E] hover:underline flex items-center gap-0.5"
              >
                <span>All Bookings</span> 
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="space-y-2.5">
                {recentBookings.map((booking) => {
                  const propertyTitle = booking.properties?.title || "Rental Property";
                  const propertyLocation = booking.properties?.location || "Location not specified";
                  const slotStatus = booking.status || "pending";

                  return (
                    <div
                      key={booking.id}
                      className="p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2]/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shrink-0">
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#2D1F1A] truncate">
                            {propertyTitle}
                          </h4>
                          <p className="text-[10px] text-[#6E5D53] truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-[#C5924E] shrink-0" />
                            <span className="truncate">{propertyLocation}</span>
                          </p>
                          <p className="text-[10px] text-[#8C7A6B]">
                            {booking.date} • {booking.time_slot}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-full border uppercase tracking-wider shrink-0 ${
                          slotStatus === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : slotStatus === "rejected" || slotStatus === "cancelled"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {slotStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3 border border-dashed border-[#EADBCE] rounded-2xl bg-[#FAF7F2]/30">
                <p className="text-xs text-[#6E5D53]">No bookings scheduled right now.</p>
                <Link
                  to="/tenant-dashboard/explore"
                  className="inline-block px-4 py-2 bg-[#2D1F1A] text-white text-[11px] font-bold rounded-xl"
                >
                  Browse Listings
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts (1 Col) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EADBCE] shadow-2xs space-y-4">
          <div className="border-b border-[#EADBCE]/40 pb-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#2D1F1A]">
              Quick Shortcuts
            </h2>
          </div>

          <div className="space-y-2">
            <Link
              to="/tenant-dashboard/explore"
              className="p-3 rounded-xl border border-[#EADBCE] hover:border-[#C5924E] bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F1A]">Search Properties</h4>
                  <p className="text-[10px] text-[#6E5D53]">Find homes & villas</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5D53] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/tenant-dashboard/messages"
              className="p-3 rounded-xl border border-[#EADBCE] hover:border-[#C5924E] bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F1A]">Messages</h4>
                  <p className="text-[10px] text-[#6E5D53]">Chat with owners</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5D53] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/tenant-dashboard/saved"
              className="p-3 rounded-xl border border-[#EADBCE] hover:border-rose-300 bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBCE] flex items-center justify-center text-rose-500">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F1A]">Saved Wishlist</h4>
                  <p className="text-[10px] text-[#6E5D53]">Bookmarked properties</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5D53] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
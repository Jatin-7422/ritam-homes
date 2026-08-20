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

        // 1. Get Logged-in User Session & Metadata
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

          // 2. Fetch Real Counts & Data from 'property_visit_slots' & other tables
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
            // Visit requests are treated as part of bookings
            setStats((prev) => ({
              ...prev,
              activeBookings: slotsData.length,
            }));

            // Set top 3 recent bookings/requests
            setRecentBookings(slotsData.slice(0, 3));
          }

          // Fetch Saved Properties / Wishlist
          const { count: savedCount } = await supabase
            .from("saved_properties")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", userId);

          // Fetch Messages count (Unread chats)
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
      <div className="flex-1 flex items-center justify-center p-12 min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
            <span>Tenant Portal Dashboard</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl">
            Explore verified properties, track your rental bookings, and manage
            your scheduled visits seamlessly all in one place.
          </p>
        </div>
        <Link
          to="/tenant-dashboard/explore"
          className="px-6 py-3.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-semibold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
        >
          <Compass className="w-4 h-4 text-[#C5924E]" />
          <span>Explore Properties</span>
        </Link>
      </div>

      {/* Metrics Row (Updated to 3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E5D53]">
              Total Bookings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold font-serif text-[#2D1F1A]">
              {stats.activeBookings}
            </h3>
            <p className="text-[11px] text-[#8C7A6B] mt-1">
              Scheduled visits & bookings
            </p>
          </div>
        </div>

        {/* Saved Properties */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E5D53]">
              Saved Properties
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-rose-500">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold font-serif text-[#2D1F1A]">
              {stats.savedProperties}
            </h3>
            <p className="text-[11px] text-[#8C7A6B] mt-1">In your wishlist</p>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E5D53]">
              Messages
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-amber-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold font-serif text-[#2D1F1A]">
              {stats.unreadMessages}
            </h3>
            <p className="text-[11px] text-[#8C7A6B] mt-1">
              Unread chats from owners
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Quick Shortcuts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings List (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
              Recent Bookings
            </h2>
            <Link
              to="/tenant-dashboard/bookings"
              className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => {
                const propertyTitle =
                  booking.properties?.title || "Rental Property";
                const slotStatus = booking.status || "pending";

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl border border-[#EADBCE] bg-[#FAF7F2]/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#2D1F1A]">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#2D1F1A]">
                          {propertyTitle}
                        </h4>
                        <p className="text-[11px] text-[#6E5D53]">
                          Visit Date:{" "}
                          <strong className="text-[#2D1F1A]">
                            {booking.date}
                          </strong>{" "}
                          at{" "}
                          <strong className="text-[#2D1F1A]">
                            {booking.time_slot}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase ${
                        slotStatus === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : slotStatus === "rejected"
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
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-[#EADBCE] rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53]">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#2D1F1A]">
                  No active bookings found
                </p>
                <p className="text-[11px] text-[#6E5D53]">
                  Explore properties and book a visit slot to get started!
                </p>
              </div>
              <Link
                to="/tenant-dashboard/explore"
                className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3E2E27] transition-all"
              >
                Browse Listings
              </Link>
            </div>
          )}
        </div>

        {/* Quick Shortcuts (1 Column) */}
        <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm space-y-6">
          <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
            Quick Shortcuts
          </h2>

          <div className="space-y-3">
            <Link
              to="/tenant-dashboard/explore"
              className="p-4 rounded-2xl border border-[#EADBCE] hover:border-[#C5924E] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F1A]">
                    Search Properties
                  </h4>
                  <p className="text-[11px] text-[#6E5D53]">
                    Find apartments & villas
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6E5D53] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/tenant-dashboard/messages"
              className="p-4 rounded-2xl border border-[#EADBCE] hover:border-[#C5924E] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F1A]">
                    Open Messages
                  </h4>
                  <p className="text-[11px] text-[#6E5D53]">
                    Chat with property owners
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6E5D53] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/tenant-dashboard/saved"
              className="p-4 rounded-2xl border border-[#EADBCE] hover:border-[#C5924E] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F1A]">
                    Saved Wishlist
                  </h4>
                  <p className="text-[11px] text-[#6E5D53]">
                    View bookmarked homes
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6E5D53] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

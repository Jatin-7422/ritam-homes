import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AppContext } from "../../App"; // Adjust path if needed
import {
  Building2,
  Eye,
  Calendar,
  IndianRupee,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function OwnerOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Consume global context data and theme preference
  const { userInfo, setUserInfo, preferences } = useContext(AppContext);
  const isDarkTheme = preferences.theme === "Dark Mode";

  // Dashboard Metrics State
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
  });

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate("/login", { replace: true });
        return;
      }

      const ownerId = session.user.id;

      // Extract owner's display name from Supabase session user_metadata or email
      const metadata = session.user.user_metadata;
      const rawName =
        metadata?.full_name ||
        metadata?.name ||
        metadata?.username ||
        session.user.email?.split("@")[0] ||
        "Owner";

      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      // Update global context name if empty
      if (!userInfo.fullName || userInfo.fullName === "Owner") {
        setUserInfo((prev) => ({ ...prev, fullName: formattedName }));
      }

      // 1. Fetch Owner's Properties
      const { data: propData, error: propError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", ownerId);

      if (propError) throw propError;

      const propertyList = propData || [];
      setProperties(propertyList);
      const propertyCount = propertyList.length;
      const propertyIds = propertyList.map((p) => p.id);

      // 2. Fetch Bookings from 'property_visit_slots'
      let confirmedBookingsCount = 0;
      let totalEarningsAmount = 0;

      if (propertyIds.length > 0) {
        const { data: slotsData, error: slotsError } = await supabase
          .from("property_visit_slots")
          .select("*")
          .in("property_id", propertyIds);

        if (!slotsError && slotsData) {
          const confirmedSlots = slotsData.filter(
            (slot) => slot.status === "confirmed" || slot.status === "approved",
          );

          confirmedBookingsCount = confirmedSlots.length;

          totalEarningsAmount = confirmedSlots.reduce((acc, curr) => {
            const propMatch = propertyList.find(
              (p) => p.id === curr.property_id,
            );
            return (
              acc +
              (Number(curr.total_price) ||
                Number(curr.amount) ||
                Number(propMatch?.price) ||
                0)
            );
          }, 0);
        }
      }

      // Calculate total views dynamically from each property record (falling back to 0 if null/undefined)
      const totalViewsCount = propertyList.reduce(
        (acc, curr) => acc + (Number(curr.views) || 0),
        0,
      );

      setStats({
        totalProperties: propertyCount,
        totalViews: totalViewsCount,
        confirmedBookings: confirmedBookingsCount,
        totalEarnings: totalEarningsAmount,
      });
    } catch (err) {
      console.error("Error loading dashboard metrics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`px-6 sm:px-10 py-8 max-w-7xl w-full mx-auto space-y-6 transition-colors duration-300 ${
        isDarkTheme ? "text-white" : "text-[#2D1F1A]"
      }`}
    >
      {/* TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-serif font-bold flex items-center gap-2 ${
              isDarkTheme ? "text-white" : "text-[#2D1F1A]"
            }`}
          >
            Welcome back, {loading ? "..." : userInfo.fullName || "Owner"}! 👋
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 ${
              isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
            }`}
          >
            Here's what's happening with your properties today.
          </p>
        </div>

        <button
          onClick={() => navigate("/add-property")}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isDarkTheme
              ? "bg-[#C5924E] text-[#2D1F1A] hover:bg-[#b07d3b]"
              : "bg-[#2D1F1A] text-white hover:bg-[#3D2B24]"
          }`}
        >
          <Plus
            className={`w-4 h-4 ${
              isDarkTheme ? "text-[#2D1F1A]" : "text-[#C5924E]"
            }`}
          />{" "}
          Add New Property
        </button>
      </div>

      {/* METRICS CARDS GRID (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Properties */}
        <div
          className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
            isDarkTheme
              ? "bg-[#251B14] border-neutral-800"
              : "bg-white border-[#E3D9CC]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold ${
                isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
              }`}
            >
              Total Properties
            </span>
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[#C5924E] ${
                isDarkTheme
                  ? "bg-[#1E150F] border-neutral-800"
                  : "bg-[#F8F5EE] border-[#E3D9CC]"
              }`}
            >
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-serif font-bold ${
                isDarkTheme ? "text-white" : "text-[#2D1F1A]"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C5924E]" />
              ) : (
                stats.totalProperties
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 block ${
                isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
              }`}
            >
              Active Listings
            </span>
          </div>
        </div>

        {/* Card 2: Total Views */}
        <div
          className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
            isDarkTheme
              ? "bg-[#251B14] border-neutral-800"
              : "bg-white border-[#E3D9CC]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold ${
                isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
              }`}
            >
              Total Views
            </span>
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[#C5924E] ${
                isDarkTheme
                  ? "bg-[#1E150F] border-neutral-800"
                  : "bg-[#F8F5EE] border-[#E3D9CC]"
              }`}
            >
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-serif font-bold ${
                isDarkTheme ? "text-white" : "text-[#2D1F1A]"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C5924E]" />
              ) : (
                stats.totalViews
              )}
            </div>
            <span className="text-[10px] text-emerald-500 font-bold mt-0.5 block">
              Cumulative Property Views
            </span>
          </div>
        </div>

        {/* Card 3: Confirmed Bookings */}
        <div
          className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
            isDarkTheme
              ? "bg-[#251B14] border-neutral-800"
              : "bg-white border-[#E3D9CC]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold ${
                isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
              }`}
            >
              Confirmed Bookings
            </span>
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[#C5924E] ${
                isDarkTheme
                  ? "bg-[#1E150F] border-neutral-800"
                  : "bg-[#F8F5EE] border-[#E3D9CC]"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-serif font-bold ${
                isDarkTheme ? "text-white" : "text-[#2D1F1A]"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C5924E]" />
              ) : (
                stats.confirmedBookings
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 block ${
                isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
              }`}
            >
              Total Confirmed
            </span>
          </div>
        </div>

        {/* Card 4: Total Earnings */}
        <div
          className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
            isDarkTheme
              ? "bg-[#251B14] border-neutral-800"
              : "bg-white border-[#E3D9CC]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold ${
                isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
              }`}
            >
              Total Earnings
            </span>
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[#C5924E] ${
                isDarkTheme
                  ? "bg-[#1E150F] border-neutral-800"
                  : "bg-[#F8F5EE] border-[#E3D9CC]"
              }`}
            >
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-serif font-bold ${
                isDarkTheme ? "text-white" : "text-[#2D1F1A]"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C5924E]" />
              ) : (
                `₹${stats.totalEarnings}`
              )}
            </div>
            <span className="text-[10px] text-emerald-500 font-bold mt-0.5 block">
              Revenue
            </span>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: PROPERTIES & EARNINGS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Properties Section */}
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-xs space-y-6 flex flex-col justify-between transition-colors ${
            isDarkTheme
              ? "bg-[#251B14] border-neutral-800"
              : "bg-white border-[#E3D9CC]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-base sm:text-lg font-serif font-bold ${
                isDarkTheme ? "text-white" : "text-[#2D1F1A]"
              }`}
            >
              My Properties
            </h2>
            <Link
              to="/owner-properties"
              className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
            >
              View All Properties <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
            </div>
          ) : properties.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center my-auto transition-colors ${
                isDarkTheme
                  ? "border-neutral-800 bg-[#1E150F]/50"
                  : "border-[#E3D9CC] bg-[#F8F5EE]/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center text-[#C5924E] mb-3 shadow-xs ${
                  isDarkTheme
                    ? "bg-[#251B14] border-neutral-800"
                    : "bg-white border-[#E3D9CC]"
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <strong
                className={`text-xs sm:text-sm font-bold ${
                  isDarkTheme ? "text-white" : "text-[#2D1F1A]"
                }`}
              >
                No properties found
              </strong>
              <span
                className={`text-[11px] mt-0.5 ${
                  isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
                }`}
              >
                Properties added from database will appear here.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className={`p-3 border rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                    isDarkTheme
                      ? "bg-[#1E150F] border-neutral-800"
                      : "bg-[#F8F5EE] border-[#E3D9CC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        property.images?.[0] ||
                        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=100"
                      }
                      alt=""
                      className={`w-12 h-12 rounded-xl object-cover border ${
                        isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"
                      }`}
                    />
                    <div>
                      <h4
                        className={`text-xs font-bold line-clamp-1 ${
                          isDarkTheme ? "text-white" : "text-[#2D1F1A]"
                        }`}
                      >
                        {property.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] ${
                            isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
                          }`}
                        >
                          {property.location}
                        </span>
                        <span className="text-[10px] text-neutral-400">•</span>
                        <span
                          className={`text-[10px] flex items-center gap-1 ${
                            isDarkTheme ? "text-[#C5924E]" : "text-[#C5924E]"
                          }`}
                        >
                          <Eye className="w-3 h-3" /> {property.views || 0}{" "}
                          views
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-serif font-bold ${
                      isDarkTheme ? "text-white" : "text-[#2D1F1A]"
                    }`}
                  >
                    ₹{property.price}/mo
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/add-property")}
            className={`w-full py-3 border rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isDarkTheme
                ? "bg-[#1E150F] border-neutral-800 text-white hover:bg-[#2A1F18]"
                : "bg-[#F8F5EE] border-[#E3D9CC] text-[#2D1F1A] hover:bg-[#F2ECE1]"
            }`}
          >
            <Plus className="w-4 h-4 text-[#C5924E]" /> Add New Property
          </button>
        </div>

        {/* Right Column: Earnings Overview */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-xs space-y-4 transition-colors ${
              isDarkTheme
                ? "bg-[#251B14] border-neutral-800"
                : "bg-white border-[#E3D9CC]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2
                className={`text-base sm:text-lg font-serif font-bold ${
                  isDarkTheme ? "text-white" : "text-[#2D1F1A]"
                }`}
              >
                Earnings Overview
              </h2>
              <span
                onClick={() => navigate("/owner-earnings")}
                className="text-xs font-bold text-[#C5924E] cursor-pointer hover:underline flex items-center gap-1"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                isDarkTheme
                  ? "border-neutral-800 bg-[#1E150F]/50"
                  : "border-[#E3D9CC] bg-[#F8F5EE]/50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center text-[#C5924E] mb-2 shadow-xs ${
                  isDarkTheme
                    ? "bg-[#251B14] border-neutral-800"
                    : "bg-white border-[#E3D9CC]"
                }`}
              >
                <IndianRupee className="w-5 h-5" />
              </div>
              <strong
                className={`text-base font-serif font-bold ${
                  isDarkTheme ? "text-white" : "text-[#2D1F1A]"
                }`}
              >
                ₹{stats.totalEarnings}
              </strong>
              <span
                className={`text-[10px] mt-0.5 ${
                  isDarkTheme ? "text-[#B3A499]" : "text-[#6E5D53]"
                }`}
              >
                Total revenue generated from confirmed bookings.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

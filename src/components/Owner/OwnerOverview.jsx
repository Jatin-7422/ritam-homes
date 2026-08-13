import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Building2,
  Eye,
  CalendarCheck,
  Calendar,
  IndianRupee,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function OwnerOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState("Owner");

  // Dashboard Metrics State
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    pendingRequests: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
  });

  const [properties, setProperties] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);

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

      // Capitalize the first letter neatly
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      setOwnerName(formattedName);

      // 1. Fetch Owner's Properties
      const { data: propData, error: propError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", ownerId);

      if (propError) throw propError;

      setProperties(propData || []);

      // Calculate total views or set metrics
      const propertyCount = propData ? propData.length : 0;

      // 2. Fetch Visit Requests (if table exists, otherwise mock safely)
      /*
      const propertyIds = propData.map(p => p.id);
      const { data: reqData } = await supabase
        .from("visit_requests")
        .select("*")
        .in("property_id", propertyIds);
      */

      setStats({
        totalProperties: propertyCount,
        totalViews: 0, // Update if you track views column
        pendingRequests: 0,
        confirmedBookings: 0,
        totalEarnings: 0,
      });
    } catch (err) {
      console.error("Error loading dashboard metrics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 sm:px-10 py-8 max-w-7xl w-full mx-auto space-y-6">
      {/* TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
            Welcome back, {loading ? "..." : ownerName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
            Here's what's happening with your properties today.
          </p>
        </div>

        <button
          onClick={() => navigate("/owner-dashboard/new-property")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D1F1A] text-white hover:bg-[#3D2B24] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5924E]" /> Add New Property
        </button>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Properties */}
        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Total Properties
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#2D1F1A]">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C5924E]" />
              ) : (
                stats.totalProperties
              )}
            </div>
            <span className="text-[10px] text-[#6E5D53] mt-0.5 block">
              Active Listings
            </span>
          </div>
        </div>

        {/* Card 2: Total Views */}
        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Total Views
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#2D1F1A]">
              {stats.totalViews}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
              0% This Month
            </span>
          </div>
        </div>

        {/* Card 3: Visit Requests */}
        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Visit Requests
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#2D1F1A]">
              {stats.pendingRequests}
            </div>
            <span className="text-[10px] text-[#6E5D53] mt-0.5 block">
              Pending
            </span>
          </div>
        </div>

        {/* Card 4: Confirmed Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Confirmed Bookings
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#2D1F1A]">
              {stats.confirmedBookings}
            </div>
            <span className="text-[10px] text-[#6E5D53] mt-0.5 block">
              This Month
            </span>
          </div>
        </div>

        {/* Card 5: Total Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs flex flex-col justify-between space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Total Earnings
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#2D1F1A]">
              ₹{stats.totalEarnings}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
              This Month
            </span>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: PROPERTIES & VISIT REQUESTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Properties Section */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
              My Properties
            </h2>
            <Link
              to="/owner-properties"
              className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
            >
              View All Properties <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="border-2 border-dashed border-[#E3D9CC] rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-[#F8F5EE]/50 my-auto">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E3D9CC] flex items-center justify-center text-[#C5924E] mb-3 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <strong className="text-xs sm:text-sm font-bold text-[#2D1F1A]">
                No properties found
              </strong>
              <span className="text-[11px] text-[#6E5D53] mt-0.5">
                Properties added from database will appear here.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className="p-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        property.images?.[0] ||
                        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=100"
                      }
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-[#E3D9CC]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#2D1F1A] line-clamp-1">
                        {property.title}
                      </h4>
                      <span className="text-[10px] text-[#6E5D53]">
                        {property.location}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-serif font-bold text-[#2D1F1A]">
                    ₹{property.price}/mo
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/owner-dashboard/new-property")}
            className="w-full py-3 bg-[#F8F5EE] border border-[#E3D9CC] text-[#2D1F1A] hover:bg-[#F2ECE1] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C5924E]" /> Add New Property
          </button>
        </div>

        {/* Right Column: Visit Requests & Earnings Overview */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Visit Requests Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
                Visit Requests
              </h2>
              <Link
                to="/owner-visits"
                className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="border-2 border-dashed border-[#E3D9CC] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#F8F5EE]/50">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E3D9CC] flex items-center justify-center text-[#C5924E] mb-2 shadow-xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <strong className="text-xs font-bold text-[#2D1F1A]">
                No visit requests
              </strong>
              <span className="text-[10px] text-[#6E5D53] mt-0.5">
                Incoming requests from database will appear here.
              </span>
            </div>
          </div>

          {/* Earnings Overview Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D1F1A]">
                Earnings Overview
              </h2>
              <span className="text-xs font-bold text-[#C5924E] cursor-pointer hover:underline">
                View Details →
              </span>
            </div>
            <p className="text-xs text-[#6E5D53]">
              Total earnings (This Month):{" "}
              <strong className="text-[#2D1F1A]">₹0</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logoWhite from "../../assets/newlogo.png";
import {
  Home,
  Heart,
  FileText,
  CreditCard,
  Bell,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Building2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Star,
  ChevronRight,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState("Rahul Sharma");
  const [activeLease, setActiveLease] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          navigate("/login");
          return;
        }

        const user = session.user;
        setTenantName(
          user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Rahul Sharma",
        );

        // Fetch visit requests / applications
        const { data: visitData, error: visitError } = await supabase
          .from("visit_requests")
          .select("*, properties(*)")
          .eq("tenant_email", user.email);

        if (visitError) {
          console.error("Error fetching applications:", visitError.message);
        } else {
          setApplications(visitData || []);
          const accepted = (visitData || []).find(
            (v) => v.status === "Accepted",
          );
          if (accepted) {
            setActiveLease(accepted.properties);
          }
        }
      } catch (err) {
        console.error("Unexpected error loading tenant dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#F8F5EE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8F5EE] font-sans text-[#2D1F1A] flex flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#F2ECE1] border-r border-[#E3D9CC] flex flex-col justify-between hidden lg:flex h-screen sticky top-0 p-6 shrink-0">
        <div className="space-y-8 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logoWhite}
              alt="Ritam Homes Logo"
              className="w-24 h-24 object-contain"
            />
          </div>

          {/* User Profile Card Snippet */}
          <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-[#E3D9CC] shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
              alt="Rahul Sharma"
              className="w-12 h-12 rounded-full object-cover border border-[#C5924E]"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-[#2D1F1A] truncate">
                {tenantName}
              </h4>
              <p className="text-xs text-[#6E5D53]">Tenant</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 font-semibold px-2 py-0.5 rounded-md mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Tenant
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              to="/tenant-dashboard"
              className="flex items-center gap-3.5 px-4 py-3.5 bg-[#E3D9CC]/60 text-[#2D1F1A] rounded-xl text-sm font-bold transition-all"
            >
              <Home className="w-5 h-5 text-[#C5924E]" /> Dashboard
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <Search className="w-5 h-5" /> Explore Properties
            </Link>
            <Link
              to="#"
              className="flex items-center justify-between px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3.5">
                <Calendar className="w-5 h-5" /> My Bookings
              </div>
              <span className="bg-[#2D1F1A] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                3
              </span>
            </Link>
            <Link
              to="#"
              className="flex items-center justify-between px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3.5">
                <Heart className="w-5 h-5" /> Saved Properties
              </div>
              <span className="bg-[#2D1F1A] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                8
              </span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <Clock className="w-5 h-5" /> Visit History
            </Link>
            <Link
              to="#"
              className="flex items-center justify-between px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3.5">
                <MessageSquare className="w-5 h-5" /> Messages
              </div>
              <span className="bg-[#2D1F1A] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                2
              </span>
            </Link>
            <Link
              to="#"
              className="flex items-center justify-between px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3.5">
                <Bell className="w-5 h-5" /> Notifications
              </div>
              <span className="bg-[#2D1F1A] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                5
              </span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <FileText className="w-5 h-5" /> Documents
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <CreditCard className="w-5 h-5" /> Payment Methods
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3.5 px-4 py-3.5 text-[#6E5D53] hover:bg-[#E3D9CC]/30 hover:text-[#2D1F1A] rounded-xl text-sm font-medium transition-all"
            >
              <Settings className="w-5 h-5" /> Account Settings
            </Link>
          </nav>
        </div>

        {/* Go Premium Box & Logout */}
        <div className="space-y-4 pt-4 bg-[#F2ECE1]">
          <div className="bg-[#EFE6D8] border border-[#E3D9CC] p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#2D1F1A] text-[#C5924E] rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#2D1F1A]">Go Premium</h4>
            </div>
            <p className="text-[11px] text-[#6E5D53] leading-relaxed">
              Get early access to premium listings and priority bookings.
            </p>
            <button className="w-full py-2 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all cursor-pointer shadow-xs">
              Upgrade Now
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 px-4 py-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* TOP BAR / HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
              Welcome back, {tenantName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5D53] mt-0.5">
              Let's find you the perfect place to call home.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar Input */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6E5D53]" />
              <input
                type="text"
                placeholder="Search properties, locations..."
                className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
              />
            </div>

            {/* Notification Bell Badge */}
            <div className="relative p-2.5 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-[#2D1F1A] cursor-pointer hover:bg-[#EFE6D8]">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-[#C5924E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                5
              </span>
            </div>

            <Link
              to="/explore-properties"
              className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all cursor-pointer shadow-xs"
            >
              Explore Properties
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-serif font-bold text-[#2D1F1A]">3</p>
              <p className="text-[11px] font-bold text-[#6E5D53]">
                Upcoming Visits
              </p>
              <p className="text-[10px] text-[#C5924E] font-medium">
                Next: Today, 4:00 PM
              </p>
            </div>
            <div className="w-11 h-11 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#2D1F1A]">
              <Home className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-serif font-bold text-[#2D1F1A]">8</p>
              <p className="text-[11px] font-bold text-[#6E5D53]">
                Saved Properties
              </p>
              <p className="text-[10px] text-[#6E5D53] font-medium">
                Your Favorites
              </p>
            </div>
            <div className="w-11 h-11 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#C5924E]">
              <Heart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-serif font-bold text-[#2D1F1A]">2</p>
              <p className="text-[11px] font-bold text-[#6E5D53]">
                Confirmed Bookings
              </p>
              <p className="text-[10px] text-[#6E5D53] font-medium">
                This Month
              </p>
            </div>
            <div className="w-11 h-11 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#2D1F1A]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-serif font-bold text-[#2D1F1A]">12</p>
              <p className="text-[11px] font-bold text-[#6E5D53]">
                Visit History
              </p>
              <p className="text-[10px] text-[#6E5D53] font-medium">
                Total Visits
              </p>
            </div>
            <div className="w-11 h-11 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#2D1F1A]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
                4.8
              </p>
              <p className="text-[11px] font-bold text-[#6E5D53]">
                Account Rating
              </p>
              <p className="text-[10px] text-[#6E5D53] font-medium">
                Based on reviews
              </p>
            </div>
            <div className="w-11 h-11 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#C5924E]">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: UPCOMING VISITS & NOTIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: UPCOMING VISITS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-4">
                <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Upcoming Visits
                </h2>
                <Link
                  to="#"
                  className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
                >
                  View All Bookings <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Visit Cards List */}
              <div className="space-y-4">
                {/* Item 1 */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80"
                      alt="Apartment"
                      className="w-24 h-20 object-cover rounded-xl border border-[#E3D9CC]"
                    />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#2D1F1A]">
                        2BHK Luxury Apartment
                      </h4>
                      <p className="text-xs text-[#6E5D53]">
                        Koramangala, Bangalore
                      </p>
                      <p className="text-xs font-medium text-[#2D1F1A] flex items-center gap-2 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                        Today, 4:00 PM &nbsp;|&nbsp;{" "}
                        <span className="text-[#6E5D53]">With Amit Verma</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full">
                      Confirmed
                    </span>
                    <button className="px-4 py-1.5 bg-white border border-[#E3D9CC] text-[#2D1F1A] text-xs font-semibold rounded-xl hover:bg-[#F2ECE1] cursor-pointer">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80"
                      alt="Modern Flat"
                      className="w-24 h-20 object-cover rounded-xl border border-[#E3D9CC]"
                    />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#2D1F1A]">
                        1BHK Modern Flat
                      </h4>
                      <p className="text-xs text-[#6E5D53]">
                        Indiranagar, Bangalore
                      </p>
                      <p className="text-xs font-medium text-[#2D1F1A] flex items-center gap-2 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                        Tomorrow, 11:00 AM &nbsp;|&nbsp;{" "}
                        <span className="text-[#6E5D53]">With Priya Nair</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                      Pending
                    </span>
                    <button className="px-4 py-1.5 bg-white border border-[#E3D9CC] text-[#2D1F1A] text-xs font-semibold rounded-xl hover:bg-[#F2ECE1] cursor-pointer">
                      Reschedule
                    </button>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80"
                      alt="Spacious Home"
                      className="w-24 h-20 object-cover rounded-xl border border-[#E3D9CC]"
                    />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#2D1F1A]">
                        3BHK Spacious Home
                      </h4>
                      <p className="text-xs text-[#6E5D53]">
                        Whitefield, Bangalore
                      </p>
                      <p className="text-xs font-medium text-[#2D1F1A] flex items-center gap-2 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C5924E]" /> 12
                        May 2025, 3:00 PM &nbsp;|&nbsp;{" "}
                        <span className="text-[#6E5D53]">With Vikas Singh</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full">
                      Confirmed
                    </span>
                    <button className="px-4 py-1.5 bg-white border border-[#E3D9CC] text-[#2D1F1A] text-xs font-semibold rounded-xl hover:bg-[#F2ECE1] cursor-pointer">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Book a New Visit CTA Bar */}
              <button className="w-full py-3 bg-[#F8F5EE] border border-dashed border-[#C5924E] text-[#2D1F1A] rounded-2xl text-xs font-bold hover:bg-[#F2ECE1] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4 text-[#C5924E]" /> Book a New Visit
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: NOTIFICATIONS */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-4">
                <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  Notifications
                </h2>
                <Link
                  to="#"
                  className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 text-xs text-[#2D1F1A] border-b border-[#F8F5EE] pb-3">
                  <div className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Your visit for{" "}
                      <span className="font-bold">2BHK Luxury Apartment</span>{" "}
                      is confirmed.
                    </p>
                    <p className="text-[10px] text-[#6E5D53] mt-0.5">
                      Today, 10:30 AM
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-[#2D1F1A] border-b border-[#F8F5EE] pb-3">
                  <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Visit request sent for{" "}
                      <span className="font-bold">1BHK Modern Flat</span>.
                    </p>
                    <p className="text-[10px] text-[#6E5D53] mt-0.5">
                      Yesterday, 6:15 PM
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-[#2D1F1A] border-b border-[#F8F5EE] pb-3">
                  <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Amit Verma sent you a message.
                    </p>
                    <p className="text-[10px] text-[#6E5D53] mt-0.5">
                      Yesterday, 5:40 PM
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-[#2D1F1A] border-b border-[#F8F5EE] pb-3">
                  <div className="w-7 h-7 bg-red-100 text-red-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">You saved a new property.</p>
                    <p className="text-[10px] text-[#6E5D53] mt-0.5">
                      09 May 2025, 8:20 PM
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-[#2D1F1A]">
                  <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Your document has been verified.
                    </p>
                    <p className="text-[10px] text-[#6E5D53] mt-0.5">
                      09 May 2025, 11:10 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & HELP CARDS */}
            <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
              <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                Quick Actions
              </h2>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl hover:bg-[#F2ECE1] cursor-pointer flex flex-col items-center justify-center gap-1.5">
                  <Search className="w-4 h-4 text-[#2D1F1A]" />
                  <span className="text-[10px] font-bold text-[#2D1F1A]">
                    Search Properties
                  </span>
                </div>
                <div className="p-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl hover:bg-[#F2ECE1] cursor-pointer flex flex-col items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#2D1F1A]" />
                  <span className="text-[10px] font-bold text-[#2D1F1A]">
                    Book Visit
                  </span>
                </div>
                <div className="p-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl hover:bg-[#F2ECE1] cursor-pointer flex flex-col items-center justify-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#2D1F1A]" />
                  <span className="text-[10px] font-bold text-[#2D1F1A]">
                    Messages
                  </span>
                </div>
                <div className="p-3 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl hover:bg-[#F2ECE1] cursor-pointer flex flex-col items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2D1F1A]" />
                  <span className="text-[10px] font-bold text-[#2D1F1A]">
                    My Documents
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#EFE6D8] p-5 rounded-3xl border border-[#E3D9CC] space-y-2">
              <h4 className="text-xs font-bold text-[#2D1F1A]">Need Help?</h4>
              <p className="text-[11px] text-[#6E5D53]">
                Our support team is here to assist you.
              </p>
              <Link
                to="#"
                className="inline-flex items-center justify-between w-full p-3 bg-white border border-[#E3D9CC] rounded-xl text-xs font-bold text-[#2D1F1A] hover:bg-[#F8F5EE] transition-all"
              >
                <span>Contact Support</span>
                <ChevronRight className="w-4 h-4 text-[#C5924E]" />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: SAVED PROPERTIES CAROUSEL/GRID */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3D9CC] pb-4">
            <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
              Saved Properties
            </h2>
            <Link
              to="#"
              className="text-xs font-bold text-[#C5924E] hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] overflow-hidden flex flex-col justify-between group cursor-pointer">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80"
                  alt="Property"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[#2D1F1A] shadow-sm hover:bg-white">
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-[#2D1F1A]">
                  Luxury Apartment
                </h4>
                <p className="text-xs text-[#6E5D53]">Koramangala, Bangalore</p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-bold text-[#2D1F1A]">
                    ₹22,000{" "}
                    <span className="text-[10px] text-[#6E5D53] font-normal">
                      / month
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC] text-[11px] text-[#6E5D53]">
                  <span>2 BHK • 1200 sq.ft</span>
                  <span className="flex items-center gap-1 text-[#2D1F1A] font-bold">
                    <Star className="w-3.5 h-3.5 text-[#C5924E] fill-current" />{" "}
                    4.8
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] overflow-hidden flex flex-col justify-between group cursor-pointer">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80"
                  alt="Property"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[#2D1F1A] shadow-sm hover:bg-white">
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-[#2D1F1A]">
                  Cozy 1BHK Flat
                </h4>
                <p className="text-xs text-[#6E5D53]">Indiranagar, Bangalore</p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-bold text-[#2D1F1A]">
                    ₹15,000{" "}
                    <span className="text-[10px] text-[#6E5D53] font-normal">
                      / month
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC] text-[11px] text-[#6E5D53]">
                  <span>1 BHK • 650 sq.ft</span>
                  <span className="flex items-center gap-1 text-[#2D1F1A] font-bold">
                    <Star className="w-3.5 h-3.5 text-[#C5924E] fill-current" />{" "}
                    4.6
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] overflow-hidden flex flex-col justify-between group cursor-pointer">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80"
                  alt="Property"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[#2D1F1A] shadow-sm hover:bg-white">
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-[#2D1F1A]">
                  Spacious Home
                </h4>
                <p className="text-xs text-[#6E5D53]">Whitefield, Bangalore</p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-bold text-[#2D1F1A]">
                    ₹28,000{" "}
                    <span className="text-[10px] text-[#6E5D53] font-normal">
                      / month
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC] text-[11px] text-[#6E5D53]">
                  <span>3 BHK • 1600 sq.ft</span>
                  <span className="flex items-center gap-1 text-[#2D1F1A] font-bold">
                    <Star className="w-3.5 h-3.5 text-[#C5924E] fill-current" />{" "}
                    4.9
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC] overflow-hidden flex flex-col justify-between group cursor-pointer">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
                  alt="Property"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[#2D1F1A] shadow-sm hover:bg-white">
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-[#2D1F1A]">
                  Premium House
                </h4>
                <p className="text-xs text-[#6E5D53]">HSR Layout, Bangalore</p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-bold text-[#2D1F1A]">
                    ₹45,000{" "}
                    <span className="text-[10px] text-[#6E5D53] font-normal">
                      / month
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC] text-[11px] text-[#6E5D53]">
                  <span>4 BHK • 2500 sq.ft</span>
                  <span className="flex items-center gap-1 text-[#2D1F1A] font-bold">
                    <Star className="w-3.5 h-3.5 text-[#C5924E] fill-current" />{" "}
                    4.9
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

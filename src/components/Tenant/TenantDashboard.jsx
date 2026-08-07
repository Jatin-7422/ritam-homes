import React from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TenantDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F5EE] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
              Welcome back, Alex 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
              Here is what's happening with your rental applications and home
              stay.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all self-start sm:self-auto"
          >
            <Search className="w-4 h-4 text-[#C5924E]" />
            Find New Homes
          </Link>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#C5924E] rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Next Rent Due
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">₹24,500</h3>
              <p className="text-[11px] text-[#C5924E] font-medium mt-0.5">
                Due on 5th Aug
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#2D1F1A] rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Active Lease
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">1 Active</h3>
              <p className="text-[11px] text-green-6-600 font-medium mt-0.5">
                Greenfield Residency
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#C5924E] rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Saved Homes
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">
                12 Properties
              </h3>
              <p className="text-[11px] text-[#6E5D53] mt-0.5">2 price drops</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#2D1F1A] rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Applications
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">2 Pending</h3>
              <p className="text-[11px] text-[#6E5D53] mt-0.5">
                Under verification
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Active Rental & Applications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Property Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E3D9CC] pb-4">
                <h2 className="text-lg font-bold text-[#2D1F1A] flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#C5924E]" /> Current Stay
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Active Lease
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80"
                  alt="Property"
                  className="w-full sm:w-36 h-28 object-cover rounded-xl"
                />
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-[#2D1F1A]">
                    Greenfield Heights - Flat 4B
                  </h3>
                  <p className="text-xs text-[#6E5D53]">
                    Indiranagar, Bengaluru
                  </p>
                  <p className="text-xs font-semibold text-[#2D1F1A] pt-1">
                    Owner: <span className="text-[#6E5D53]">Rajesh Sharma</span>
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button className="px-4 py-1.5 bg-[#2D1F1A] text-white text-xs font-semibold rounded-lg hover:bg-[#3E2E27]">
                      Pay Rent
                    </button>
                    <button className="px-4 py-1.5 border border-[#D5C9B8] text-[#2D1F1A] text-xs font-semibold rounded-lg hover:bg-[#F6F2EA]">
                      Raise Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Trackers */}
            <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#2D1F1A]">
                Submitted Applications
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]">
                  <div>
                    <h4 className="text-sm font-bold text-[#2D1F1A]">
                      Urban Nest Apartments
                    </h4>
                    <p className="text-xs text-[#6E5D53]">
                      Koramangala • ₹32,000/mo
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> Under Review
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Notifications & Reminders */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#2D1F1A] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C5924E]" /> Recent Updates
              </h2>
              <ul className="space-y-3">
                <li className="flex gap-3 text-xs text-[#57463D] border-b border-[#F6F2EA] pb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    Maintenance request #1024 marked as resolved by owner.
                  </span>
                </li>
                <li className="flex gap-3 text-xs text-[#57463D]">
                  <Clock className="w-4 h-4 text-[#C5924E] shrink-0 mt-0.5" />
                  <span>Rent invoice generated for August 2026.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import {
  Building,
  Users,
  TrendingUp,
  PlusCircle,
  Wrench,
  DollarSign,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F5EE] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
              Owner Console 🏢
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
              Manage listings, review tenant requests, and track your rental
              yields.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl hover:bg-[#3E2E27] transition-all self-start sm:self-auto cursor-pointer">
            <PlusCircle className="w-4 h-4 text-[#C5924E]" />
            List New Property
          </button>
        </div>

        {/* Owner Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#C5924E] rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Monthly Revenue
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">₹1,85,000</h3>
              <p className="text-[11px] text-green-600 font-medium mt-0.5">
                +12% vs last month
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#2D1F1A] rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Total Properties
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">6 Units</h3>
              <p className="text-[11px] text-[#6E5D53] mt-0.5">
                5 Rented / 1 Vacant
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#C5924E] rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Pending Applicants
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">4 Applicants</h3>
              <p className="text-[11px] text-[#C5924E] font-medium mt-0.5">
                Requires approval
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F6F2EA] text-[#2D1F1A] rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                Maintenance
              </p>
              <h3 className="text-xl font-bold text-[#2D1F1A]">
                2 Open Tickets
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                1 Urgent
              </p>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties Table / Cards */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-[#E3D9CC]">
              <h2 className="text-lg font-bold text-[#2D1F1A]">
                My Listings & Units
              </h2>
              <button className="text-xs font-bold text-[#C5924E] hover:underline">
                View All
              </button>
            </div>

            <div className="divide-y divide-[#F6F2EA]">
              {/* Unit Item 1 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F6F2EA] rounded-xl flex items-center justify-center font-bold text-[#2D1F1A]">
                    3A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2D1F1A]">
                      Sunrise Villa - 3BHK
                    </h4>
                    <p className="text-xs text-[#6E5D53]">
                      HSR Layout • Tenant: Rohan Mehta
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2D1F1A]">₹45,000/mo</p>
                  <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Paid for Aug
                  </span>
                </div>
              </div>

              {/* Unit Item 2 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F6F2EA] rounded-xl flex items-center justify-center font-bold text-[#2D1F1A]">
                    1B
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2D1F1A]">
                      Skyline Heights - 2BHK
                    </h4>
                    <p className="text-xs text-[#6E5D53]">
                      Indiranagar • Vacant
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2D1F1A]">₹28,000/mo</p>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Listed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Requests Side Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#2D1F1A]">
              Pending Approvals
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC] space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-[#2D1F1A]">
                    Priya Nair
                  </h4>
                  <p className="text-xs text-[#6E5D53]">
                    Applied for: Skyline Heights (1B)
                  </p>
                  <p className="text-[11px] text-[#C5924E] font-medium mt-1">
                    Credit Score: 780+ (Verified)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-green-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-800">
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button className="flex-1 py-1.5 bg-gray-200 text-[#2D1F1A] rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-300">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

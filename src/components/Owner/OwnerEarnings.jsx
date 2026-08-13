import React from "react";
import { IndianRupee, TrendingUp } from "lucide-react";

export default function OwnerEarnings() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          Earnings & Payouts 💰
        </h1>
        <p className="text-sm text-[#6E5D53] mt-1">
          Monitor your monthly rental collection, revenue history, and payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <span className="text-xs text-[#6E5D53] font-bold">
            Total Earnings (This Month)
          </span>
          <div className="text-2xl font-serif font-bold text-[#2D1F1A] flex items-center">
            <IndianRupee className="w-5 h-5 text-[#C5924E]" /> 0
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <span className="text-xs text-[#6E5D53] font-bold">
            Pending Collections
          </span>
          <div className="text-2xl font-serif font-bold text-[#2D1F1A] flex items-center">
            <IndianRupee className="w-5 h-5 text-[#C5924E]" /> 0
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-2">
          <span className="text-xs text-[#6E5D53] font-bold">
            Lifetime Revenue
          </span>
          <div className="text-2xl font-serif font-bold text-[#2D1F1A] flex items-center">
            <IndianRupee className="w-5 h-5 text-[#C5924E]" /> 0
          </div>
        </div>
      </div>
    </div>
  );
}

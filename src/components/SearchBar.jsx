import React from "react";
import {
  Search,
  MapPin,
  Home as HomeIcon,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function SearchBar() {
  return (
    <section className="max-w-7xl mx-auto px-8 mb-10">
      <div className="bg-[#EFEAE1] p-3 rounded-2xl border border-[#D5C9B8] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <div className="bg-white p-3 rounded-xl border border-[#E2D9CC]">
          <label className="text-[9px] text-[#6E5D53] font-extrabold uppercase tracking-wider block">
            Location
          </label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#6E5D53]" />
            <input
              type="text"
              placeholder="Search location"
              className="bg-transparent text-xs w-full outline-none font-semibold text-[#2D1F1A] placeholder-[#9A8B80]"
            />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E2D9CC]">
          <label className="text-[9px] text-[#6E5D53] font-extrabold uppercase tracking-wider block">
            Property Type
          </label>
          <div className="flex items-center gap-2 mt-1">
            <HomeIcon className="w-3.5 h-3.5 text-[#6E5D53]" />
            <select className="bg-transparent text-xs w-full outline-none font-semibold text-[#2D1F1A]">
              <option>Any Type</option>
              <option>Apartment</option>
              <option>Independent House</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E2D9CC]">
          <label className="text-[9px] text-[#6E5D53] font-extrabold uppercase tracking-wider block">
            Budget
          </label>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="w-3.5 h-3.5 text-[#6E5D53]" />
            <select className="bg-transparent text-xs w-full outline-none font-semibold text-[#2D1F1A]">
              <option>Any Budget</option>
              <option>₹10,000 - ₹20,000</option>
              <option>₹20,000 - ₹40,000</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E2D9CC]">
          <label className="text-[9px] text-[#6E5D53] font-extrabold uppercase tracking-wider block">
            Move-In Date
          </label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-[#6E5D53]" />
            <input
              type="text"
              placeholder="Select Date"
              className="bg-transparent text-xs w-full outline-none font-semibold text-[#2D1F1A] placeholder-[#9A8B80]"
            />
          </div>
        </div>

        <button
          style={{ backgroundColor: "#2D1F1A", color: "#FFFFFF" }}
          className="font-bold h-full py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-sm hover:opacity-90"
        >
          <Search className="w-4 h-4" /> Search Properties
        </button>
      </div>
    </section>
  );
}

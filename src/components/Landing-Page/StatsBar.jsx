import React from "react";

export default function StatsBar() {
  return (
    <section className="max-w-7xl mx-auto px-8 mb-12">
      <div className="bg-[#EFEAE1]/70 rounded-2xl p-6 border border-stone-300/60 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x-0 lg:divide-x divide-stone-300/80">
        <div>
          <div className="text-2xl font-black text-[#2D1F1A]">25K+</div>
          <div className="text-xs text-stone-600 mt-0.5 font-medium">
            Verified Properties
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D1F1A]">10K+</div>
          <div className="text-xs text-stone-600 mt-0.5 font-medium">
            Happy Tenants
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D1F1A]">98%</div>
          <div className="text-xs text-stone-600 mt-0.5 font-medium">
            Successful Bookings
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D1F1A]">500+</div>
          <div className="text-xs text-stone-600 mt-0.5 font-medium">
            Cities Covered
          </div>
        </div>
      </div>
    </section>
  );
}

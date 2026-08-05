import React from "react";
import { ChevronRight } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      text: "Ritam Homes made finding my new apartment so easy and safe. Love the verified listings!",
      name: "Ananya Mehta",
      city: "Bangalore",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "As an owner, listing on Ritam Homes brought me genuine tenants quickly. Great platform!",
      name: "Rajesh Kumar",
      city: "Pune",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "The slot booking feature is amazing! I could see the property and then decide easily.",
      name: "Vikram Singh",
      city: "Delhi",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#2D1F1A] flex items-center gap-1.5">
          What Our Users Say <span className="text-[#8C5E47]">✦</span>
        </h2>
        <a
          href="#reviews"
          className="flex items-center gap-1 text-xs font-bold text-[#2D1F1A] hover:underline"
        >
          View All Reviews <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="bg-[#EFEAE1]/80 p-6 rounded-2xl border border-[#E3D9CC] space-y-3 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-serif text-[#8C5E47] leading-none mb-2">
                “
              </div>
              <p className="text-xs text-[#57463D] leading-relaxed font-medium">
                {rev.text}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#E3D9CC]">
              <div className="flex items-center gap-2.5">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <h5 className="font-bold text-xs text-[#2D1F1A]">
                    {rev.name}
                  </h5>
                  <p className="text-[10px] text-[#6E5D53]">{rev.city}</p>
                </div>
              </div>
              <div className="flex text-amber-700 text-xs">★★★★★</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

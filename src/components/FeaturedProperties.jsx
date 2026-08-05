import React from "react";
import { Heart, ChevronRight } from "lucide-react";

export default function FeaturedProperties() {
  const properties = [
    {
      title: "Luxury Apartment",
      loc: "Koramangala, Bangalore",
      price: "₹22,000",
      specs: "2 BHK • 1200 sq.ft",
      rating: "4.8",
      img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Cozy 1BHK Flat",
      loc: "Indiranagar, Bangalore",
      price: "₹15,000",
      specs: "1 BHK • 650 sq.ft",
      rating: "4.6",
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Spacious Home",
      loc: "Whitefield, Bangalore",
      price: "₹28,000",
      specs: "3 BHK • 1600 sq.ft",
      rating: "4.9",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Premium House",
      loc: "HSR Layout, Bangalore",
      price: "₹45,000",
      specs: "4 BHK • 2500 sq.ft",
      rating: "4.9",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-10" id="properties">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#2D1F1A] flex items-center gap-1.5">
          Featured Properties <span className="text-[#8C5E47]">✦</span>
        </h2>
        <a
          href="#all"
          className="flex items-center gap-1 text-xs font-bold text-[#2D1F1A] hover:underline"
        >
          View All Properties <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#EFEAE1]/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#E3D9CC] shadow-sm hover:shadow-md transition-all group"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#2D1F1A] shadow-sm hover:bg-white">
                <Heart className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-1">
              <h3 className="font-bold text-sm text-[#2D1F1A]">{item.title}</h3>
              <p className="text-[11px] text-[#6E5D53] font-medium">
                {item.loc}
              </p>
              <div className="text-base font-black text-[#2D1F1A] pt-1">
                {item.price}{" "}
                <span className="text-[10px] font-normal text-[#6E5D53]">
                  /month
                </span>
              </div>

              <div className="pt-2 mt-2 border-t border-[#E3D9CC] flex items-center justify-between text-[10px] font-semibold text-[#57463D]">
                <span>{item.specs}</span>
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  ★ {item.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

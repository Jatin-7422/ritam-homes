import React from "react";
import { ChevronRight, Star, Quote } from "lucide-react";

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
    {
      text: "Zero brokerage and direct chats with owners saved me so much hassle and hidden fees.",
      name: "Sneha Sharma",
      city: "Mumbai",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    },
  ];

  // Double the array for a seamless infinite scroll loop effect
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-6xl mx-auto px-2">
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest text-[#8C5E47] uppercase block">
            TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F1A] font-serif flex items-center gap-2">
            What Our Users Say <span className="text-[#C5924E]">✦</span>
          </h2>
        </div>
        <a
          href="#reviews"
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#2D1F1A] hover:text-[#8C5E47] transition-colors"
        >
          View All Reviews <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 py-4">
          {marqueeReviews.map((rev, idx) => (
            <div
              key={idx}
              className="w-[300px] sm:w-[350px] bg-[#FAF7F2] hover:bg-[#F5F0E6] p-6 rounded-3xl border border-[#E3D9CC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#2D1F1A]/5 flex items-center justify-center text-[#8C5E47] group-hover:scale-110 transition-transform">
                    <Quote className="w-4 h-4" />
                  </div>
                  <div className="flex text-amber-600 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#57463D] leading-relaxed font-medium">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-5 mt-5 border-t border-[#E3D9CC]/60">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#C5924E]/30"
                />
                <div>
                  <h5 className="font-extrabold text-xs text-[#2D1F1A] font-serif">
                    {rev.name}
                  </h5>
                  <p className="text-[10px] font-semibold text-[#8C5E47] uppercase tracking-wider">
                    {rev.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailwind Custom Keyframes for Marquee (Add this to your CSS config or global styles if not already present) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
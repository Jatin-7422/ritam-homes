import React, { useState, useEffect } from "react";
import Navbar from "./components/Landing-Page/Navbar";
import Hero from "./components/Landing-Page/Hero";
import SearchBar from "./components/Landing-Page/SearchBar";
import StatsBar from "./components/Landing-Page/StatsBar";
import FeaturedProperties from "./components/Landing-Page/FeaturedProperties";
import WhyChooseUs from "./components/Landing-Page/WhyChooseUs";
import HowItWorks from "./components/Landing-Page/HowItWorks";
import Testimonials from "./components/Landing-Page/Testimonials";
import Footer from "./components/Landing-Page/Footer";
import AboutUs from "./components/Landing-Page/AboutUs";

// Import your logo for the preloader
import logo from "./assets/newlogo.png";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Display preloader for 1.5 seconds, then trigger fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      // 2. Remove preloader from DOM after 500ms fade animation finishes
      setTimeout(() => setLoading(false), 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 🌟 Smooth Loading Screen */}
      {loading && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F6F2EA] transition-opacity duration-500 ease-in-out ${
            fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-5 animate-pulse">
            <img
              src={logo}
              alt="Ritam Homes"
              className="h-14 md:h-16 w-auto object-contain"
            />
            {/* Animated Loading Dots */}
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#2D1F1A] animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#C5924E] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#2D1F1A] animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 🏠 Main Landing Page */}
      <div className="min-h-screen bg-[#F8F5EE] text-[#1E293B] font-sans">
        <Navbar />
        <Hero />
        <SearchBar />
        <StatsBar />
        <FeaturedProperties />
        <WhyChooseUs />
        <HowItWorks />
        <AboutUs />
        <Testimonials />
        <Footer />
      </div>
    </>
  );
}

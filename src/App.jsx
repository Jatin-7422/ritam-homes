import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Layout Components
import Navbar from "./components/Landing-Page/Navbar";
import Footer from "./components/Landing-Page/Footer";

// Landing Page Components
import Hero from "./components/Landing-Page/Hero";
import SearchBar from "./components/Landing-Page/SearchBar";
import StatsBar from "./components/Landing-Page/StatsBar";
import FeaturedProperties from "./components/Landing-Page/FeaturedProperties";
import WhyChooseUs from "./components/Landing-Page/WhyChooseUs";
import HowItWorks from "./components/Landing-Page/HowItWorks";
import Testimonials from "./components/Landing-Page/Testimonials";
import AboutUs from "./components/Landing-Page/AboutUs";
import Login from "./components/Login/Login";
import ContactUs from "./components/ContactUs/ContactUs";
import TenantDashboard from "./components/Tenant/TenantDashboard";
import OwnerDashboard from "./components/Owner/OwnerDashboard";
import Signup from "./components/Login/Signup";

// Analytics
import { Analytics } from "@vercel/analytics/react";

// Logo
import logo from "./assets/newlogo.png";

// 🏠 Home Component
function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <StatsBar />
      <FeaturedProperties />
      <WhyChooseUs />
      <HowItWorks />
      <AboutUs />
      <Testimonials />
    </>
  );
}

// 🔄 Inner App Component (Listens to Route Navigation)
function AppContent() {
  const location = useLocation(); // Detects route changes
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Reset state to show preloader immediately when route changes
    setLoading(true);
    setFadeOut(false);

    // 2. Display loader for 800ms on navigation, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 400); // 400ms fade animation
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]); // Runs every time pathname changes!

  return (
    <>
      {/* 🌟 Smooth Loading Screen */}
      {loading && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F6F2EA] transition-opacity duration-400 ease-in-out ${
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

      {/* 🏠 Main App Structure */}
      <div className="min-h-screen bg-[#F8F5EE] text-[#1E293B] font-sans flex flex-col justify-between">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tenant-dashboard" element={<TenantDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>

        <Footer />
        <Analytics />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

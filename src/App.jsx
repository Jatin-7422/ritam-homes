import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import StatsBar from "./components/StatsBar";
import FeaturedProperties from "./components/FeaturedProperties";
import WhyChooseUs from "./components/WhyChooseUs";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";

export default function App() {
  return (
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
  );
}

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

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
import NewProperty from "./components/Owner/NewProperty";

// Analytics
import { Analytics } from "@vercel/analytics/react";

// Logo
import logo from "./assets/newlogo.png";

function ProtectedRoute({ children, allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        const role = session.user?.user_metadata?.role || "tenant";
        setUserRole(role);
      } catch (err) {
        console.error("Auth verification error:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in as the wrong role, show an explicit warning message
  if (allowedRole && userRole !== allowedRole) {
    const currentRoleName = userRole === "owner" ? "Owner" : "Tenant";
    const targetRoleName = allowedRole === "owner" ? "Owner" : "Tenant";
    const correctDashboard =
      userRole === "owner" ? "/owner-dashboard" : "/tenant-dashboard";

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#EADBCE] text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#2D1F1A]">
              Access Restricted
            </h2>
            <p className="text-xs text-[#6E5D53] leading-relaxed">
              You are logged in as a{" "}
              <span className="font-bold text-[#2D1F1A] uppercase">
                {currentRoleName}
              </span>
              . You are not supposed to access the{" "}
              <span className="font-bold text-[#2D1F1A] uppercase">
                {targetRoleName}
              </span>{" "}
              dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to={correctDashboard}
              className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Go to Your {currentRoleName} Dashboard</span>
            </Link>

            <Link
              to="/login"
              onClick={async () => await supabase.auth.signOut()}
              className="w-full py-3 bg-[#FAF7F2] hover:bg-[#F0E6D8] border border-[#EADBCE] text-[#6E5D53] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Log out & Go Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

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

// 🔄 Inner App Component (Listens to real OAuth redirects & syncs selected role)
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if URL has incoming OAuth tokens/code from Google provider
    const checkOAuthReturn = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      if (hash.includes("access_token") || search.includes("code=")) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Check if user selected a specific role tab right before clicking Google login
          const intendedRole = localStorage.getItem("oauth_intended_role");
          let userRole = session.user?.user_metadata?.role || "tenant";

          // If they explicitly selected a different role tab, update their metadata in Supabase
          if (intendedRole && intendedRole !== userRole) {
            const { data: updateData } = await supabase.auth.updateUser({
              data: { role: intendedRole },
            });
            userRole = updateData?.user?.user_metadata?.role || intendedRole;
            localStorage.removeItem("oauth_intended_role");
          }

          // Clear URL parameters to prevent looping/lingering tokens
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );

          if (userRole === "owner") {
            navigate("/owner-dashboard", { replace: true });
          } else {
            navigate("/tenant-dashboard", { replace: true });
          }
        }
      }
    };

    checkOAuthReturn();
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    setFadeOut(false);

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 400);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
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

      {/* Main Container handles smooth route layout transitions */}
      <div
        className={`min-h-screen bg-[#F8F5EE] text-[#1E293B] font-sans flex flex-col justify-between transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
      >
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/owner-properties" element={<NewProperty />} />

            {/* 🛡️ Protected Tenant Dashboard */}
            <Route
              path="/tenant-dashboard"
              element={
                <ProtectedRoute allowedRole="tenant">
                  <TenantDashboard />
                </ProtectedRoute>
              }
            />

            {/* 🛡️ Protected Owner Dashboard */}
            <Route
              path="/owner-dashboard"
              element={
                <ProtectedRoute allowedRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
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

import React, { useState, useEffect, createContext, useContext } from "react";
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
import { Loader2, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

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
import OwnerOverview from "./components/Owner/OwnerOverview";
import Signup from "./components/Login/Signup";
import NewProperty from "./components/Owner/NewProperty";
import OwnerProperties from "./components/Owner/owner_properties";
import OwnerPropertyDetails from "./components/Owner/OwnerPropertyDetails";
import OwnerBookings from "./components/Owner/OwnerBookings";
import OwnerEarnings from "./components/Owner/OwnerEarnings";
import OwnerSettings from "./components/Owner/OwnerSettings";
import Messages from "./components/Messages";

// Owner Components ("Coming Soon" modules)
import OwnerReviews from "./components/Owner/OwnerReviews";
import OwnerDocuments from "./components/Owner/OwnerDocuments";

// Tenant Components
import TenantOverview from "./components/Tenant/TenantOverview";
import ExploreProperty from "./components/Tenant/ExploreProperty";
import TenantMessageSimulator from "./components/Tenant/TenantMessageSimulator";
import TenantPropertyDetails from "./components/Tenant/TenantPropertyDetails";
import SavedProperties from "./components/Tenant/TenantSaved"; 
import TenantDocuments from "./components/Tenant/TenantDocument"; 
import TenantBookings from "./components/Tenant/TenantBookings";

// Tenant Components (Defined locally if files don't exist yet)

function TenantSettings() {
  return <div className="p-8 text-xl font-bold">Tenant Settings</div>;
}

// Analytics
import { Analytics } from "@vercel/analytics/react";

// Logo
import logo from "./assets/newlogo.png";

// ==========================================
// 🌐 GLOBAL APP CONTEXT & PROVIDER
// ==========================================
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    fullName: "Owner",
    email: "",
    phone: "",
    businessName: "Master Properties",
    role: "owner",
    memberSince: "",
    location: "Bangalore, Karnataka, India",
    isVerified: true,
  });

  const [preferences, setPreferences] = useState({
    theme: localStorage.getItem("dashboard_theme") || "Light Warm",
    currency: "INR (₹)",
    language: localStorage.getItem("dashboard_lang") || "English",
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    localStorage.setItem("dashboard_theme", preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    localStorage.setItem("dashboard_lang", preferences.language);
  }, [preferences.language]);

  useEffect(() => {
    const fetchSessionUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const rawName =
          metadata.full_name ||
          metadata.name ||
          session.user.email?.split("@")[0] ||
          "Owner";
        const formattedName =
          rawName.charAt(0).toUpperCase() + rawName.slice(1);

        setUserInfo((prev) => ({
          ...prev,
          fullName: formattedName,
          email: session.user.email || "",
          phone: metadata.phone || "",
          role: metadata.role || "owner",
        }));
      }
    };
    fetchSessionUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        userInfo,
        setUserInfo,
        preferences,
        setPreferences,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ==========================================
// 🛡️ PROTECTED ROUTE
// ==========================================
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
      <div className="min-h-screen w-full bg-[#F8F5EE] text-[#1E293B] font-sans flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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

// 🔄 Inner App Layout
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const { preferences, toastMessage } = useContext(AppContext);
  const isDarkTheme =
    preferences.theme === "Dark Mode" || preferences.theme === "Dark";

  useEffect(() => {
    const checkOAuthReturn = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      if (hash.includes("access_token") || search.includes("code=")) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const intendedRole = localStorage.getItem("oauth_intended_role");
          let userRole = session.user?.user_metadata?.role || "tenant";

          if (intendedRole && intendedRole !== userRole) {
            const { data: updateData } = await supabase.auth.updateUser({
              data: { role: intendedRole },
            });
            userRole = updateData?.user?.user_metadata?.role || intendedRole;
            localStorage.removeItem("oauth_intended_role");
          }

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

  const isDashboardRoute =
    location.pathname === "/owner-dashboard" ||
    location.pathname.startsWith("/owner-dashboard/") ||
    location.pathname === "/owner-properties" ||
    location.pathname === "/owner-bookings" ||
    location.pathname === "/owner-earnings" ||
    location.pathname === "/owner-settings" ||
    location.pathname === "/add-property" ||
    location.pathname === "/messages" ||
    location.pathname === "/tenant-dashboard" ||
    location.pathname.startsWith("/tenant-dashboard/");

  return (
    <div
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 overflow-x-hidden ${
        isDarkTheme ? "bg-[#1A120B] text-white" : "bg-[#F8F5EE] text-[#1E293B]"
      }`}
    >
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#C5924E] text-xs font-bold flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {!isDashboardRoute && <Navbar />}

      <main className="flex-grow flex flex-col w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Owner Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute allowedRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="/owner-dashboard" element={<OwnerOverview />} />
            <Route path="/owner-properties" element={<OwnerProperties />} />
            <Route
              path="/owner-dashboard/property/:id"
              element={<OwnerPropertyDetails />}
            />
            <Route path="/owner-dashboard/reviews" element={<OwnerReviews />} />
            <Route
              path="/owner-dashboard/documents"
              element={<OwnerDocuments />}
            />
            <Route path="/add-property" element={<NewProperty />} />
            <Route path="/owner-bookings" element={<OwnerBookings />} />
            <Route path="/owner-earnings" element={<OwnerEarnings />} />
            <Route path="/owner-settings" element={<OwnerSettings />} />
            <Route path="/messages" element={<Messages />} />
          </Route>

          {/* Tenant Dashboard Routes */}
          <Route
            path="/tenant-dashboard"
            element={
              <ProtectedRoute allowedRole="tenant">
                <TenantDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<TenantOverview />} />
            <Route path="explore" element={<ExploreProperty />} />
            <Route path="messages" element={<TenantMessageSimulator />} />
            <Route path="bookings" element={<TenantBookings />} />
            <Route path="saved-properties" element={<SavedProperties />} />
            <Route path="saved" element={<SavedProperties />} />
            <Route path="documents" element={<TenantDocuments />} />
            <Route path="settings" element={<TenantSettings />} />
            <Route path="property/:id" element={<TenantPropertyDetails />} />
          </Route>
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}
      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}

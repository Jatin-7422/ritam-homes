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
import { Loader2, ShieldAlert, ArrowLeft, CheckCircle2, User, Phone, Building } from "lucide-react";

// Layout Components
import Navbar from "./components/Landing-Page/Navbar";
import Footer from "./components/Landing-Page/Footer";

// Landing Page Components
import Hero from "./components/Landing-Page/Hero";
import SearchBar from "./components/Landing-Page/SearchBar";
import FeaturedProperties from "./components/Landing-Page/FeaturedProperties";
import WhyChooseUs from "./components/Landing-Page/WhyChooseUs";
import HowItWorks from "./components/Landing-Page/HowItWorks";
import AboutUs from "./components/Landing-Page/AboutUs";
import Login from "./components/Login/Login";
import ContactUs from "./components/ContactUs/ContactUs";
import TenantDashboard from "./components/Tenant/TenantDashboard";
import OwnerDashboard from "./components/Owner/OwnerDashboard";
import OwnerOverview from "./components/Owner/OwnerOverview";

import NewProperty from "./components/Owner/NewProperty";
import OwnerProperties from "./components/Owner/owner_properties";
import OwnerPropertyDetails from "./components/Owner/OwnerPropertyDetails";
import OwnerEditProperty from "./components/Owner/EditProperty";
import OwnerBookings from "./components/Owner/OwnerBookings";
import OwnerEarnings from "./components/Owner/OwnerEarnings";
import Settings from './components/Settings';
import OwnerTenants from "./components/Owner/OwnerTenants";

// Message Imports
import OwnerMessages from "./components/Owner/OwnerMessages";
import TenantMessages from "./components/Tenant/TenantMessages";

// Admin Component & Sub-dashboards
import AdminLayout from "./components/Admin/AdminLayout";
import AdminOverview from "./components/Admin/AdminOverview";
import TenantsManagement from "./components/Admin/tenants";
import OwnersManagement from "./components/Admin/owner";
import PropertiesManagement from "./components/Admin/properties";

// Owner Components
import OwnerDocuments from "./components/Owner/OwnerDocuments";

// Tenant Components
import TenantOverview from "./components/Tenant/TenantOverview";
import ExploreProperty from "./components/Tenant/ExploreProperty";
import TenantPropertyDetails from "./components/Tenant/TenantPropertyDetails";
import SavedProperties from "./components/Tenant/TenantSaved";
import TenantDocuments from "./components/Tenant/TenantDocument";
import TenantBookings from "./components/Tenant/TenantBookings";

// Analytics & Logo
import { Analytics } from "@vercel/analytics/react";
import logo from "./assets/newlogo.png";

// ==========================================
// 🌐 GLOBAL APP CONTEXT & PROVIDER
// ==========================================
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    fullName: "User",
    email: "",
    phone: "Not provided",
    businessName: "Ritam Homes",
    role: "tenant",
    memberSince: "N/A",
    location: "India",
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
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && session.user) {
          const user = session.user;
          const metadata = user.user_metadata || {};

          const rawName =
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "User";
          const formattedName =
            rawName.charAt(0).toUpperCase() + rawName.slice(1);

          const createdAt = user.created_at
            ? new Date(user.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "N/A";

          setUserInfo((prev) => ({
            ...prev,
            fullName: formattedName,
            email: user.email || "",
            phone: metadata.phone || metadata.phone_number || prev.phone,
            businessName:
              metadata.business_name || metadata.company || prev.businessName,
            role: metadata.role || prev.role,
            location: metadata.location || prev.location,
            memberSince: createdAt,
          }));
        }
      } catch (err) {
        console.error("Error loading session user in AppProvider:", err.message);
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
// 🛠️ COMPLETE PROFILE PAGE VIEW (Standalone)
// ==========================================
function CompleteProfileView() {
  const [sessionUser, setSessionUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setSessionUser(session.user);
        const meta = session.user.user_metadata || {};
        setFullName(meta.full_name || meta.name || "");
      } else {
        navigate("/login", { replace: true });
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionUser) return;
    setSubmitting(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          role: role,
          business_name: businessName,
        },
      });
      if (authError) throw authError;

      const { error: dbError } = await supabase.from("profiles").upsert({
        id: sessionUser.id,
        full_name: fullName,
        email: sessionUser.email,
        phone: phone,
        role: role,
        business_name: businessName,
        updated_at: new Date(),
      });

      if (dbError) console.error("Database sync warning:", dbError.message);

      if (role === "owner") {
        navigate("/owner-dashboard", { replace: true });
      } else {
        navigate("/tenant-dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Failed to complete profile:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1511] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1511] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1e1511] text-[#F8F5EE] rounded-3xl p-8 shadow-2xl border border-[#C5924E]/40 space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Complete Your Profile</h2>
          <p className="text-xs text-[#D1C2B4] mt-1.5 leading-relaxed">
            Please provide a few extra details to finish setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#D1C2B4] mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#C5924E]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#443128] bg-[#2C201A] text-white text-xs font-medium placeholder-[#8C766B] focus:outline-none focus:ring-2 focus:ring-[#C5924E] focus:border-transparent transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D1C2B4] mb-1.5">Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4 h-4 text-[#C5924E]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#443128] bg-[#2C201A] text-white text-xs font-medium placeholder-[#8C766B] focus:outline-none focus:ring-2 focus:ring-[#C5924E] focus:border-transparent transition-all"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D1C2B4] mb-1.5">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  role === "tenant"
                    ? "bg-[#C5924E] text-white border-[#C5924E] shadow-md shadow-[#C5924E]/20"
                    : "bg-[#2C201A] text-[#D1C2B4] border-[#443128] hover:border-[#C5924E]/50"
                }`}
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  role === "owner"
                    ? "bg-[#C5924E] text-white border-[#C5924E] shadow-md shadow-[#C5924E]/20"
                    : "bg-[#2C201A] text-[#D1C2B4] border-[#443128] hover:border-[#C5924E]/50"
                }`}
              >
                Property Owner
              </button>
            </div>
          </div>

          {role === "owner" && (
            <div>
              <label className="block text-xs font-semibold text-[#D1C2B4] mb-1.5">Business / Agency Name</label>
              <div className="relative flex items-center">
                <Building className="absolute left-3.5 w-4 h-4 text-[#C5924E]" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#443128] bg-[#2C201A] text-white text-xs font-medium placeholder-[#8C766B] focus:outline-none focus:ring-2 focus:ring-[#C5924E] focus:border-transparent transition-all"
                  placeholder="Enter business name"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 bg-[#C5924E] hover:bg-[#b07e3d] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <CheckCircle2 className="w-4 h-4 text-white" />}
            <span>Save & Continue</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 🔄 DEDICATED OAUTH / AUTH CALLBACK HANDLER
// ==========================================
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.replace("#", "?"));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          const intendedRole = localStorage.getItem("oauth_intended_role");
          let userRole = session.user?.user_metadata?.role;

          if (intendedRole && intendedRole !== "pending" && intendedRole !== userRole) {
            const { data: updateData } = await supabase.auth.updateUser({
              data: { role: intendedRole },
            });
            userRole = updateData?.user?.user_metadata?.role || intendedRole;
            localStorage.removeItem("oauth_intended_role");
          }

          if (!userRole) {
            navigate("/option", { replace: true });
            return;
          }

          if (userRole === "owner") {
            navigate("/owner-dashboard", { replace: true });
          } else if (userRole === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/tenant-dashboard", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Error during auth callback processing:", err.message);
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#3b2219] flex flex-col items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-3" />
      <p className="text-xs font-semibold tracking-wide text-[#e6d5c3]">
        Completing authentication...
      </p>
    </div>
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

  let isAuthorized = false;

  if (!allowedRole) {
    isAuthorized = true;
  } else if (allowedRole === "admin") {
    isAuthorized = userRole === "admin";
  } else if (Array.isArray(allowedRole)) {
    isAuthorized = allowedRole.includes(userRole) || userRole === "owner";
  } else {
    isAuthorized = userRole === allowedRole || userRole === "owner" || allowedRole === "tenant";
  }

  if (allowedRole && !isAuthorized) {
    const currentRoleName = userRole ? userRole.toUpperCase() : "USER";
    
    let correctDashboard = "/tenant-dashboard";
    if (userRole === "owner") correctDashboard = "/owner-dashboard";
    if (userRole === "admin") correctDashboard = "/admin-dashboard";

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
              <span className="font-bold text-[#2D1F1A]">
                {currentRoleName}
              </span>
              . You are not authorized to view this page.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to={correctDashboard}
              className="w-full py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Go to Your Dashboard</span>
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
      <FeaturedProperties />
      <WhyChooseUs />
      <HowItWorks />
      <AboutUs />
    </>
  );
}

// 🔄 Inner App Layout
function AppLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const { preferences, toastMessage } = useContext(AppContext);
  const isDarkTheme =
    preferences.theme === "Dark Mode" || preferences.theme === "Dark";

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
    location.pathname === "/login" ||
    location.pathname === "/option" ||
    location.pathname === "/auth/callback" ||
    location.pathname === "/owner-dashboard" ||
    location.pathname.startsWith("/owner-dashboard/") ||
    location.pathname.startsWith("/owner/properties/edit/") || 
    location.pathname.startsWith("/edit-property/") || 
    location.pathname === "/owner-properties" ||
    location.pathname === "/owner-bookings" ||
    location.pathname === "/owner-earnings" ||
    location.pathname === "/owner-settings" ||
    location.pathname === "/add-property" ||
    location.pathname === "/messages" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname.startsWith("/admin-dashboard/") ||
    location.pathname.startsWith("/admin/") ||
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
          
          {/* Display standalone Complete Profile form directly on /option */}
          <Route path="/option" element={<CompleteProfileView />} />
          
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin Dashboard & Sub-routes */}
          <Route
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin-dashboard" element={<AdminOverview />} />
            <Route path="/admin/tenants" element={<TenantsManagement />} />
            <Route path="/admin/owners" element={<OwnersManagement />} />
            <Route path="/admin/properties" element={<PropertiesManagement />} />
          </Route>

          {/* Owner Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute allowedRole={["owner", "tenant"]}>
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
            <Route
              path="/owner/properties/edit/:id"
              element={<OwnerEditProperty />}
            />
            <Route
              path="/edit-property/:id"
              element={<OwnerEditProperty />}
            />
            <Route path="/owner-dashboard/tenants" element={<OwnerTenants />} />
            <Route
              path="/owner-dashboard/documents"
              element={<OwnerDocuments />}
            />
            <Route path="/add-property" element={<NewProperty />} />
            <Route path="/owner-bookings" element={<OwnerBookings />} />
            <Route path="/owner-earnings" element={<OwnerEarnings />} />
            <Route path="/owner-settings" element={<Settings />} />
            
            <Route path="/messages" element={<OwnerMessages />} />
            <Route path="/owner-dashboard/messages" element={<OwnerMessages />} />
          </Route>

          {/* Tenant Dashboard Routes */}
          <Route
            path="/tenant-dashboard"
            element={
              <ProtectedRoute allowedRole={["tenant", "owner"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<TenantOverview />} />
            <Route path="explore" element={<ExploreProperty />} />
            <Route path="messages" element={<TenantMessages />} />
            <Route path="bookings" element={<TenantBookings />} />
            <Route path="saved-properties" element={<SavedProperties />} />
            <Route path="saved" element={<SavedProperties />} />
            <Route path="documents" element={<TenantDocuments />} />
            <Route path="settings" element={<Settings />} />
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
import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Adjust path to your supabaseClient
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

export default function ProtectedRoute({ children, allowedRole }) {
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
        // Extract role securely from user metadata
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

  // Check if role authorization passes (supports string or array of roles)
  const isAuthorized = Array.isArray(allowedRole)
    ? allowedRole.includes(userRole)
    : userRole === allowedRole;

  // If logged in as the wrong role, show the restriction warning message
  if (allowedRole && !isAuthorized) {
    const currentRoleName = userRole ? userRole.toUpperCase() : "USER";
    
    // Determine appropriate dashboard route based on user's actual role
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
              <span className="font-bold text-[#2D1F1A] uppercase">
                {currentRoleName}
              </span>
              . You are not authorized to access this section.
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
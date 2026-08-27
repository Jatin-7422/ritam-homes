import React, { useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AppContext } from "../../App";
import Sidebar from "./Sidebar";
import { Menu, Bell, Loader2 } from "lucide-react";

export default function AdminLayout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { userInfo, preferences } = useContext(AppContext);
  const isDarkTheme = preferences?.theme === "Dark Mode" || preferences?.theme === "Dark";
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 600);
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col md:flex-row relative transition-colors duration-300 ${
        isDarkTheme ? "bg-[#1A120B] text-white" : "bg-[#F8F5EE] text-[#2D1F1A]"
      } ${isLoggingOut ? "opacity-90" : "opacity-100"}`}
    >
      {/* Logout Overlay Loader */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-[#2D1F1A]/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5924E] mb-4" />
          <p className="font-serif font-bold text-xl">Logging out securely...</p>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Modular Sidebar Component */}
      <Sidebar
        userInfo={userInfo}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className={`w-full px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between ${isDarkTheme ? "bg-[#1A120B]" : "bg-[#F8F5EE]"}`}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`md:hidden p-2 border rounded-xl transition-colors cursor-pointer ${
              isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto">
            <button
              className={`relative p-2.5 border rounded-full transition-colors cursor-pointer ${
                isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Outlet rendering Overview, Tenants, Owners, or Properties */}
        <div className="flex-1 p-6 sm:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
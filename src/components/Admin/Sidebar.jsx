import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoWhite from "../../assets/whitelogo.png";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  UserCheck,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar({ userInfo, isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const location = useLocation();

  const adminNavItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Tenant Verification", icon: Users, path: "/admin/tenants" },
    { name: "Owners Management", icon: UserCheck, path: "/admin/owners" },
    { name: "Properties Database", icon: Building2, path: "/admin/properties" },
  ];

  return (
    <aside
      className={`w-72 bg-[#2D1F1A] text-[#D1C4B9] flex flex-col justify-between flex-shrink-0 z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo & Close Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/15 flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img src={logoWhite} alt="Ritam Homes" className="h-8 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-[#D1C4B9] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mx-3 my-3 p-3 bg-[#221A17] border border-[#3A2E2A] rounded-xl flex items-center gap-3 shadow-inner flex-shrink-0">
          {userInfo?.avatar ? (
            <img src={userInfo.avatar} alt={userInfo.fullName} className="w-9 h-9 rounded-full object-cover border border-[#C5924E]/50" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#C5924E] flex items-center justify-center text-[#2D1F1A] font-bold text-sm shadow">
              {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "A"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-xs truncate">{userInfo?.fullName || "Admin User"}</h4>
            <p className="text-[10px] text-[#9E8B7F] truncate">Master Administrator</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md w-fit border text-emerald-400 bg-emerald-950/40 border-emerald-800/40">
              <ShieldCheck className="w-3 h-3" /> System Verified
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 text-xs font-medium overflow-y-auto flex-1 custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? "bg-[#C5924E] text-[#2D1F1A] font-bold shadow-lg" : "hover:bg-[#3A2E2A] text-[#D1C4B9]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#2D1F1A]" : "text-[#9E8B7F]"}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-[#221A17]/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
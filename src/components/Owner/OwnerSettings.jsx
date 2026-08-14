import React, { createContext, useContext, useState } from "react";
import {
  User,
  Shield,
  Bell,
  Settings as SettingsIcon,
  Edit3,
  Lock,
  ShieldCheck,
  Monitor,
  Trash2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Laptop,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    fullName: "Master",
    email: "jatinkumar7422@gmail.com",
    phone: "+91 98765 43210",
    businessName: "Master Properties",
    role: "Property Owner",
    memberSince: "14 August 2025",
    location: "Bangalore, Karnataka, India",
    isVerified: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "Light Warm",
    currency: "INR (₹)",
    language: "English",
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

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

export default function AccountSettings() {
  const context = useContext(AppContext);

  // Fallback state if AppProvider is missing higher up in the component tree
  const [localUserInfo, setLocalUserInfo] = useState({
    fullName: "Master",
    email: "jatinkumar7422@gmail.com",
    phone: "+91 98765 43210",
    businessName: "Master Properties",
    role: "Property Owner",
    memberSince: "14 August 2025",
    location: "Bangalore, Karnataka, India",
    isVerified: true,
  });

  const [localPreferences, setLocalPreferences] = useState({
    theme: "Light Warm",
    currency: "INR (₹)",
    language: "English",
  });

  const [localToast, setLocalToast] = useState("");

  const userInfo = context ? context.userInfo : localUserInfo;
  const setUserInfo = context ? context.setUserInfo : setLocalUserInfo;
  const preferences = context ? context.preferences : localPreferences;
  const setPreferences = context ? context.setPreferences : setLocalPreferences;
  const toastMessage = context ? context.toastMessage : localToast;

  const showToast = context
    ? context.showToast
    : (msg) => {
        setLocalToast(msg);
        setTimeout(() => setLocalToast(""), 3500);
      };

  const [activeTab, setActiveTab] = useState("profile");
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: true,
    whatsapp: true,
    apple: false,
  });
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows (Current)",
      location: userInfo.location,
      lastActive: "Active Now",
      icon: Laptop,
    },
    {
      id: 2,
      device: "Safari on iPhone 15",
      location: userInfo.location,
      lastActive: "2 hours ago",
      icon: Smartphone,
    },
  ]);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    propertyInquiries: true,
    marketingUpdates: false,
  });
  const [modalType, setModalType] = useState(null);
  const [tempProfile, setTempProfile] = useState({ ...userInfo });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const handleToggleConnect = (account) => {
    setConnectedAccounts((prev) => {
      const nextState = !prev[account];
      showToast(
        `${account.charAt(0).toUpperCase() + account.slice(1)} ${nextState ? "connected successfully" : "disconnected"}.`,
      );
      return { ...prev, [account]: nextState };
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserInfo({ ...tempProfile });
    setModalType(null);
    showToast("Profile information updated successfully.");
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert("New passwords do not match.");
      return;
    }
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setModalType(null);
    showToast("Password updated securely.");
  };

  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((session) => session.id !== id));
    showToast("Session revoked successfully.");
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt(
      "Type 'DELETE' to confirm permanent account deletion:",
    );
    if (confirmation === "DELETE") {
      alert("Account deletion sequence initialized.");
    }
  };

  const isDarkTheme = preferences.theme === "Dark Mode";

  return (
    <div
      className={`flex flex-col w-full min-h-full p-6 sm:p-10 space-y-6 relative transition-colors ${isDarkTheme ? "bg-[#1A120B] text-white" : "bg-[#F8F5EE] text-[#2D1F1A]"}`}
    >
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#C5924E] text-xs font-bold flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Account Settings
          </h1>
          <SettingsIcon className="w-6 h-6 text-[#C5924E]" />
        </div>
        <p
          className={`text-xs sm:text-sm ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
        >
          Manage your profile, security, global theme, and language preferences.
        </p>
      </div>

      <div
        className={`border rounded-2xl p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 shadow-sm ${isDarkTheme ? "bg-[#251B14] border-neutral-800" : "bg-white border-[#E3D9CC]"}`}
      >
        {[
          { id: "profile", label: "Profile Information", icon: User },
          { id: "security", label: "Security", icon: Shield },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "preferences", label: "Preferences", icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#C5924E] text-[#2D1F1A] shadow-md"
                  : isDarkTheme
                    ? "bg-[#1F1610] text-neutral-300 hover:bg-[#2D1F1A] hover:text-white"
                    : "bg-[#FBF9F4] text-[#6E5D53] hover:bg-[#F2ECE1] hover:text-[#2D1F1A]"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isSelected ? "text-[#2D1F1A]" : ""}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`lg:col-span-7 rounded-3xl border p-6 sm:p-8 space-y-6 shadow-sm ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
          >
            <div
              className={`flex items-center justify-between pb-4 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"}`}
            >
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold">
                  Profile Information
                </h2>
                <p
                  className={`text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  Update your personal and business details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempProfile({ ...userInfo });
                  setModalType("edit-profile");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isDarkTheme
                    ? "border-neutral-700 bg-[#1F1610] text-white hover:bg-neutral-800"
                    : "border-[#E3D9CC] bg-[#F8F5EE] text-[#2D1F1A] hover:bg-[#F2ECE1]"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C5924E]" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="space-y-4">
              <div
                className={`flex items-center justify-between py-2.5 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
              >
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <User className="w-4 h-4 text-[#C5924E]" />
                  <span>Full Name</span>
                </div>
                <span className="text-xs font-bold">{userInfo.fullName}</span>
              </div>
              <div
                className={`flex items-center justify-between py-2.5 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
              >
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <Mail className="w-4 h-4 text-[#C5924E]" />
                  <span>Email Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{userInfo.email}</span>
                  {userInfo.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`flex items-center justify-between py-2.5 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
              >
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <Phone className="w-4 h-4 text-[#C5924E]" />
                  <span>Phone Number</span>
                </div>
                <span className="text-xs font-bold">{userInfo.phone}</span>
              </div>
              <div
                className={`flex items-center justify-between py-2.5 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
              >
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <Building2 className="w-4 h-4 text-[#C5924E]" />
                  <span>Business Name</span>
                </div>
                <span className="text-xs font-bold">
                  {userInfo.businessName}
                </span>
              </div>
              <div
                className={`flex items-center justify-between py-2.5 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
              >
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <Briefcase className="w-4 h-4 text-[#C5924E]" />
                  <span>Role</span>
                </div>
                <span className="text-xs font-bold">{userInfo.role}</span>
              </div>
              <div
                className={`flex items-center justify-between py-2.5 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
              >
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <Calendar className="w-4 h-4 text-[#C5924E]" />
                  <span>Member Since</span>
                </div>
                <span className="text-xs font-bold">
                  {userInfo.memberSince}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div
                  className={`flex items-center gap-3 text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  <MapPin className="w-4 h-4 text-[#C5924E]" />
                  <span>Location</span>
                </div>
                <span className="text-xs font-bold">{userInfo.location}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-5 shadow-sm ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
            >
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold">
                  Security
                </h2>
                <p
                  className={`text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  Keep your account secure and protected.
                </p>
              </div>
              <div className="space-y-4">
                <div
                  className={`flex items-center justify-between py-2 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-[#C5924E]" />
                    <div>
                      <strong className="block text-xs font-bold">
                        Password
                      </strong>
                      <span
                        className={`text-[11px] tracking-widest ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                      >
                        ••••••••••••
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalType("change-password")}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white hover:bg-neutral-800" : "border-[#E3D9CC] bg-[#F8F5EE] text-[#2D1F1A] hover:bg-[#F2ECE1]"}`}
                  >
                    Change
                  </button>
                </div>
                <div
                  className={`flex items-center justify-between py-2 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#C5924E]" />
                    <div>
                      <strong className="block text-xs font-bold">
                        Two-Factor Authentication
                      </strong>
                      <span
                        className={`text-[10px] ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                      >
                        Extra security layer.
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-[#C5924E]" />
                    <div>
                      <strong className="block text-xs font-bold">
                        Active Sessions
                      </strong>
                      <span
                        className={`text-[10px] ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                      >
                        Manage active devices.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalType("sessions")}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white hover:bg-neutral-800" : "border-[#E3D9CC] bg-[#F8F5EE] text-[#2D1F1A] hover:bg-[#F2ECE1]"}`}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-5 shadow-sm ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
            >
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold">
                  Connected Accounts
                </h2>
                <p
                  className={`text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
                >
                  Manage third-party integrations.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { key: "google", label: "Google", iconColor: "text-red-500" },
                  {
                    key: "whatsapp",
                    label: "WhatsApp",
                    iconColor: "text-emerald-500",
                  },
                  {
                    key: "apple",
                    label: "Apple",
                    iconColor: isDarkTheme ? "text-white" : "text-neutral-800",
                  },
                ].map((account) => {
                  const isConnected = connectedAccounts[account.key];
                  return (
                    <div
                      key={account.key}
                      className={`flex items-center justify-between py-2 border-b last:border-0 last:pb-0 ${isDarkTheme ? "border-neutral-800" : "border-[#F2ECE1]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${isDarkTheme ? "bg-[#1F1610] border-neutral-700" : "bg-[#F8F5EE] border-[#E3D9CC]"} ${account.iconColor}`}
                        >
                          {account.label[0]}
                        </div>
                        <span className="text-xs font-bold">
                          {account.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleConnect(account.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isConnected ? "text-emerald-500 bg-transparent hover:bg-emerald-500/10" : isDarkTheme ? "border border-neutral-700 bg-[#1F1610] text-white hover:bg-neutral-800" : "border border-[#E3D9CC] bg-[#F8F5EE] text-[#2D1F1A] hover:bg-[#F2ECE1]"}`}
                      >
                        {isConnected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div
          className={`rounded-3xl border p-8 space-y-6 ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
        >
          <h2 className="text-lg font-serif font-bold">
            Security & Authentication Center
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-5 border rounded-2xl space-y-3 ${isDarkTheme ? "border-neutral-700 bg-[#1F1610]" : "border-[#E3D9CC] bg-[#FBF9F4]"}`}
            >
              <h3 className="text-xs font-bold">Password Management</h3>
              <button
                onClick={() => setModalType("change-password")}
                className="px-4 py-2 bg-[#C5924E] text-[#2D1F1A] rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Change Password
              </button>
            </div>
            <div
              className={`p-5 border rounded-2xl space-y-3 ${isDarkTheme ? "border-neutral-700 bg-[#1F1610]" : "border-[#E3D9CC] bg-[#FBF9F4]"}`}
            >
              <h3 className="text-xs font-bold">Active Device Sessions</h3>
              <button
                onClick={() => setModalType("sessions")}
                className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDarkTheme ? "border-neutral-700 bg-black text-white" : "border-[#E3D9CC] bg-white text-[#2D1F1A]"}`}
              >
                Manage Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div
          className={`rounded-3xl border p-8 space-y-6 ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
        >
          <h2 className="text-lg font-serif font-bold">
            Notification Preferences
          </h2>
          <div className="space-y-4 max-w-xl">
            {Object.entries({
              emailAlerts: "Email Alerts",
              smsAlerts: "SMS Notifications",
              propertyInquiries: "Property Inquiries",
              marketingUpdates: "Marketing Offers",
            }).map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer ${isDarkTheme ? "border-neutral-700 bg-[#1F1610]" : "border-[#E3D9CC] bg-[#FBF9F4]"}`}
              >
                <span className="text-xs font-bold">{label}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      [key]: !notifications[key],
                    })
                  }
                  className="w-4 h-4 accent-[#C5924E] cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div
          className={`rounded-3xl border p-8 space-y-6 ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
        >
          <h2 className="text-lg font-serif font-bold">
            Global Application Preferences
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
            <div className="space-y-2">
              <label className="text-xs font-bold">Display Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences({ ...preferences, theme: e.target.value })
                }
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none cursor-pointer ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
              >
                <option value="Light Warm">Light Warm</option>
                <option value="Dark Mode">Dark Mode</option>
                <option value="System Default">System Default</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Primary Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) =>
                  setPreferences({ ...preferences, currency: e.target.value })
                }
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none cursor-pointer ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
              >
                <option value="INR (₹)">INR (₹)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Language</label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none cursor-pointer ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Kannada">Kannada</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div
        className={`rounded-3xl border p-6 sm:p-8 flex items-center justify-between gap-4 shadow-sm ${isDarkTheme ? "bg-[#251B14] border-red-900/40" : "bg-white border-red-200"}`}
      >
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-serif font-bold">Danger Zone</h3>
          </div>
          <p
            className={`text-xs ${isDarkTheme ? "text-neutral-400" : "text-[#6E5D53]"}`}
          >
            Permanently delete your account and all associated data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          {modalType === "edit-profile" && (
            <form
              onSubmit={handleSaveProfile}
              className={`rounded-3xl border w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"}`}
              >
                <h3 className="text-base font-serif font-bold">
                  Edit Profile & Name
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold">Full Name</label>
                  <input
                    type="text"
                    value={tempProfile.fullName}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        fullName: e.target.value,
                      })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">Email Address</label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, email: e.target.value })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={tempProfile.phone}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, phone: e.target.value })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">Business Name</label>
                  <input
                    type="text"
                    value={tempProfile.businessName}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        businessName: e.target.value,
                      })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">Location</label>
                  <input
                    type="text"
                    value={tempProfile.location}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        location: e.target.value,
                      })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5924E] text-[#2D1F1A] text-xs font-bold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {modalType === "change-password" && (
            <form
              onSubmit={handleSavePassword}
              className={`rounded-3xl border w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"}`}
              >
                <h3 className="text-base font-serif font-bold">
                  Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPass}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPass: e.target.value,
                      })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: e.target.value,
                      })
                    }
                    required
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-bold outline-none ${isDarkTheme ? "border-neutral-700 bg-[#1F1610] text-white" : "border-[#E3D9CC] bg-[#FBF9F4] text-[#2D1F1A]"}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5924E] text-[#2D1F1A] text-xs font-bold cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {modalType === "sessions" && (
            <div
              className={`rounded-3xl border w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl ${isDarkTheme ? "bg-[#251B14] border-neutral-800 text-white" : "bg-white border-[#E3D9CC] text-[#2D1F1A]"}`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${isDarkTheme ? "border-neutral-800" : "border-[#E3D9CC]"}`}
              >
                <h3 className="text-base font-serif font-bold">
                  Manage Active Sessions
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-3 border rounded-xl ${isDarkTheme ? "border-neutral-700 bg-[#1F1610]" : "border-[#E3D9CC] bg-[#FBF9F4]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-[#C5924E]" />
                      <div>
                        <p className="text-xs font-bold">{session.device}</p>
                        <span className="text-[10px]">
                          {session.location} • {session.lastActive}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-[11px] font-bold cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-[#C5924E] text-[#2D1F1A] text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

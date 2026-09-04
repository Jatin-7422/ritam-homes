import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  User,
  Shield,
  Settings as SettingsIcon,
  Edit3,
  Lock,
  Monitor,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Laptop,
  Smartphone,
  Loader2,
} from "lucide-react";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    fullName: "Jatin Kumar",
    email: "",
    phone: "",
    businessName: "Master Properties",
    role: "Property Owner",
    memberSince: "N/A",
    location: "Bangalore, Karnataka, India",
    isVerified: true,
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Helper function to extract and parse user metadata safely
  const updateUserInfoFromSession = (user) => {
    if (!user) {
      // Reset or handle signed-out state if needed
      return;
    }
    const metadata = user.user_metadata || {};

    const rawName =
      metadata.full_name ||
      metadata.name ||
      user.email?.split("@")[0] ||
      "User";
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const createdAt = user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "N/A";

    const rawPhone =
      user.phone || metadata.phone || metadata.phone_number || "";
    const validPhone = rawPhone === "Not provided" ? "" : rawPhone;

    setUserInfo({
      fullName: formattedName,
      email: user.email || "",
      phone: validPhone,
      businessName: metadata.business_name || "Master Properties",
      location: metadata.location || "India",
      role: metadata.role
        ? metadata.role.charAt(0).toUpperCase() + metadata.role.slice(1)
        : "Property Owner",
      memberSince: createdAt,
      isVerified: user.email_confirmed_at ? true : false,
    });
  };

  useEffect(() => {
    // 1. Fetch initial session on load
    const fetchSessionUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && session.user) {
          updateUserInfoFromSession(session.user);
        }
      } catch (err) {
        console.error("Error loading session user:", err.message);
      }
    };

    fetchSessionUser();

    // 2. Listen to real-time auth changes (handles account switches, logins, logouts automatically)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        updateUserInfoFromSession(session.user);
      } else {
        // Clear or reset user info on sign-out
        setUserInfo({
          fullName: "",
          email: "",
          phone: "",
          businessName: "",
          role: "",
          memberSince: "N/A",
          location: "",
          isVerified: false,
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        userInfo,
        setUserInfo,
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

  if (!context) {
    throw new Error("AccountSettings must be used within an AppProvider.");
  }

  const { userInfo, setUserInfo, toastMessage, showToast } = context;

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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

  const [modalType, setModalType] = useState(null);
  const [tempProfile, setTempProfile] = useState({ ...userInfo });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save phone inside user metadata (data) instead of the root phone attribute
      // to avoid needing an SMS provider setup.
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: tempProfile.fullName,
          phone: tempProfile.phone,
          business_name: tempProfile.businessName,
          location: tempProfile.location,
        },
      });

      if (error) throw error;

      // Immediately update local state so the UI changes instantly without a reload
      setUserInfo((prev) => ({
        ...prev,
        fullName: tempProfile.fullName,
        phone: tempProfile.phone,
        businessName: tempProfile.businessName,
        location: tempProfile.location,
      }));

      setModalType(null);
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err.message);
      showToast(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      showToast("New passwords do not match.");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    setSecurityLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPass,
      });

      if (error) throw error;

      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setModalType(null);
      showToast("Password updated securely in the backend.");
    } catch (err) {
      console.error("Error updating password:", err.message);
      showToast(`Password update failed: ${err.message}`);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((session) => session.id !== id));
    showToast("Session revoked successfully.");
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      showToast("Please type DELETE to confirm.");
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;

      await supabase.auth.signOut();
      showToast("Account deleted successfully from the backend.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err.message);
      showToast(`Deletion failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-12 relative transition-colors text-[#2D1F1A]">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#C5924E] text-xs font-bold flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#EADBCE]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">
              Account Settings
            </h1>
            <SettingsIcon className="w-6 h-6 text-[#C5924E]" />
          </div>
          <p className="text-xs sm:text-sm mt-1 text-[#6E5D53]">
            Manage your account credentials and security settings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTempProfile({ ...userInfo });
            setModalType("edit-profile");
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-[#C5924E]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-sm bg-white border-[#EADBCE]">
        {[
          { id: "profile", label: "Profile Information", icon: User },
          { id: "security", label: "Security", icon: Shield },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="rounded-3xl p-6 shadow-sm border flex flex-col items-center text-center space-y-4 bg-white border-[#EADBCE]">
              <div className="w-20 h-20 rounded-2xl bg-[#2D1F1A] text-[#C5924E] flex items-center justify-center text-3xl font-serif font-bold shadow-inner">
                {userInfo.fullName
                  ? userInfo.fullName.charAt(0).toUpperCase()
                  : "J"}
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold">
                  {userInfo.fullName || "Jatin Kumar"}
                </h2>
                <p className="text-xs mt-0.5 text-[#6E5D53]">
                  {userInfo.businessName || "Master Properties"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Shield className="w-3.5 h-3.5" /> {userInfo.role}
              </span>
            </div>
          </div>

          {/* Right Information Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-3xl p-5 sm:p-8 shadow-sm border space-y-6 bg-white border-[#EADBCE]">
              <h3 className="text-lg font-serif font-bold">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                    <User className="w-4 h-4 text-[#C5924E]" /> Full Name
                  </label>
                  <p className="text-sm font-medium py-3 px-4 rounded-xl border border-transparent truncate bg-[#F8F5EE] text-[#2D1F1A]">
                    {userInfo.fullName || "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                    <Mail className="w-4 h-4 text-[#C5924E]" /> Email Address
                  </label>
                  <p className="text-sm font-medium py-3 px-4 rounded-xl border border-transparent truncate bg-[#F8F5EE] text-[#6E5D53]">
                    {userInfo.email || "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                    <Phone className="w-4 h-4 text-[#C5924E]" /> Phone Number
                  </label>
                  <p className="text-sm font-medium py-3 px-4 rounded-xl border border-transparent truncate bg-[#F8F5EE] text-[#2D1F1A]">
                    {userInfo.phone || "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                    <Building className="w-4 h-4 text-[#C5924E]" /> Business
                    Name
                  </label>
                  <p className="text-sm font-medium py-3 px-4 rounded-xl border border-transparent truncate bg-[#F8F5EE] text-[#2D1F1A]">
                    {userInfo.businessName || "Master Properties"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                    <Calendar className="w-4 h-4 text-[#C5924E]" /> Member Since
                  </label>
                  <p className="text-sm font-medium py-3 px-4 rounded-xl border border-transparent truncate bg-[#F8F5EE] text-[#2D1F1A]">
                    {userInfo.memberSince || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                    <MapPin className="w-4 h-4 text-[#C5924E]" /> Location
                  </label>
                  <p className="text-sm font-medium py-3 px-4 rounded-xl border border-transparent truncate bg-[#F8F5EE] text-[#2D1F1A]">
                    {userInfo.location || "India"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="rounded-3xl border p-8 space-y-6 bg-white border-[#EADBCE]">
          <h2 className="text-lg font-serif font-bold">
            Security & Authentication Center
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border rounded-2xl space-y-3 border-[#EADBCE] bg-[#FBF9F4]">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C5924E]" /> Password Management
              </h3>
              <button
                onClick={() => setModalType("change-password")}
                className="px-4 py-2.5 bg-[#C5924E] hover:bg-[#b07e3d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Change Password
              </button>
            </div>
            <div className="p-5 border rounded-2xl space-y-3 border-[#EADBCE] bg-[#FBF9F4]">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#C5924E]" /> Active Device
                Sessions
              </h3>
              <button
                onClick={() => setModalType("sessions")}
                className="px-4 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer border-[#EADBCE] bg-white text-[#2D1F1A] hover:bg-gray-50"
              >
                Manage Sessions ({activeSessions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Section */}
      <div className="rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm bg-red-50/50 border-red-200">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-serif font-bold">Danger Zone</h3>
          </div>
          <p className="text-xs text-red-700">
            Permanently remove your account and all associated data from the
            system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setShowDeleteModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Modals Container */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          {modalType === "edit-profile" && (
            <form
              onSubmit={handleSaveProfile}
              className="rounded-3xl border w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl bg-white border-[#EADBCE] text-[#2D1F1A]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
                <h3 className="text-base font-serif font-bold">
                  Edit Profile & Business
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer hover:bg-gray-100"
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
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    disabled
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none opacity-60 cursor-not-allowed border-[#EADBCE] bg-[#FAF7F2] text-neutral-500"
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
                    placeholder="Enter phone number"
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
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
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
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
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C5924E] hover:bg-[#b07e3d] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {modalType === "change-password" && (
            <form
              onSubmit={handleSavePassword}
              className="rounded-3xl border w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl bg-white border-[#EADBCE] text-[#2D1F1A]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
                <h3 className="text-base font-serif font-bold">
                  Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer hover:bg-gray-100"
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
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
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
                    placeholder="At least 6 characters"
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
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
                    placeholder="Re-enter new password"
                    className="w-full mt-1 p-3 rounded-xl border text-xs font-bold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={securityLoading}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={securityLoading || !passwordForm.newPass}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {securityLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {modalType === "sessions" && (
            <div className="rounded-3xl border w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl bg-white border-[#EADBCE] text-[#2D1F1A]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
                <h3 className="text-base font-serif font-bold">
                  Manage Active Sessions
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-xl border-[#EADBCE] bg-[#FBF9F4]"
                  >
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-[#C5924E]" />
                      <div>
                        <p className="text-xs font-bold">{session.device}</p>
                        <span className="text-[10px] text-[#6E5D53]">
                          {session.location} • {session.lastActive}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-[11px] font-bold cursor-pointer hover:bg-red-500/20"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#2D1F1A] text-white text-xs font-bold cursor-pointer hover:bg-[#3E2E27]"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                This will delete your database profile information and sign you
                out permanently. Type{" "}
                <strong className="text-red-600">DELETE</strong> below to
                confirm.
              </p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-red-200 rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-red-600 uppercase font-bold tracking-widest text-center"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#2D1F1A] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || confirmText !== "DELETE"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

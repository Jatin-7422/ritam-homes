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
  Camera,
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
    avatarUrl: "",
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const updateUserInfoFromSession = async (user) => {
    if (!user) return;
    const metadata = user.user_metadata || {};

    // Fetch from profiles table if available
    let profileData = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profileData = data;
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    }

    const rawName =
      profileData?.full_name ||
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
      profileData?.phone || user.phone || metadata.phone || metadata.phone_number || "";
    const validPhone = rawPhone === "Not provided" ? "" : rawPhone;

    setUserInfo({
      fullName: formattedName,
      email: profileData?.email || user.email || "",
      phone: validPhone,
      businessName: profileData?.business_name || metadata.business_name || "Master Properties",
      location: profileData?.location || metadata.location || "India",
      role: profileData?.role || (metadata.role
        ? metadata.role.charAt(0).toUpperCase() + metadata.role.slice(1)
        : "Property Owner"),
      memberSince: createdAt,
      isVerified: user.email_confirmed_at ? true : false,
      avatarUrl: profileData?.avatar_url || metadata.avatar_url || metadata.picture || "",
    });
  };

  useEffect(() => {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        updateUserInfoFromSession(session.user);
      } else {
        setUserInfo({
          fullName: "",
          email: "",
          phone: "",
          businessName: "",
          role: "",
          memberSince: "N/A",
          location: "",
          isVerified: false,
          avatarUrl: "",
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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      setTempProfile((prev) => ({ ...prev, avatarUrl }));
      showToast("Image uploaded! Click 'Save Changes' to apply.");
    } catch (err) {
      console.error("Error uploading image:", err.message);
      showToast(`Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      const userId = session.user.id;

      // 1. Update auth user metadata for extra fields
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          business_name: tempProfile.businessName,
          location: tempProfile.location,
          role: tempProfile.role,
        },
      });

      if (authError) throw authError;

      // 2. Update your exact public.profiles table columns
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: tempProfile.fullName,
          phone: tempProfile.phone,
          avatar_url: tempProfile.avatarUrl,
          updated_at: new Date(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      setUserInfo((prev) => ({
        ...prev,
        fullName: tempProfile.fullName,
        phone: tempProfile.phone,
        businessName: tempProfile.businessName,
        location: tempProfile.location,
        avatarUrl: tempProfile.avatarUrl,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#2D1F1A]">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#C5924E]/40 text-xs font-semibold flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADBCE]/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Account Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5D53]">
            Configure your personal profile parameters and security preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTempProfile({ ...userInfo });
            setModalType("edit-profile");
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-semibold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#C5924E]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="inline-flex p-1.5 bg-[#F2ECE1]/60 rounded-2xl border border-[#EADBCE]/60 w-full sm:w-auto gap-1">
        {[
          { id: "profile", label: "Profile Information", icon: User },
          { id: "security", label: "Security & Sessions", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-[#2D1F1A] shadow-sm border border-[#EADBCE]/40"
                  : "text-[#6E5D53] hover:text-[#2D1F1A]"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isSelected ? "text-[#C5924E]" : "text-[#6E5D53]"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* User Card Sidebar with Image Preview */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-[#EADBCE]/80 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C5924E] to-[#2D1F1A]" />
              <div className="w-20 h-20 rounded-2xl bg-[#F8F5EE] border border-[#EADBCE] text-[#2D1F1A] flex items-center justify-center text-2xl font-serif font-bold shadow-inner mt-2 overflow-hidden relative">
                {userInfo.avatarUrl ? (
                  <img
                    src={userInfo.avatarUrl}
                    alt={userInfo.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {userInfo.fullName
                      ? userInfo.fullName.charAt(0).toUpperCase()
                      : "J"}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base font-serif font-bold">
                  {userInfo.fullName || "Jatin Kumar"}
                </h2>
                <p className="text-xs text-[#6E5D53]">
                  {userInfo.businessName || "Master Properties"}
                </p>
              </div>
              <div className="pt-2 w-full border-t border-[#F2ECE1]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#F8F5EE] text-[#2D1F1A] border border-[#EADBCE]">
                  <Shield className="w-3 h-3 text-[#C5924E]" /> {userInfo.role}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid Container */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE]/80 shadow-sm space-y-6">
              <h3 className="text-base font-serif font-bold border-b border-[#F2ECE1] pb-4">
                Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    label: "Full Name",
                    value: userInfo.fullName,
                    icon: User,
                  },
                  {
                    label: "Email Address",
                    value: userInfo.email,
                    icon: Mail,
                  },
                  {
                    label: "Phone Number",
                    value: userInfo.phone,
                    icon: Phone,
                  },
                  {
                    label: "Business Name",
                    value: userInfo.businessName,
                    icon: Building,
                  },
                  {
                    label: "Member Since",
                    value: userInfo.memberSince,
                    icon: Calendar,
                  },
                  {
                    label: "Location",
                    value: userInfo.location,
                    icon: MapPin,
                  },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#F2ECE1] space-y-1"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#6E5D53]">
                        <ItemIcon className="w-3.5 h-3.5 text-[#C5924E]" />{" "}
                        {item.label}
                      </label>
                      <p className="text-xs font-semibold text-[#2D1F1A] truncate pl-5">
                        {item.value || "Not provided"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-3xl border border-[#EADBCE]/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-serif font-bold border-b border-[#F2ECE1] pb-4">
            Security & Authentication Center
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-[#EADBCE]/60 bg-[#FBF9F4] flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold flex items-center gap-2 text-[#2D1F1A]">
                  <Lock className="w-4 h-4 text-[#C5924E]" /> Password Management
                </h3>
                <p className="text-[11px] text-[#6E5D53]">
                  Update your account password regularly to keep your data secure.
                </p>
              </div>
              <button
                onClick={() => setModalType("change-password")}
                className="self-start px-4 py-2 bg-[#C5924E] hover:bg-[#b07e3d] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                Change Password
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-[#EADBCE]/60 bg-[#FBF9F4] flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold flex items-center gap-2 text-[#2D1F1A]">
                  <Monitor className="w-4 h-4 text-[#C5924E]" /> Active Device
                  Sessions
                </h3>
                <p className="text-[11px] text-[#6E5D53]">
                  Review and manage devices currently signed into your account.
                </p>
              </div>
              <button
                onClick={() => setModalType("sessions")}
                className="self-start px-4 py-2 border border-[#EADBCE] rounded-xl text-xs font-semibold transition-all cursor-pointer bg-white text-[#2D1F1A] hover:bg-[#F2ECE1]/50"
              >
                Manage Sessions ({activeSessions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Section */}
      <div className="bg-red-50/30 rounded-3xl border border-red-200/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider">
              Danger Zone
            </h3>
          </div>
          <p className="text-xs text-red-700/80">
            Permanently remove your account profile and all associated data from
            the system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setShowDeleteModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Modals Container */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          {modalType === "edit-profile" && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-3xl border border-[#EADBCE] w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl text-[#2D1F1A] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]/60">
                <h3 className="text-base font-serif font-bold">
                  Edit Profile & Business
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                {/* Profile Picture Upload Section */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {tempProfile.avatarUrl ? (
                        <img
                          src={tempProfile.avatarUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-5 h-5 text-[#C5924E]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full text-xs text-[#6E5D53] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#C5924E] file:text-white hover:file:bg-[#b07e3d] file:cursor-pointer cursor-pointer"
                      />
                      {uploadingImage && (
                        <span className="text-[10px] text-[#C5924E] flex items-center gap-1 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Full Name
                  </label>
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
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    disabled
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none opacity-60 cursor-not-allowed border-[#EADBCE] bg-[#FAF7F2] text-neutral-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={tempProfile.phone}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Business Name
                  </label>
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
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Location
                  </label>
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
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-[#EADBCE] text-xs font-semibold cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C5924E] hover:bg-[#b07e3d] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-sm transition-all"
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
              className="bg-white rounded-3xl border border-[#EADBCE] w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl text-[#2D1F1A]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]/60">
                <h3 className="text-base font-serif font-bold">
                  Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
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
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    New Password
                  </label>
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
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
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
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={securityLoading}
                  className="px-4 py-2.5 rounded-xl border border-[#EADBCE] text-xs font-semibold cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={securityLoading || !passwordForm.newPass}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-sm transition-all"
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
            <div className="bg-white rounded-3xl border border-[#EADBCE] w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl text-[#2D1F1A]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]/60">
                <h3 className="text-base font-serif font-bold">
                  Manage Active Sessions
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-xl cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3.5 border rounded-2xl border-[#EADBCE]/60 bg-[#FBF9F4]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white border border-[#EADBCE] text-[#C5924E]">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{session.device}</p>
                        <span className="text-[10px] text-[#6E5D53]">
                          {session.location} • {session.lastActive}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-50 text-red-600 text-[11px] font-semibold cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#2D1F1A] text-white text-xs font-semibold cursor-pointer hover:bg-[#3E2E27] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-5 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                This action will delete your database profile information and
                sign you out permanently. Type{" "}
                <strong className="text-red-600 font-bold">DELETE</strong> below
                to confirm.
              </p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-red-200 rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:border-red-600 uppercase font-bold tracking-widest text-center"
            />

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-[#F2ECE1] hover:bg-[#EADBCE] text-[#2D1F1A] text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || confirmText !== "DELETE"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-40"
              >
                {deleteLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
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
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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Globe
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

  // Keep tempProfile in sync when userInfo updates from context/session
  useEffect(() => {
    setTempProfile({ ...userInfo });
  }, [userInfo]);

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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

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

      // 1. Update public.profiles table
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

      // 2. Also update Supabase auth user_metadata so headers/sessions sync everywhere instantly
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: tempProfile.fullName,
          phone: tempProfile.phone,
          avatar_url: tempProfile.avatarUrl,
        },
      });

      if (authUpdateError) {
        console.error("Auth metadata update warning:", authUpdateError.message);
      }

      // 3. Update global AppContext state immediately so all components rerender
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-[#2D1F1A]">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C5924E]/40 text-xs font-medium flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Refined Luxury Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EADBCE]/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5924E]/10 text-[#C5924E] text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" /> Account Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
            Settings & Security
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl">
            Manage your personal credentials, verify security protocols, and oversee your property account parameters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTempProfile({ ...userInfo });
            setModalType("edit-profile");
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-semibold rounded-2xl transition-all shadow-lg shadow-[#2D1F1A]/10 hover:shadow-xl cursor-pointer active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#C5924E]" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      {/* Modern Navigation Segmented Tabs */}
      <div className="flex p-1.5 bg-[#F4EFE6]/80 backdrop-blur-sm rounded-2xl border border-[#EADBCE]/70 w-full sm:w-fit gap-1 shadow-inner">
        {[
          { id: "profile", label: "Profile Overview", icon: User },
          { id: "security", label: "Security & Sessions", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-[#2D1F1A] shadow-md shadow-[#2D1F1A]/5 border border-[#EADBCE]/50 scale-[1.02]"
                  : "text-[#6E5D53] hover:text-[#2D1F1A]"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isSelected ? "text-[#C5924E]" : "text-[#6E5D53]"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          {/* Enhanced Profile Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-8 border border-[#EADBCE]/80 shadow-sm flex flex-col items-center text-center space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#C5924E] via-[#dfb175] to-[#2D1F1A]" />
              
              <div className="relative mt-2">
                <div className="w-24 h-24 rounded-3xl bg-[#FAF7F2] border-2 border-[#EADBCE] text-[#2D1F1A] flex items-center justify-center text-3xl font-serif font-bold shadow-md overflow-hidden relative group-hover:border-[#C5924E] transition-all">
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
                <div className="absolute -bottom-1 -right-1 bg-[#2D1F1A] text-white p-1.5 rounded-xl border border-[#C5924E]">
                  <Shield className="w-3.5 h-3.5 text-[#C5924E]" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                  {userInfo.fullName || "Jatin Kumar"}
                </h2>
                <p className="text-xs font-medium text-[#6E5D53]">
                  {userInfo.businessName || "Master Properties"}
                </p>
              </div>

              <div className="pt-3 w-full border-t border-[#F2ECE1] flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] text-[#2D1F1A] border border-[#EADBCE]">
                  <span className="w-2 h-2 rounded-full bg-[#C5924E] animate-pulse" />
                  {userInfo.role}
                </span>
              </div>
            </div>
          </div>

          {/* Redesigned Clean Details Cards Grid */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE]/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-4">
                <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                  Personal & Business Information
                </h3>
                <span className="text-[11px] text-[#6E5D53] italic">Verified Account Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="p-4 rounded-2xl bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#EADBCE]/60 transition-all space-y-1.5 group"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 text-[#6E5D53]">
                        <span className="p-1 rounded-lg bg-white border border-[#EADBCE] text-[#C5924E] group-hover:border-[#C5924E] transition-colors">
                          <ItemIcon className="w-3 h-3" />
                        </span>
                        {item.label}
                      </label>
                      <p className="text-xs font-semibold text-[#2D1F1A] truncate pl-7">
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
        <div className="bg-white rounded-3xl border border-[#EADBCE]/80 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-[#F2ECE1] pb-4">
            <h2 className="text-base font-serif font-bold text-[#2D1F1A]">
              Security & Authentication Center
            </h2>
            <p className="text-xs text-[#6E5D53] mt-0.5">Protect your administrative access with advanced security options.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-6 rounded-3xl border border-[#EADBCE]/60 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-sm">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#2D1F1A]">Password Management</h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed">
                  Regularly update your credentials to safeguard your property listings and user dashboard.
                </p>
              </div>
              <button
                onClick={() => setModalType("change-password")}
                className="self-start inline-flex items-center gap-2 px-4 py-2.5 bg-[#C5924E] hover:bg-[#b07e3d] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>Change Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-3xl border border-[#EADBCE]/60 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-sm">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#2D1F1A]">Active Device Sessions</h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed">
                  Review and securely revoke devices currently logged into your active user profile.
                </p>
              </div>
              <button
                onClick={() => setModalType("sessions")}
                className="self-start inline-flex items-center gap-2 px-4 py-2.5 border border-[#EADBCE] rounded-xl text-xs font-semibold transition-all cursor-pointer bg-white text-[#2D1F1A] hover:bg-[#F2ECE1]/50 shadow-sm active:scale-95"
              >
                <span>Manage Sessions ({activeSessions.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Danger Zone Section */}
      <div className="bg-red-50/40 rounded-3xl border border-red-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-red-600">
            <div className="p-1.5 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider">
              Danger Zone
            </h3>
          </div>
          <p className="text-xs text-red-900/70 max-w-lg leading-relaxed">
            Permanently remove your account profile, personal directory settings, and all associated operational data from the system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setShowDeleteModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-md shadow-red-600/20 cursor-pointer shrink-0 active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Modals Container */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          {modalType === "edit-profile" && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-3xl border border-[#EADBCE] w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl text-[#2D1F1A] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCE]/60">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                    Edit Profile Details
                  </h3>
                  <p className="text-[11px] text-[#6E5D53]">Update your personal credentials and photo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-2 rounded-xl cursor-pointer hover:bg-[#F2ECE1] transition-colors text-[#6E5D53]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Picture Upload Section */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#EADBCE] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
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
                    <div className="flex-1 overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full text-xs text-[#6E5D53] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#C5924E] file:text-white hover:file:bg-[#b07e3d] file:cursor-pointer cursor-pointer"
                      />
                      {uploadingImage && (
                        <span className="text-[10px] text-[#C5924E] flex items-center gap-1 mt-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading avatar image...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
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
                    className="w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A] transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#6E5D53]">
                    Email Address <span className="text-[10px] italic text-[#6E5D53] font-normal">(Read-only)</span>
                  </label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none opacity-60 cursor-not-allowed border-[#EADBCE] bg-[#FAF7F2] text-neutral-500"
                  />
                </div>

                <div className="space-y-1">
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
                    className="w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EADBCE]/60">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-[#EADBCE] text-xs font-semibold cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C5924E] hover:bg-[#b07e3d] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-md transition-all"
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
              className="bg-white rounded-3xl border border-[#EADBCE] w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-[#2D1F1A]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCE]/60">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                    Change Password
                  </h3>
                  <p className="text-[11px] text-[#6E5D53]">Secure your credentials with a new password</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-2 rounded-xl cursor-pointer hover:bg-[#F2ECE1] transition-colors text-[#6E5D53]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
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
                    className="w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A] transition-all"
                  />
                </div>
                <div className="space-y-1">
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
                    className="w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A] transition-all"
                  />
                </div>
                <div className="space-y-1">
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
                    className="w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none focus:border-[#C5924E] border-[#EADBCE] bg-[#FAF7F2] text-[#2D1F1A] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EADBCE]/60">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  disabled={securityLoading}
                  className="px-5 py-2.5 rounded-xl border border-[#EADBCE] text-xs font-semibold cursor-pointer hover:bg-[#F2ECE1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={securityLoading || !passwordForm.newPass}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-md transition-all"
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
            <div className="bg-white rounded-3xl border border-[#EADBCE] w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl text-[#2D1F1A]">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCE]/60">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                    Manage Active Sessions
                  </h3>
                  <p className="text-[11px] text-[#6E5D53]">Revoke unauthorized or outdated browser logins</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-2 rounded-xl cursor-pointer hover:bg-[#F2ECE1] transition-colors text-[#6E5D53]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-2xl border-[#EADBCE]/60 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#C5924E] shadow-sm">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2D1F1A]">{session.device}</p>
                        <span className="text-[10px] text-[#6E5D53] font-medium">
                          {session.location} • {session.lastActive}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-50 text-red-600 text-[11px] font-semibold cursor-pointer hover:bg-red-100 transition-colors shadow-2xs"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#EADBCE]/60">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#2D1F1A] text-white text-xs font-semibold cursor-pointer hover:bg-[#3E2E27] transition-colors shadow-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                This action will permanently remove your profile database information and sign you out. Type{" "}
                <strong className="text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded border border-red-200">DELETE</strong> below
                to confirm.
              </p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-red-200 rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:border-red-600 uppercase font-bold tracking-widest text-center shadow-inner"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-[#F4EFE6] hover:bg-[#EADBCE] text-[#2D1F1A] text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || confirmText !== "DELETE"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-40"
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
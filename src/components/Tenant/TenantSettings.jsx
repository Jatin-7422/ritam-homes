import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { supabase } from "../../supabaseClient";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
  Building,
  Edit3,
  Check,
  Loader2,
  Lock,
  Bell,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

export default function TenantSettings() {
  const { userInfo, setUserInfo, showToast } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Profile form state
  const [formData, setFormData] = useState({
    fullName: userInfo.fullName || "",
    email: userInfo.email || "",
    phone: userInfo.phone || "",
    businessName: userInfo.businessName || "",
    location: userInfo.location || "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    marketingUpdates: true,
  });

  // Fetch actual member since date from Supabase Auth if missing
  useEffect(() => {
    async function fetchAuthDetails() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.created_at && !userInfo.memberSince) {
          const formattedDate = new Date(user.created_at).toLocaleDateString(
            "en-US",
            {
              month: "long",
              year: "numeric",
            },
          );
          setUserInfo((prev) => ({
            ...prev,
            memberSince: formattedDate,
          }));
        }
      } catch (err) {
        console.error("Error fetching user session metadata:", err);
      }
    }
    fetchAuthDetails();
  }, [userInfo.memberSince, setUserInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast("Notification preferences updated!");
      return updated;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          business_name: formData.businessName,
          location: formData.location,
        },
      });

      if (error) throw error;

      setUserInfo((prev) => ({
        ...prev,
        fullName: formData.fullName,
        phone: formData.phone,
        businessName: formData.businessName,
        location: formData.location,
      }));

      showToast("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.message);
      showToast("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    setSecurityLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      showToast("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Error updating password:", err.message);
      showToast("Failed to update password. Try again.");
    } finally {
      setSecurityLoading(false);
    }
  };

  // Functional Account Deletion Handler via Supabase RPC
  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      showToast("Please type DELETE to confirm.");
      return;
    }

    setDeleteLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc("delete_user_account");
      if (rpcError) throw rpcError;

      await supabase.auth.signOut();

      showToast("Account permanently deleted.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err.message);
      showToast("Failed to delete account. Please try again.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
            Manage your account credentials, security, and preferences.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#C5924E]" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-[#2D1F1A] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C5924E] hover:bg-[#b07e3d] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EADBCE] flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-[#2D1F1A] text-[#C5924E] flex items-center justify-center text-3xl font-serif font-bold shadow-inner">
              {userInfo.fullName
                ? userInfo.fullName.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2D1F1A]">
                {userInfo.fullName || "User"}
              </h2>
              <p className="text-xs text-[#6E5D53] mt-0.5">
                {userInfo.businessName || "Master Properties"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Shield className="w-3.5 h-3.5" /> Verified Renter
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EADBCE] space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C5924E]" /> Notification Settings
            </h3>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#6E5D53]">Email Alerts</span>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={() => handleNotificationToggle("emailAlerts")}
                  className="accent-[#C5924E] w-4 h-4 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#6E5D53]">SMS Alerts</span>
                <input
                  type="checkbox"
                  checked={notifications.smsAlerts}
                  onChange={() => handleNotificationToggle("smsAlerts")}
                  className="accent-[#C5924E] w-4 h-4 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#6E5D53]">Marketing Updates</span>
                <input
                  type="checkbox"
                  checked={notifications.marketingUpdates}
                  onChange={() => handleNotificationToggle("marketingUpdates")}
                  className="accent-[#C5924E] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Forms Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#EADBCE] space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C5924E]" /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#2D1F1A] py-3 px-4 bg-[#F8F5EE] rounded-xl border border-transparent truncate">
                    {userInfo.fullName || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C5924E]" /> Email Address
                </label>
                <p className="text-sm font-medium text-[#6E5D53] py-3 px-4 bg-[#F8F5EE] rounded-xl border border-transparent truncate">
                  {userInfo.email || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C5924E]" /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#2D1F1A] py-3 px-4 bg-[#F8F5EE] rounded-xl border border-transparent truncate">
                    {userInfo.phone || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C5924E]" /> Renter
                  Category / Company
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#2D1F1A] py-3 px-4 bg-[#F8F5EE] rounded-xl border border-transparent truncate">
                    {userInfo.businessName || "Master Properties"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5924E]" /> Member Since
                </label>
                <p className="text-sm font-medium text-[#2D1F1A] py-3 px-4 bg-[#F8F5EE] rounded-xl border border-transparent truncate">
                  {userInfo.memberSince || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C5924E]" /> Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#2D1F1A] py-3 px-4 bg-[#F8F5EE] rounded-xl border border-transparent truncate">
                    {userInfo.location || "India"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#EADBCE] space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C5924E]" /> Change Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={securityLoading || !passwordData.newPassword}
                className="px-5 py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {securityLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                ) : null}
                Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 rounded-3xl p-5 sm:p-8 shadow-sm border border-red-200 space-y-4">
            <h3 className="text-lg font-serif font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Danger Zone
            </h3>
            <p className="text-xs text-red-700">
              Permanently remove your account and all associated data from the
              database. This action cannot be undone.
            </p>
            <button
              onClick={() => {
                setConfirmText("");
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>
      </div>

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

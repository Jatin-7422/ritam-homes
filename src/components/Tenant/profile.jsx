import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  User, Mail, Phone, MapPin, Calendar, ShieldCheck,
  Edit3, Save, X, Loader2, CheckCircle2, Camera,
  Building2, Heart, Clock, Star,
} from "lucide-react";

export default function TenantProfile() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(false);
  const [toast, setToast]       = useState("");
  const [stats, setStats]       = useState({ visits: 0, saved: 0, bookings: 0 });

  const [profile, setProfile] = useState({
    full_name: "", email: "", phone: "", location: "",
    bio: "", avatar_url: "",
  });
  const [form, setForm] = useState({ ...profile });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;
      const meta = user.user_metadata || {};

      const profileData = {
        full_name:  meta.full_name || meta.name || user.email?.split("@")[0] || "",
        email:      user.email || "",
        phone:      meta.phone || "",
        location:   meta.location || "",
        bio:        meta.bio || "",
        avatar_url: meta.avatar_url || "",
      };

      setProfile(profileData);
      setForm(profileData);

      // Fetch tenant stats
      const { data: visits }   = await supabase.from("visit_requests").select("id").eq("tenant_email", user.email);
      const { data: accepted } = await supabase.from("visit_requests").select("id").eq("tenant_email", user.email).eq("status", "Accepted");

      setStats({
        visits:   (visits || []).length,
        saved:    0,
        bookings: (accepted || []).length,
      });
    } catch (err) {
      console.error("Profile fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { showToast("Name is required."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.full_name,
          phone:     form.phone,
          location:  form.location,
          bio:       form.bio,
        },
      });
      if (error) throw error;
      setProfile({ ...form });
      setEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Profile save error:", err.message);
      showToast("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setForm({ ...profile }); setEditing(false); };

  const initials = (profile.full_name || profile.email || "T")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#C5924E] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">My Profile 👤</h1>
        <p className="text-sm text-[#6E5D53] mt-1">Manage your personal information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden">
        {/* Top Banner */}
        <div className="h-28 bg-gradient-to-r from-[#2D1F1A] to-[#C5924E] relative">
          <div className="absolute -bottom-10 left-8">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#F8F5EE] border-4 border-white shadow-md flex items-center justify-center text-[#2D1F1A] font-bold text-xl">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C5924E] rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          {/* Edit button top-right */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-white/30"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#C5924E] hover:bg-[#B4813F] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl border border-white/30 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="pt-14 px-8 pb-8">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                {profile.full_name || profile.email?.split("@")[0] || "Tenant"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 font-semibold px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Tenant
                </span>
                <span className="text-xs text-[#6E5D53]">Member since {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-[#F8F5EE] rounded-2xl border border-[#E3D9CC]">
            {[
              { label: "Total Visits",     val: stats.visits,   icon: <Clock className="w-4 h-4" />     },
              { label: "Confirmed",        val: stats.bookings, icon: <CheckCircle2 className="w-4 h-4" /> },
              { label: "Saved Properties", val: stats.saved,    icon: <Heart className="w-4 h-4" />     },
            ].map(s => (
              <div key={s.label} className="text-center space-y-1">
                <div className="flex justify-center text-[#C5924E]">{s.icon}</div>
                <p className="text-xl font-serif font-bold text-[#2D1F1A]">{s.val}</p>
                <p className="text-[10px] text-[#6E5D53] font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl px-4 py-2.5 text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                />
              ) : (
                <p className="text-sm font-medium text-[#2D1F1A] px-4 py-2.5 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]">
                  {profile.full_name || "—"}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <p className="text-sm font-medium text-[#2D1F1A] px-4 py-2.5 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC] flex items-center gap-2">
                {profile.email}
                <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Verified</span>
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl px-4 py-2.5 text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                />
              ) : (
                <p className="text-sm font-medium text-[#2D1F1A] px-4 py-2.5 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]">
                  {profile.phone || "Not provided"}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="Bangalore, Karnataka"
                  className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl px-4 py-2.5 text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                />
              ) : (
                <p className="text-sm font-medium text-[#2D1F1A] px-4 py-2.5 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]">
                  {profile.location || "Not provided"}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> About Me
              </label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell owners a bit about yourself..."
                  className="w-full bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl px-4 py-2.5 text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] resize-none"
                />
              ) : (
                <p className="text-sm text-[#2D1F1A] px-4 py-2.5 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC] min-h-[70px] leading-relaxed">
                  {profile.bio || "No bio added yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Card */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm p-6 space-y-4">
        <h3 className="text-base font-serif font-bold text-[#2D1F1A]">Account Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D1F1A]">Email Verified</p>
                <p className="text-[10px] text-[#6E5D53]">{profile.email}</p>
              </div>
            </div>
            <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F8F5EE] rounded-xl border border-[#E3D9CC]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F8F5EE] border border-[#E3D9CC] text-[#C5924E] rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D1F1A]">Account Role</p>
                <p className="text-[10px] text-[#6E5D53]">Verified Tenant</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#F8F5EE] text-[#C5924E] border border-[#E3D9CC] px-2.5 py-1 rounded-full font-bold">Tenant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

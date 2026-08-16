import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Users, Loader2, MapPin, IndianRupee, Calendar,
  CheckCircle2, Clock, Phone, Mail, ChevronDown,
  Search, FileText, XCircle,
} from "lucide-react";

const STATUS_STYLES = {
  active:    { pill: "bg-green-100 text-green-800",   label: "Active"    },
  ended:     { pill: "bg-gray-100 text-gray-600",     label: "Ended"     },
  pending:   { pill: "bg-amber-100 text-amber-800",   label: "Pending"   },
  cancelled: { pill: "bg-red-100 text-red-700",       label: "Cancelled" },
};

export default function OwnerBookings() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [stats, setStats]         = useState({ total:0, active:0, pending:0, revenue:0 });

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch accepted visit_requests as "bookings"
      const { data: props } = await supabase
        .from("properties")
        .select("id, title, location, price")
        .eq("owner_id", session.user.id);

      if (!props || props.length === 0) { setBookings([]); return; }

      const propMap = Object.fromEntries(props.map(p => [p.id, p]));
      const propIds = props.map(p => p.id);

      const { data: bookingData, error } = await supabase
        .from("visit_requests")
        .select("*")
        .in("property_id", propIds)
        .in("status", ["Accepted", "Rejected"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enriched = (bookingData || []).map(b => ({
        ...b,
        property: propMap[b.property_id] || {},
      }));

      setBookings(enriched);
      setStats({
        total:   enriched.length,
        active:  enriched.filter(b => b.status === "Accepted").length,
        pending: enriched.filter(b => b.status === "Pending").length,
        revenue: enriched
          .filter(b => b.status === "Accepted")
          .reduce((sum, b) => sum + (propMap[b.property_id]?.price || 0), 0),
      });
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filters = ["All", "Accepted", "Rejected"];

  const filtered = bookings.filter(b => {
    const matchFilter = filter === "All" || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.tenant_name?.toLowerCase().includes(q) ||
      b.tenant_email?.toLowerCase().includes(q) ||
      b.property?.title?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">Tenant Bookings 📝</h1>
          <p className="text-sm text-[#6E5D53] mt-1">Track confirmed visit requests and lease agreements.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6E5D53]" />
          <input
            type="text"
            placeholder="Search tenant or property..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E3D9CC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings",    val: stats.total,                        icon: <Users className="w-4 h-4" />           },
          { label: "Active",            val: stats.active,                       icon: <CheckCircle2 className="w-4 h-4" />    },
          { label: "Pending",           val: stats.pending,                      icon: <Clock className="w-4 h-4" />           },
          { label: "Est. Revenue",      val: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: <IndianRupee className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E5D53]">{s.label}</span>
              <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">{s.icon}</div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#2D1F1A]">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "bg-[#2D1F1A] text-white shadow-sm"
                : "bg-white border border-[#E3D9CC] text-[#6E5D53] hover:bg-[#F8F5EE]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
            {search || filter !== "All" ? "No matching bookings" : "No Bookings Yet"}
          </h3>
          <p className="text-sm text-[#6E5D53] max-w-md mx-auto">
            {search || filter !== "All"
              ? "Try adjusting your search or filter."
              : "When you accept visit requests, they will appear here as bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const isExpanded = expandedId === booking.id;
            const accepted = booking.status === "Accepted";

            return (
              <div key={booking.id} className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden">
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  {/* Left */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#2D1F1A] font-bold text-sm flex-shrink-0">
                      {(booking.tenant_name || "T").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#2D1F1A]">{booking.tenant_name || "Tenant"}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${accepted ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C5924E]" />
                        {booking.property?.title} — {booking.property?.location}
                      </p>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Visit: {booking.visit_date
                          ? new Date(booking.visit_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
                          : "TBD"}
                        {booking.visit_time ? ` at ${booking.visit_time}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-4 ml-auto">
                    {booking.property?.price && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[#6E5D53]">Rent</p>
                        <p className="text-sm font-bold text-[#C5924E]">₹{booking.property.price.toLocaleString("en-IN")}/mo</p>
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-[#6E5D53] transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#F2ECE4] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Contact</p>
                      {booking.tenant_email && (
                        <p className="text-xs text-[#2D1F1A] flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#C5924E]" />{booking.tenant_email}
                        </p>
                      )}
                      {booking.tenant_phone && (
                        <p className="text-xs text-[#2D1F1A] flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#C5924E]" />{booking.tenant_phone}
                        </p>
                      )}
                    </div>
                    {booking.property?.price && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Property Details</p>
                        <p className="text-xs text-[#2D1F1A]">{booking.property.title}</p>
                        <p className="text-xs font-bold text-[#C5924E]">₹{booking.property.price.toLocaleString("en-IN")}/month</p>
                      </div>
                    )}
                    {booking.message && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Tenant Note</p>
                        <p className="text-xs text-[#2D1F1A] bg-[#F8F5EE] p-3 rounded-xl border border-[#E3D9CC] leading-relaxed">{booking.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

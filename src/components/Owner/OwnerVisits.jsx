import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  CalendarCheck, Loader2, User, MapPin, Clock,
  CheckCircle2, XCircle, Phone, Mail, ChevronDown, Search,
  CalendarX, AlertCircle,
} from "lucide-react";

const STATUS_STYLES = {
  Pending:  { pill: "bg-amber-100 text-amber-800",  dot: "bg-amber-400"  },
  Accepted: { pill: "bg-green-100 text-green-800",   dot: "bg-green-500"  },
  Rejected: { pill: "bg-red-100 text-red-700",       dot: "bg-red-400"    },
  Cancelled:{ pill: "bg-gray-100 text-gray-600",     dot: "bg-gray-400"   },
};

export default function OwnerVisits() {
  const [visits, setVisits]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast]         = useState("");

  const filters = ["All", "Pending", "Accepted", "Rejected"];

  useEffect(() => { fetchVisits(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get all properties of this owner
      const { data: props } = await supabase
        .from("properties")
        .select("id, title, location")
        .eq("owner_id", session.user.id);

      if (!props || props.length === 0) { setVisits([]); return; }

      const propIds = props.map(p => p.id);
      const propMap = Object.fromEntries(props.map(p => [p.id, p]));

      const { data: visitData, error } = await supabase
        .from("visit_requests")
        .select("*")
        .in("property_id", propIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVisits((visitData || []).map(v => ({
        ...v,
        property: propMap[v.property_id] || {},
      })));
    } catch (err) {
      console.error("Error fetching visits:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setActionId(id);
    try {
      const { error } = await supabase
        .from("visit_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      showToast(`Visit request ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error("Error updating visit status:", err.message);
      showToast("Failed to update status. Try again.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = visits.filter(v => {
    const matchFilter = filter === "All" || v.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.tenant_name?.toLowerCase().includes(q) ||
      v.tenant_email?.toLowerCase().includes(q) ||
      v.property?.title?.toLowerCase().includes(q) ||
      v.property?.location?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = {
    All: visits.length,
    Pending:  visits.filter(v => v.status === "Pending").length,
    Accepted: visits.filter(v => v.status === "Accepted").length,
    Rejected: visits.filter(v => v.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D1F1A] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#C5924E] text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#C5924E]" />{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">Visit Requests 📅</h1>
          <p className="text-sm text-[#6E5D53] mt-1">Review and manage scheduled property visits from tenants.</p>
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

      {/* Filter Tabs */}
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
            {f} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${filter === f ? "bg-[#C5924E] text-white" : "bg-[#F8F5EE] text-[#2D1F1A]"}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto">
            <CalendarX className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2D1F1A]">
            {search || filter !== "All" ? "No matching requests" : "No Visit Requests Yet"}
          </h3>
          <p className="text-sm text-[#6E5D53] max-w-md mx-auto">
            {search || filter !== "All"
              ? "Try adjusting your search or filter."
              : "When tenants schedule visits to your properties, requests will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(visit => {
            const style = STATUS_STYLES[visit.status] || STATUS_STYLES.Pending;
            const isExpanded = expandedId === visit.id;
            const isActing = actionId === visit.id;

            return (
              <div key={visit.id} className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden">
                {/* Main Row */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#2D1F1A] font-bold text-sm flex-shrink-0">
                      {(visit.tenant_name || "T").charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#2D1F1A]">{visit.tenant_name || "Tenant"}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${style.pill}`}>{visit.status || "Pending"}</span>
                      </div>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5924E]" />
                        {visit.property?.title || "Property"} — {visit.property?.location || ""}
                      </p>
                      <p className="text-xs text-[#6E5D53] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {visit.visit_date
                          ? new Date(visit.visit_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
                          : "Date TBD"}
                        {visit.visit_time ? ` at ${visit.visit_time}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Accept / Reject — only if Pending */}
                    {visit.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); updateStatus(visit.id, "Accepted"); }}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Accept
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); updateStatus(visit.id, "Rejected"); }}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-[#6E5D53] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#F2ECE4] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Tenant Info</p>
                      {visit.tenant_email && (
                        <p className="text-xs text-[#2D1F1A] flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#C5924E]" />{visit.tenant_email}
                        </p>
                      )}
                      {visit.tenant_phone && (
                        <p className="text-xs text-[#2D1F1A] flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#C5924E]" />{visit.tenant_phone}
                        </p>
                      )}
                    </div>
                    {visit.message && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Message</p>
                        <p className="text-xs text-[#2D1F1A] bg-[#F8F5EE] p-3 rounded-xl border border-[#E3D9CC] leading-relaxed">{visit.message}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Requested On</p>
                      <p className="text-xs text-[#2D1F1A]">
                        {visit.created_at
                          ? new Date(visit.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
                          : "—"}
                      </p>
                    </div>
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

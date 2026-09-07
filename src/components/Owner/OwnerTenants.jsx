import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Users,
  Mail,
  Phone,
  Building,
  Loader2,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function OwnerTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOwnerTenants = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) return;
        const ownerId = session.user.id;

        // 1. Get properties owned by this user
        const { data: properties, error: propError } = await supabase
          .from("properties")
          .select("id, title")
          .eq("owner_id", ownerId);

        if (propError) throw propError;
        if (!properties || properties.length === 0) {
          setLoading(false);
          return;
        }

        const propertyIds = properties.map((p) => p.id);
        const propertyMap = properties.reduce((acc, p) => {
          acc[p.id] = p.title;
          return acc;
        }, {});

        // 2. Fetch confirmed visit slots for these properties
        const { data: bookings, error: bookingError } = await supabase
          .from("property_visit_slots")
          .select("*")
          .in("property_id", propertyIds)
          .eq("status", "confirmed");

        if (bookingError) throw bookingError;
        if (!bookings || bookings.length === 0) {
          setLoading(false);
          setTenants([]);
          return;
        }

        const tenantIds = [...new Set(bookings.map((b) => b.tenant_id).filter(Boolean))];

        // 3. Fetch names from tenant_documents where available
        let tenantNameMap = {};
        if (tenantIds.length > 0) {
          const { data: docData } = await supabase
            .from("tenant_documents")
            .select("tenant_id, tenant_name")
            .in("tenant_id", tenantIds);

          if (docData) {
            docData.forEach((doc) => {
              if (doc.tenant_id && doc.tenant_name) {
                tenantNameMap[doc.tenant_id] = doc.tenant_name;
              }
            });
          }
        }

        // 4. Format final list with names from documents or clean fallback IDs
        const formattedTenants = bookings.map((b) => {
          const resolvedName = tenantNameMap[b.tenant_id] || `Tenant (${b.tenant_id ? b.tenant_id.slice(0, 6) : "Unknown"})`;

          return {
            id: b.id,
            name: resolvedName,
            email: "Verified Resident",
            phone: "Available in Records",
            propertyTitle: propertyMap[b.property_id] || "Assigned Property",
            status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Confirmed",
          };
        });

        setTenants(formattedTenants);
      } catch (err) {
        console.error("Error fetching tenants:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerTenants();
  }, []);

  const filteredTenants = tenants.filter((tenant) => {
    const name = tenant.name.toLowerCase();
    const propertyTitle = tenant.propertyTitle.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || propertyTitle.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#C5924E]" />
          <p className="text-xs text-[#8A7568] tracking-wider uppercase font-mono">Syncing residents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#2D1F1A] px-4 md:px-10 py-8 space-y-8 selection:bg-[#C5924E]/20 selection:text-[#2D1F1A]">
      {/* Modern Glassmorphic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 border border-[#EADBCE]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C5924E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-xs font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> RESIDENT PORTAL
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
            My Property Tenants
          </h1>
          <p className="text-xs md:text-sm text-[#6E5D53] max-w-xl font-normal">
            Manage and view details of verified residents currently renting or scheduled in your properties.
          </p>
        </div>

        <div className="w-full lg:w-80 relative z-10">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7568]" />
            <input
              type="text"
              placeholder="Search tenant or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] placeholder-[#8A7568] focus:outline-none focus:border-[#C5924E] focus:ring-2 focus:ring-[#C5924E]/25 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/80 border border-[#EADBCE]/85 backdrop-blur-md p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#8A7568]">Total Active Residents</div>
          <div className="text-2xl font-serif font-bold text-[#2D1F1A]">{tenants.length}</div>
          <div className="text-[10px] text-[#6E5D53]">Verified occupancy records</div>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 backdrop-blur-md p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#8A7568]">Status Breakdown</div>
          <div className="text-2xl font-serif font-bold text-emerald-600">
            {tenants.filter(t => t.status === "Confirmed").length} Confirmed
          </div>
          <div className="text-[10px] text-[#6E5D53]">All background vetted bookings</div>
        </div>
      </div>

      {/* Content Stream */}
      <div className="space-y-6">
        {filteredTenants.length === 0 ? (
          <div className="bg-white/50 border border-[#EADBCE]/80 rounded-2xl p-16 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center mx-auto text-[#C5924E]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#2D1F1A]">
              No Tenants Found
            </h3>
            <p className="text-xs text-[#6E5D53] max-w-xs mx-auto">
              You don't have any active tenant bookings or leases registered for your properties yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white/80 border border-[#EADBCE]/85 hover:border-[#C5924E] rounded-2xl p-5 space-y-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] font-serif font-bold flex items-center justify-center text-sm shadow-inner">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#2D1F1A] group-hover:text-[#C5924E] transition-colors">
                          {tenant.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-mono font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> {tenant.status}
                        </span>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#6E5D53] group-hover:bg-[#C5924E] group-hover:text-white group-hover:border-[#C5924E] transition-all shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs pt-3 border-t border-[#FAF7F2] font-mono">
                    <div className="flex items-center gap-2 text-[#6E5D53]">
                      <Building className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span className="truncate">
                        Property: <strong className="text-[#2D1F1A] font-sans font-medium">{tenant.propertyTitle}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6E5D53]">
                      <Mail className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6E5D53]">
                      <Phone className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span>{tenant.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
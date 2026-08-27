import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Users, Building, ShieldCheck, Database } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    pendingTenants: 0,
    totalOwners: 0,
    totalProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        // 1. Fetch total tenant document entries or unique tenant rows
        const { data: tenantDocs, error: tenantErr } = await supabase
          .from("tenant_documents")
          .select("id, tenant_id, status");
        if (tenantErr) throw tenantErr;

        // Count pending or use total unique tenants if all are processed
        const pendingCount = tenantDocs?.filter(
          (d) => !d.status || d.status.toLowerCase() === "pending" || d.status.toLowerCase() === "review"
        ).length;

        // Fallback: If there are documents but none match 'pending', show total documents/tenants so it's not 0
        const totalTenantsCount = pendingCount > 0 ? pendingCount : (new Set(tenantDocs?.map(d => d.tenant_id)).size || tenantDocs?.length || 0);

        // 2. Fetch unique registered owners count from owner documents
        const { data: ownerDocs, error: ownerErr } = await supabase
          .from("owner_documents")
          .select("owner_id");
        if (ownerErr) throw ownerErr;

        const uniqueOwners = new Set(ownerDocs?.map((o) => o.owner_id)).size;

        // 3. Fetch total properties database count
        const { count: propertyCount, error: propErr } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true });
        if (propErr) throw propErr;

        setStats({
          pendingTenants: totalTenantsCount,
          totalOwners: uniqueOwners,
          totalProperties: propertyCount || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Control Center Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">Admin Control Center</h1>
          <p className="text-xs text-[#9E8B7F] mt-1">
            Monitor platform activity, verify documents, and manage platform assets.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Secure Session Active
        </div>
      </div>

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Tenant Verifications */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E8B7F]">
              Tenant Verifications
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7F4EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-[#2D1F1A]">
              {loading ? "..." : stats.pendingTenants}
            </h3>
            <p className="text-xs text-[#9E8B7F] mt-1">Active Queue / Records</p>
          </div>
        </div>

        {/* Card 2: Registered Owners */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E8B7F]">
              Registered Owners
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7F4EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-[#2D1F1A]">
              {loading ? "..." : stats.totalOwners}
            </h3>
            <p className="text-xs text-[#9E8B7F] mt-1">Managed Profiles</p>
          </div>
        </div>

        {/* Card 3: Properties Listed */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E8B7F]">
              Properties Listed
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7F4EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-[#2D1F1A]">
              {loading ? "..." : stats.totalProperties}
            </h3>
            <p className="text-xs text-[#9E8B7F] mt-1">Total Database Records</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FileText, Eye, Search, Mail, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

export default function TenantsManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantDocs, setTenantDocs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTenants = async () => {
    setLoading(true);
    try {
      // Fetch tenant documents independently without referencing missing columns
      const { data, error } = await supabase
        .from("tenant_documents")
        .select("*");

      if (error) throw error;

      // Fetch profiles separately to map names and emails reliably
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email");

      const profileMap = {};
      profilesData?.forEach((p) => {
        profileMap[p.id] = p;
      });

      const grouped = {};
      data?.forEach((doc) => {
        const tid = doc.tenant_id;
        if (!grouped[tid]) {
          const profile = profileMap[tid] || {};
          grouped[tid] = {
            tenant_id: tid,
            name: profile.full_name || doc.tenant_name || "Unknown Tenant",
            email: profile.email || "No Email Provided",
            documents: [],
          };
        }

        // Resolve storage public URLs if file_url is a relative path
        let resolvedUrl = doc.file_url;
        if (resolvedUrl && !resolvedUrl.startsWith("http")) {
          const { data: publicUrlData } = supabase.storage
            .from("tenant-documents") // adjust bucket name if needed
            .getPublicUrl(resolvedUrl);
          resolvedUrl = publicUrlData?.publicUrl || resolvedUrl;
        }

        grouped[tid].documents.push({
          ...doc,
          file_url: resolvedUrl,
        });
      });

      const tenantList = Object.values(grouped);
      setTenants(tenantList);

      // Keep selection synced if data refreshes
      if (tenantList.length > 0) {
        const currentSelected = selectedTenant 
          ? tenantList.find(t => t.tenant_id === selectedTenant.tenant_id) 
          : tenantList[0];
          
        setSelectedTenant(currentSelected || tenantList[0]);
        setTenantDocs((currentSelected || tenantList[0]).documents);
      } else {
        setSelectedTenant(null);
        setTenantDocs([]);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleInspect = (tenant) => {
    setSelectedTenant(tenant);
    setTenantDocs(tenant.documents);
  };

  const updateDocStatus = async (docId, newStatus) => {
    try {
      const { error } = await supabase
        .from("tenant_documents")
        .update({ status: newStatus })
        .eq("id", docId);

      if (error) throw error;

      // Refresh data locally and globally
      fetchTenants();
      if (selectedTenant) {
        const updatedDocs = tenantDocs.map((d) => (d.id === docId ? { ...d, status: newStatus } : d));
        setTenantDocs(updatedDocs);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "All") return matchesSearch;
    const hasStatus = t.documents.some((d) => d.status?.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && hasStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">Tenant Verification Center</h1>
          <p className="text-xs text-[#9E8B7F] mt-1">Review, approve, or reject identity records submitted by tenants.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F4EE] border border-[#E3D9CC] rounded-xl focus:outline-none focus:border-[#C5924E]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F7F4EE] border border-[#E3D9CC] rounded-xl focus:outline-none focus:border-[#C5924E] text-[#2D1F1A]"
          >
            <option value="All">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenants List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E3D9CC] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E3D9CC] bg-[#F7F4EE]/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D1F1A]">Tenants Database ({filteredTenants.length})</span>
          </div>
          <div className="divide-y divide-[#E3D9CC] overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#9E8B7F]">Loading tenant records...</div>
            ) : filteredTenants.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9E8B7F]">No tenant records found.</div>
            ) : (
              filteredTenants.map((tenant) => {
                const allVerified = tenant.documents.length > 0 && tenant.documents.every((d) => d.status === "Verified");
                const anyRejected = tenant.documents.some((d) => d.status === "Rejected");

                return (
                  <div
                    key={tenant.tenant_id}
                    className={`p-4 flex items-center justify-between hover:bg-[#F7F4EE]/40 transition-colors ${
                      selectedTenant?.tenant_id === tenant.tenant_id ? "bg-[#F7F4EE]" : ""
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#2D1F1A]">{tenant.name}</h4>
                      <p className="text-[11px] text-[#9E8B7F] flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/> {tenant.email}</p>
                      <span className="text-[10px] text-neutral-500 mt-1 block">{tenant.documents.length} File(s) Uploaded</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          allVerified
                            ? "bg-emerald-100 text-emerald-700"
                            : anyRejected
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {allVerified ? "Verified" : anyRejected ? "Action Required" : "Pending Review"}
                      </span>
                      <button
                        onClick={() => handleInspect(tenant)}
                        className="px-3 py-1.5 bg-[#2D1F1A] text-white text-xs font-semibold rounded-lg hover:bg-[#3A2E2A] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Item Inspector Panel */}
        <div className="bg-white rounded-2xl border border-[#E3D9CC] shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2D1F1A] uppercase tracking-wider border-b border-[#E3D9CC] pb-3 mb-4">Item Inspector</h3>
            {selectedTenant ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-[#2D1F1A]">{selectedTenant.name}</h4>
                  <p className="text-xs text-[#9E8B7F]">{selectedTenant.email}</p>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  <p className="text-xs font-bold text-[#2D1F1A]">Submitted Documents ({tenantDocs.length}):</p>
                  {tenantDocs.length === 0 ? (
                    <p className="text-xs text-[#9E8B7F]">No documents submitted by this tenant.</p>
                  ) : (
                    tenantDocs.map((doc) => (
                      <div key={doc.id} className="p-3 bg-[#F7F4EE] border border-[#E3D9CC] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate max-w-[140px] text-[#2D1F1A]">{doc.file_name || doc.doc_type || "Document"}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              doc.status === "Verified" ? "bg-emerald-100 text-emerald-700" : doc.status === "Rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {doc.status || "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#9E8B7F]">
                          <span>Type: {doc.doc_type || "ID Proof"}</span>
                          {doc.file_url ? (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#C5924E] hover:underline font-semibold flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View File
                            </a>
                          ) : (
                            <span className="text-rose-400 italic">No file URL</span>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-[#E3D9CC]/60">
                          <button
                            onClick={() => updateDocStatus(doc.id, "Verified")}
                            className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => updateDocStatus(doc.id, "Rejected")}
                            className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9E8B7F] text-center py-12">Select a tenant to inspect documents.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FileText, Eye, Search, Mail, ExternalLink, CheckCircle2, XCircle, Building } from "lucide-react";

export default function OwnersManagement() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerDocs, setOwnerDocs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOwners = async () => {
    setLoading(true);
    try {
      // Fetch owner documents independently without sorting by missing created_at
      const { data, error } = await supabase
        .from("owner_documents")
        .select("*");

      if (error) throw error;

      // Fetch profiles safely
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email");

      const profileMap = {};
      profilesData?.forEach((p) => {
        profileMap[p.id] = p;
      });

      const grouped = {};
      data?.forEach((doc) => {
        const oid = doc.owner_id;
        if (!grouped[oid]) {
          const profile = profileMap[oid] || {};
          grouped[oid] = {
            owner_id: oid,
            name: profile.full_name || doc.owner_name || "Unknown Owner",
            email: profile.email || "No Email Provided",
            documents: [],
          };
        }

        // Resolve storage public URLs if file_url is relative
        let resolvedUrl = doc.file_url;
        if (resolvedUrl && !resolvedUrl.startsWith("http")) {
          const { data: publicUrlData } = supabase.storage
            .from("owner-documents") // adjust bucket name if needed
            .getPublicUrl(resolvedUrl);
          resolvedUrl = publicUrlData?.publicUrl || resolvedUrl;
        }

        grouped[oid].documents.push({
          ...doc,
          file_url: resolvedUrl,
        });
      });

      const ownerList = Object.values(grouped);
      setOwners(ownerList);

      if (ownerList.length > 0) {
        const currentSelected = selectedOwner 
          ? ownerList.find(o => o.owner_id === selectedOwner.owner_id) 
          : ownerList[0];
          
        setSelectedOwner(currentSelected || ownerList[0]);
        setOwnerDocs((currentSelected || ownerList[0]).documents);
      } else {
        setSelectedOwner(null);
        setOwnerDocs([]);
      }
    } catch (err) {
      console.error("Error fetching owners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleInspect = (owner) => {
    setSelectedOwner(owner);
    setOwnerDocs(owner.documents);
  };

  const updateDocStatus = async (docId, newStatus) => {
    try {
      const { error } = await supabase
        .from("owner_documents")
        .update({ status: newStatus })
        .eq("id", docId);

      if (error) throw error;

      fetchOwners();
      if (selectedOwner) {
        const updatedDocs = ownerDocs.map((d) => (d.id === docId ? { ...d, status: newStatus } : d));
        setOwnerDocs(updatedDocs);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredOwners = owners.filter((o) => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "All") return matchesSearch;
    const hasStatus = o.documents.some((d) => d.status?.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && hasStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">Owner Verification Center</h1>
          <p className="text-xs text-[#9E8B7F] mt-1">Review, approve, or reject identity records submitted by property owners.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search owner..."
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
        {/* Owners List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E3D9CC] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E3D9CC] bg-[#F7F4EE]/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D1F1A]">Owners Database ({filteredOwners.length})</span>
          </div>
          <div className="divide-y divide-[#E3D9CC] overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#9E8B7F]">Loading owner records...</div>
            ) : filteredOwners.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9E8B7F]">No owner records found.</div>
            ) : (
              filteredOwners.map((owner) => {
                const allVerified = owner.documents.length > 0 && owner.documents.every((d) => d.status === "Verified");
                const anyRejected = owner.documents.some((d) => d.status === "Rejected");

                return (
                  <div
                    key={owner.owner_id}
                    className={`p-4 flex items-center justify-between hover:bg-[#F7F4EE]/40 transition-colors ${
                      selectedOwner?.owner_id === owner.owner_id ? "bg-[#F7F4EE]" : ""
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#2D1F1A]">{owner.name}</h4>
                      <p className="text-[11px] text-[#9E8B7F] flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/> {owner.email}</p>
                      <span className="text-[10px] text-neutral-500 mt-1 block">{owner.documents.length} File(s) Uploaded</span>
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
                        onClick={() => handleInspect(owner)}
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
            {selectedOwner ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-[#2D1F1A]">{selectedOwner.name}</h4>
                  <p className="text-xs text-[#9E8B7F]">{selectedOwner.email}</p>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  <p className="text-xs font-bold text-[#2D1F1A]">Submitted Documents ({ownerDocs.length}):</p>
                  {ownerDocs.length === 0 ? (
                    <p className="text-xs text-[#9E8B7F]">No documents submitted by this owner.</p>
                  ) : (
                    ownerDocs.map((doc) => (
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
              <p className="text-xs text-[#9E8B7F] text-center py-12">Select an owner to inspect documents.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
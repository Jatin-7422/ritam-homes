import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import {
  Folder,
  CheckCircle2,
  Clock,
  HardDrive,
  Upload,
  Eye,
  Download,
  ShieldCheck,
  Lock,
  FileText,
  Loader2,
  Trash2,
  Sparkles,
  FileCheck2,
} from "lucide-react";

export default function OwnerDocument() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState({ id: "", name: "" });
  const [tenantInfo, setTenantInfo] = useState({ id: "", name: "" });
  const [selectedType, setSelectedType] = useState("Property Ownership Proof");
  const [statusFilter, setStatusFilter] = useState("All Documents");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const currentOwnerId = user.id;
      const currentOwnerName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Owner User";

      setOwnerInfo({ id: currentOwnerId, name: currentOwnerName });

      const assignedTenantId = user.user_metadata?.tenant_id || null;
      const assignedTenantName =
        user.user_metadata?.tenant_name || "Assigned Tenant";
      setTenantInfo({ id: assignedTenantId, name: assignedTenantName });

      const { data: docs, error } = await supabase
        .from("owner_documents")
        .select("*")
        .eq("owner_id", currentOwnerId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(docs || []);
    } catch (err) {
      console.error("Error fetching documents:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    try {
      setUploading(true);

      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = `${ownerInfo.id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("owner-documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from("owner-documents")
        .getPublicUrl(filePath);

      const newDocRecord = {
        owner_id: ownerInfo.id,
        owner_name: ownerInfo.name,
        tenant_id: tenantInfo.id || null,
        tenant_name: tenantInfo.name,
        document_name: file.name,
        document_type: selectedType,
        status: "Pending",
        file_size_bytes: file.size,
        file_path: filePath,
        file_url: urlData.publicUrl,
      };

      const { data: insertedDoc, error: dbError } = await supabase
        .from("owner_documents")
        .insert([newDocRecord])
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments((prev) => [insertedDoc, ...prev]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete ${doc.document_name}?`)) return;

    try {
      let cleanFilePath = doc.file_path;
      if (cleanFilePath.includes("owner-documents/")) {
        cleanFilePath = cleanFilePath.split("owner-documents/")[1];
      }
      cleanFilePath = cleanFilePath.replace(/^\/+/, "");

      const { error: storageError } = await supabase.storage
        .from("owner-documents")
        .remove([cleanFilePath]);

      if (storageError) {
        console.error("Storage removal issue:", storageError.message);
      }

      const { error: dbError } = await supabase
        .from("owner_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      alert("Error deleting file: " + err.message);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter === "Verified") return doc.status === "Verified";
    if (statusFilter === "Pending") return doc.status === "Pending";
    if (statusFilter === "Rejected") return doc.status === "Rejected";
    return true;
  });

  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === "Verified").length;
  const pendingDocs = documents.filter((d) => d.status === "Pending").length;
  const totalSizeBytes = documents.reduce(
    (acc, d) => acc + (d.file_size_bytes || 0),
    0
  );
  const totalMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const maxMB = 200;
  const storagePercent = Math.min(
    Math.round((totalMB / maxMB) * 100),
    100
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes >= 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1F1A] px-3 sm:px-6 md:px-10 py-4 sm:py-8 space-y-4 sm:space-y-8 selection:bg-[#C5924E]/20 selection:text-[#2D1F1A]">
      {/* Modern Glassmorphic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white/75 border border-[#EADBCE]/80 backdrop-blur-xl p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C5924E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 sm:space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-[10px] sm:text-xs font-mono tracking-wide">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> SECURE VAULT
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
            Owner Documents
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5D53] max-w-xl font-normal">
            Store and manage property records, titles, tax receipts, and legal documents with enterprise-grade encryption.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/80 border border-[#EADBCE] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xs relative z-10 w-full md:w-auto justify-start">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#C5924E]/15 text-[#C5924E] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-mono text-[#8A7568] uppercase tracking-wider">Security Status</p>
            <p className="text-[11px] sm:text-xs font-serif font-bold text-[#2D1F1A]">Encrypted & Verified</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/80 border border-[#EADBCE]/85 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 sm:space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-[#8A7568] uppercase tracking-wider truncate">Total Documents</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-inner shrink-0">
              <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A]">{totalDocs}</p>
          <p className="text-[10px] sm:text-xs text-[#8A7568] font-mono">Files uploaded</p>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 sm:space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-[#8A7568] uppercase tracking-wider truncate">Verified Records</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A]">{verifiedDocs}</p>
          <p className="text-[10px] sm:text-xs text-emerald-600 font-mono font-bold">Verified & approved</p>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 sm:space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-[#8A7568] uppercase tracking-wider truncate">Pending Review</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A]">{pendingDocs}</p>
          <p className="text-[10px] sm:text-xs text-amber-600 font-mono font-bold">Awaiting verification</p>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 sm:space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-[#8A7568] uppercase tracking-wider truncate">Storage Used</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-inner shrink-0">
              <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A]">{totalMB} MB</p>
          <p className="text-[10px] sm:text-xs text-[#8A7568] font-mono">of {maxMB} MB limit</p>
        </div>
      </div>

      {/* Main Upload + Storage Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upload Box */}
        <div className="lg:col-span-2 bg-white/80 border border-dashed border-[#C5924E]/50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col items-center justify-center text-center relative hover:border-[#C5924E] transition-all group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />

          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#C5924E]/10 border border-[#C5924E]/20 rounded-2xl flex items-center justify-center text-[#C5924E] mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-inner">
            <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2D1F1A]">
            Upload Property Document
          </h2>
          <p className="text-xs text-[#6E5D53] mt-1 mb-4 sm:mb-6 max-w-md px-2">
            Drag & drop your files securely or select a category below to begin the upload process.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-6 w-full max-w-md justify-center px-2">
            <span className="text-[11px] sm:text-xs font-mono font-bold text-[#8A7568] uppercase self-start sm:self-center">
              Doc Type:
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:flex-1 px-3.5 py-2 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#2D1F1A] font-mono focus:outline-none focus:border-[#C5924E] shadow-xs"
            >
              <option value="Property Ownership Proof">Property Ownership Proof</option>
              <option value="Tax Receipt">Tax Receipt</option>
              <option value="Lease Agreement">Lease Agreement</option>
              <option value="Insurance Document">Insurance Document</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#2D1F1A] hover:bg-[#C5924E] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                Uploading Document...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Browse & Upload
              </>
            )}
          </button>

          <p className="text-[10px] text-[#8A7568] font-mono mt-3 sm:mt-4">
            Supported formats: PDF, JPG, PNG · Max file size: 10MB
          </p>
        </div>

        {/* Storage Gauge Card */}
        <div className="bg-white/80 border border-[#EADBCE]/85 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#2D1F1A]">Storage Capacity</h3>
            <span className="text-xs font-mono text-[#C5924E] font-bold">{storagePercent}% Used</span>
          </div>

          <div className="flex flex-col items-center justify-center my-4 sm:my-6">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#FAF7F2"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#C5924E"
                  strokeWidth="12"
                  strokeDasharray="364"
                  strokeDashoffset={364 - (364 * storagePercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#2D1F1A]">
                  {storagePercent}%
                </span>
                <span className="text-[10px] font-mono text-[#8A7568]">
                  {totalMB} / {maxMB} MB
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EADBCE]/60">
              <div
                className="bg-gradient-to-r from-[#2D1F1A] to-[#C5924E] h-full transition-all duration-700"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <button className="w-full py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-mono font-bold text-[#2D1F1A] hover:bg-[#C5924E] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
              <HardDrive className="w-4 h-4 text-[#C5924E] group-hover:text-white" /> Manage Storage Tier
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table & Tips Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Table / Mobile Cards Container */}
        <div className="lg:col-span-2 bg-white/80 border border-[#EADBCE]/85 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#EADBCE]/60">
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Uploaded Records</h2>
              <p className="text-xs text-[#8A7568] font-mono">View, inspect, or remove your legal files</p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-[#6E5D53] font-mono focus:outline-none"
            >
              <option value="All Documents">All Documents</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-[#C5924E]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-xs font-mono">Loading records...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-16 space-y-2 border border-dashed border-[#EADBCE] rounded-2xl">
              <FileText className="w-8 h-8 text-[#8A7568] mx-auto opacity-50" />
              <p className="text-xs font-mono text-[#6E5D53]">No documents found matching this filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-[#EADBCE]/60 text-[10px] font-mono text-[#8A7568] uppercase tracking-wider">
                      <th className="pb-3">Document Name</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Uploaded</th>
                      <th className="pb-3">Size</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]/40 text-xs">
                    {filteredDocuments.map((doc) => {
                      const ext = doc.document_name.split(".").pop().toUpperCase();
                      return (
                        <tr key={doc.id} className="hover:bg-white/60 transition-colors">
                          <td className="py-4 font-bold text-[#2D1F1A] flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] rounded-xl flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                              {ext}
                            </div>
                            <span className="truncate max-w-[160px]" title={doc.document_name}>
                              {doc.document_name}
                            </span>
                          </td>
                          <td className="py-4 text-[#6E5D53] font-medium">{doc.document_type}</td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                                doc.status === "Verified"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : doc.status === "Rejected"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {doc.status === "Verified" && "✓ Verified"}
                              {doc.status === "Pending" && "🕒 Pending"}
                              {doc.status === "Rejected" && "✕ Rejected"}
                            </span>
                          </td>
                          <td className="py-4 text-[#6E5D53] font-mono">{formatDate(doc.uploaded_at)}</td>
                          <td className="py-4 text-[#6E5D53] font-mono">{formatFileSize(doc.file_size_bytes)}</td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-white border border-[#EADBCE] rounded-lg hover:border-[#C5924E] hover:text-[#C5924E] transition-all shadow-xs"
                                title="View Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={doc.file_url}
                                download
                                className="p-2 bg-white border border-[#EADBCE] rounded-lg hover:border-[#C5924E] hover:text-[#C5924E] transition-all shadow-xs"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDelete(doc)}
                                className="p-2 bg-white border border-[#EADBCE] rounded-lg hover:border-rose-300 hover:text-rose-600 transition-all shadow-xs cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3">
                {filteredDocuments.map((doc) => {
                  const ext = doc.document_name.split(".").pop().toUpperCase();
                  return (
                    <div
                      key={doc.id}
                      className="bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-3.5 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            {ext}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2D1F1A] truncate" title={doc.document_name}>
                              {doc.document_name}
                            </p>
                            <p className="text-[11px] text-[#6E5D53] truncate">{doc.document_type}</p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                            doc.status === "Verified"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : doc.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {doc.status === "Verified" && "✓ Verified"}
                          {doc.status === "Pending" && "🕒 Pending"}
                          {doc.status === "Rejected" && "✕ Rejected"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-[#8A7568] pt-2 border-t border-[#EADBCE]/60">
                        <span>{formatDate(doc.uploaded_at)}</span>
                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs font-mono font-bold text-[#2D1F1A] flex items-center justify-center gap-1.5 hover:border-[#C5924E] hover:text-[#C5924E] transition-all shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="flex-1 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs font-mono font-bold text-[#2D1F1A] flex items-center justify-center gap-1.5 hover:border-[#C5924E] hover:text-[#C5924E] transition-all shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-2 bg-white border border-[#EADBCE] rounded-lg text-rose-600 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition-all shadow-2xs cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Document Tips Sidebar */}
        <div className="bg-white/80 border border-[#EADBCE]/85 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#2D1F1A] mb-2 sm:mb-4">Security & Guidelines</h3>
            <p className="text-xs text-[#8A7568] font-mono mb-4 sm:mb-6">Important recommendations for submitting valid property ownership credentials.</p>

            <div className="space-y-3 sm:space-y-4 text-xs text-[#6E5D53]">
              <div className="flex gap-3 items-start p-3 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/60">
                <div className="p-2 bg-[#C5924E]/10 text-[#C5924E] rounded-xl shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2D1F1A]">Official Titles Only</p>
                  <p className="text-[11px] text-[#8A7568] mt-0.5">Upload official tax deeds, property registration certificates, and lease copies.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/60">
                <div className="p-2 bg-[#C5924E]/10 text-[#C5924E] rounded-xl shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2D1F1A]">Enterprise Security</p>
                  <p className="text-[11px] text-[#8A7568] mt-0.5">All files are stored in isolated encrypted cloud buckets restricted to authorized admin review.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/60">
                <div className="p-2 bg-[#C5924E]/10 text-[#C5924E] rounded-xl shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2D1F1A]">Verification SLA</p>
                  <p className="text-[11px] text-[#8A7568] mt-0.5">Document review and authenticity confirmation typically completes within 1-2 working days.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2D1F1A] to-[#3E2E27] text-white space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-[#C5924E]">
              <FileCheck2 className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Need Assistance?</span>
            </div>
            <p className="text-[11px] text-[#EADBCE] font-light leading-relaxed">
              If you face issues uploading high-resolution deeds or need multi-owner document grouping, contact our support desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
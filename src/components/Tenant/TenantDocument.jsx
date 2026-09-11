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
  Bell,
  Trash2,
  Plus,
} from "lucide-react";

export default function TenantDocument() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState({ id: "", name: "" });
  const [ownerInfo, setOwnerInfo] = useState({ id: "", name: "" });
  const [selectedType, setSelectedType] = useState("Identity Proof");
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

      const currentTenantId = user.id;
      const currentTenantName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Tenant User";

      setTenantInfo({ id: currentTenantId, name: currentTenantName });

      const assignedOwnerId = user.user_metadata?.owner_id || null;
      const assignedOwnerName =
        user.user_metadata?.owner_name || "Property Owner";
      setOwnerInfo({ id: assignedOwnerId, name: assignedOwnerName });

      const { data: docs, error } = await supabase
        .from("tenant_documents")
        .select("*")
        .eq("tenant_id", currentTenantId)
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
      const filePath = `${tenantInfo.id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("tenant-documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from("tenant-documents")
        .getPublicUrl(filePath);

      const newDocRecord = {
        tenant_id: tenantInfo.id,
        tenant_name: tenantInfo.name,
        owner_id: ownerInfo.id || null,
        owner_name: ownerInfo.name,
        document_name: file.name,
        document_type: selectedType,
        status: "Pending",
        file_size_bytes: file.size,
        file_path: filePath,
        file_url: urlData.publicUrl,
      };

      const { data: insertedDoc, error: dbError } = await supabase
        .from("tenant_documents")
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
      if (cleanFilePath.includes("tenant-documents/")) {
        cleanFilePath = cleanFilePath.split("tenant-documents/")[1];
      }
      cleanFilePath = cleanFilePath.replace(/^\/+/, "");

      await supabase.storage.from("tenant-documents").remove([cleanFilePath]);

      const { error: dbError } = await supabase
        .from("tenant_documents")
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
  const storagePercent = Math.min(Math.round((totalMB / maxMB) * 100), 100);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    <div className="w-full font-sans text-[#2D1F1A]">
      {/* ========================================================= */}
      {/* MOBILE VIEW (Visible on small screens: md:hidden)          */}
      {/* ========================================================= */}
      <div className="block md:hidden space-y-4 px-3 py-4 max-w-md mx-auto w-full">
        {/* Top Banner Header */}
        <div className="bg-white rounded-2xl p-4 border border-[#E3D9CC] shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] text-[10px] font-semibold text-[#6E5D53]">
                <Folder className="w-3 h-3 text-[#C5924E]" />
                <span>Secure Vault</span>
              </div>
              <h1 className="text-xl font-serif font-bold text-[#2D1F1A]">
                Documents 📁
              </h1>
              <p className="text-[11px] text-[#6E5D53] leading-relaxed">
                Upload and manage your records securely for instant lease approvals.
              </p>
            </div>
            <button className="p-2.5 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl shrink-0">
              <Bell className="w-4 h-4 text-[#2D1F1A]" />
            </button>
          </div>
          <div className="bg-[#F8F5EE] border border-[#E3D9CC] p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-[#2D1F1A] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5924E]" /> Security Status
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Encrypted
            </span>
          </div>
        </div>

        {/* Metrics Grid (2x2) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] space-y-2">
            <div className="w-10 h-10 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#C5924E]">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#6E5D53] uppercase font-medium">Total Docs</p>
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">{totalDocs}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] space-y-2">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#6E5D53] uppercase font-medium">Verified</p>
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">{verifiedDocs}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] space-y-2">
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#6E5D53] uppercase font-medium">Pending</p>
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">{pendingDocs}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E3D9CC] space-y-2">
            <div className="w-10 h-10 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#C5924E]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#6E5D53] uppercase font-medium">Storage</p>
              <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">{totalMB} MB</h3>
            </div>
          </div>
        </div>

        {/* Upload Card Mobile */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3D9CC] border-dashed text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <div className="w-12 h-12 bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl flex items-center justify-center text-[#C5924E] mx-auto mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Upload File</h2>
          <p className="text-[11px] text-[#6E5D53] mt-0.5 mb-4">Select type and upload your document safely.</p>
          <div className="text-left space-y-1 mb-3">
            <label className="text-[10px] font-bold text-[#6E5D53] uppercase">Doc Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-[#2D1F1A] font-medium"
            >
              <option value="Identity Proof">Identity Proof</option>
              <option value="Income Proof">Income Proof</option>
              <option value="Address Proof">Address Proof</option>
              <option value="Financial Proof">Financial Proof</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" /> : <Plus className="w-4 h-4 text-[#C5924E]" />}
            {uploading ? "Uploading..." : "Browse & Upload"}
          </button>
        </div>

        {/* Documents List Mobile */}
        <div className="bg-white rounded-2xl border border-[#E3D9CC] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
            <h2 className="text-sm font-serif font-bold text-[#2D1F1A]">My Records</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[10px] px-2 py-1 bg-[#F8F5EE] border border-[#E3D9CC] rounded-lg font-bold text-[#6E5D53]"
            >
              <option value="All Documents">All</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          {loading ? (
            <div className="py-8 flex justify-center text-[#C5924E]"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : filteredDocuments.length === 0 ? (
            <p className="text-center text-xs text-[#6E5D53] py-6">No records found.</p>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => {
                const ext = doc.document_name.split(".").pop().toUpperCase();
                return (
                  <div key={doc.id} className="bg-[#F8F5EE]/50 border border-[#E3D9CC] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0">
                          {ext}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2D1F1A] truncate">{doc.document_name}</p>
                          <p className="text-[9px] text-[#6E5D53]">{formatFileSize(doc.file_size_bytes)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-[#E3D9CC]">
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-[#E3D9CC] rounded-lg">
                        <Eye className="w-3 h-3" />
                      </a>
                      <a href={doc.file_url} download className="p-1.5 bg-white border border-[#E3D9CC] rounded-lg">
                        <Download className="w-3 h-3" />
                      </a>
                      <button onClick={() => handleDelete(doc)} className="p-1.5 bg-white border border-red-200 text-rose-500 rounded-lg">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (Full screen width: hidden md:block w-full)   */}
      {/* ========================================================= */}
      <div className="hidden md:block space-y-6 px-6 py-6 w-full">
        {/* Top Banner Header */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3D9CC] shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] text-[11px] font-semibold text-[#6E5D53]">
                <Folder className="w-3.5 h-3.5 text-[#C5924E]" />
                <span>Secure Vault</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">
                Documents & Verification 📁
              </h1>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Upload and maintain your identity, income, and address proofs securely for instant lease approvals.
              </p>
            </div>
            <button className="p-3 bg-[#F8F5EE] hover:bg-[#F2ECE1] border border-[#E3D9CC] rounded-2xl transition shadow-xs cursor-pointer shrink-0">
              <Bell className="w-4 h-4 text-[#2D1F1A]" />
            </button>
          </div>

          <div className="bg-[#F8F5EE] border border-[#E3D9CC] p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C5924E]" />
              <span className="text-xs font-bold text-[#2D1F1A]">Security Status</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Encrypted & Verified
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] flex flex-col justify-between shadow-xs space-y-3">
            <div className="w-12 h-12 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl flex items-center justify-center text-[#C5924E]">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#6E5D53] font-medium uppercase tracking-wider">Total Documents</p>
              <h3 className="text-xl font-serif font-bold text-[#2D1F1A] mt-0.5">{totalDocs}</h3>
              <p className="text-[10px] text-[#A08E81] mt-0.5">Files uploaded</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] flex flex-col justify-between shadow-xs space-y-3">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#6E5D53] font-medium uppercase tracking-wider">Verified Records</p>
              <h3 className="text-xl font-serif font-bold text-[#2D1F1A] mt-0.5">{verifiedDocs}</h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Verified & approved</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] flex flex-col justify-between shadow-xs space-y-3">
            <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#6E5D53] font-medium uppercase tracking-wider">Pending Review</p>
              <h3 className="text-xl font-serif font-bold text-[#2D1F1A] mt-0.5">{pendingDocs}</h3>
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">Awaiting verification</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] flex flex-col justify-between shadow-xs space-y-3">
            <div className="w-12 h-12 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl flex items-center justify-center text-[#C5924E]">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#6E5D53] font-medium uppercase tracking-wider">Storage Used</p>
              <h3 className="text-xl font-serif font-bold text-[#2D1F1A] mt-0.5">{totalMB} MB</h3>
              <p className="text-[10px] text-[#A08E81] mt-0.5">of {maxMB} MB limit</p>
            </div>
          </div>
        </div>

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-6">
            {/* Upload Action Box */}
            <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] border-dashed flex flex-col items-center justify-center text-center shadow-xs">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />

              <div className="w-14 h-14 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl flex items-center justify-center text-[#C5924E] mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                Upload New Document
              </h2>
              <p className="text-xs text-[#6E5D53] mt-1 mb-5 leading-relaxed">
                Drag & drop your files securely or select a category below to begin the upload process.
              </p>

              <div className="w-full space-y-2 mb-5 text-left">
                <label className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wider">
                  Doc Type:
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-[#2D1F1A] font-medium focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="Identity Proof">Identity Proof</option>
                  <option value="Income Proof">Income Proof</option>
                  <option value="Address Proof">Address Proof</option>
                  <option value="Financial Proof">Financial Proof</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-[#2D1F1A] hover:bg-[#1a110e] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                    Uploading Document...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#C5924E]" /> Browse & Upload
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#A08E81] mt-3">
                Supported formats: PDF, JPG, PNG • Max file size: 10MB
              </p>
            </div>

            {/* Storage Capacity Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2D1F1A]">
                    Storage Capacity
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#C5924E] bg-[#F8F5EE] border border-[#E3D9CC] px-2.5 py-1 rounded-full">
                  {storagePercent}% Used
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-2">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      stroke="#F8F5EE"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      stroke="#C5924E"
                      strokeWidth="10"
                      strokeDasharray="326"
                      strokeDashoffset={326 - (326 * storagePercent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-serif font-bold text-[#2D1F1A]">
                      {storagePercent}%
                    </span>
                    <span className="text-[10px] text-[#6E5D53] font-medium">
                      {totalMB} / {maxMB} MB
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="w-full bg-[#F8F5EE] h-2 rounded-full overflow-hidden border border-[#E3D9CC]">
                  <div
                    className="bg-[#C5924E] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <button className="w-full py-2.5 bg-[#F8F5EE] hover:bg-[#F2ECE1] border border-[#E3D9CC] text-[#2D1F1A] text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <HardDrive className="w-3.5 h-3.5 text-[#C5924E]" /> Manage Storage Tier
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            {/* Uploaded Records Card */}
            <div className="bg-white rounded-3xl border border-[#E3D9CC] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1]">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
                    Uploaded Records
                  </h2>
                  <p className="text-xs text-[#6E5D53] mt-0.5">View, inspect, or remove your legal files</p>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-[#F8F5EE] border border-[#E3D9CC] rounded-xl text-[#6E5D53] font-bold focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="All Documents">All Documents</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Rejected">Rejected Only</option>
                </select>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center text-[#C5924E]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12 px-4 bg-[#F8F5EE]/50 rounded-2xl border border-dashed border-[#E3D9CC]">
                  <FileText className="w-8 h-8 text-[#C5924E] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-[#2D1F1A]">No documents found matching this filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => {
                    const ext = doc.document_name.split(".").pop().toUpperCase();
                    return (
                      <div key={doc.id} className="bg-[#F8F5EE]/50 border border-[#E3D9CC] rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                              {ext}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#2D1F1A] truncate">{doc.document_name}</p>
                              <p className="text-[10px] text-[#6E5D53]">{doc.document_type} • {formatFileSize(doc.file_size_bytes)}</p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                              doc.status === "Verified"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : doc.status === "Rejected"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {doc.status === "Verified" && "✓ Verified"}
                            {doc.status === "Pending" && "🕒 Pending"}
                            {doc.status === "Rejected" && "✕ Rejected"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC]">
                          <span className="text-[10px] text-[#A08E81]">Uploaded {formatDate(doc.uploaded_at)}</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white hover:bg-[#E3D9CC] border border-[#E3D9CC] text-[#2D1F1A] rounded-xl transition shadow-xs"
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={doc.file_url}
                              download
                              className="p-2 bg-white hover:bg-[#E3D9CC] border border-[#E3D9CC] text-[#2D1F1A] rounded-xl transition shadow-xs"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDelete(doc)}
                              className="p-2 bg-white hover:bg-red-50 border border-[#E3D9CC] hover:border-red-200 text-rose-500 rounded-xl transition shadow-xs cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Security & Guidelines Sidebar */}
            <div className="bg-white rounded-3xl border border-[#E3D9CC] p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2D1F1A] mb-1">
                  Security & Guidelines
                </h3>
                <p className="text-xs text-[#6E5D53]">Important recommendations for submitting valid credentials.</p>

                <div className="space-y-3 mt-4 text-xs text-[#6E5D53]">
                  <div className="flex gap-3 items-start bg-[#F8F5EE] p-3.5 rounded-2xl border border-[#E3D9CC]">
                    <div className="p-2 bg-white border border-[#E3D9CC] text-[#C5924E] rounded-xl shrink-0 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D1F1A] text-xs mb-0.5">Official Titles Only</h4>
                      <p className="text-[11px] leading-relaxed">Upload official tax deeds, registration certificates, and ID copies.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-[#F8F5EE] p-3.5 rounded-2xl border border-[#E3D9CC]">
                    <div className="p-2 bg-white border border-[#E3D9CC] text-[#C5924E] rounded-xl shrink-0 shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D1F1A] text-xs mb-0.5">Enterprise Security</h4>
                      <p className="text-[11px] leading-relaxed">All files are stored in isolated encrypted cloud buckets restricted to authorized admin review.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
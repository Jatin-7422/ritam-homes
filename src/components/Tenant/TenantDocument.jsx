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

  // Fetch current user details & documents
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

      // Fetch linked property owner info if available from user metadata
      const assignedOwnerId = user.user_metadata?.owner_id || null;
      const assignedOwnerName =
        user.user_metadata?.owner_name || "Property Owner";
      setOwnerInfo({ id: assignedOwnerId, name: assignedOwnerName });

      // Fetch existing documents for this tenant
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

  // Upload handler to Supabase bucket "tenant-documents"
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    try {
      setUploading(true);

      // Clean file path structure inside 'tenant-documents' bucket
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = `${tenantInfo.id}/${fileName}`;

      // 1. Upload file to dedicated Supabase Storage Bucket
      const { error: storageError } = await supabase.storage
        .from("tenant-documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (storageError) throw storageError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("tenant-documents")
        .getPublicUrl(filePath);

      // 2. Insert metadata into tenant_documents table
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

  // Delete Document from both Supabase Storage Bucket and Database
  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete ${doc.document_name}?`)) return;

    try {
      // 1. Sanitize file path (extract relative storage path if full URL/bucket prefix exists)
      let cleanFilePath = doc.file_path;
      if (cleanFilePath.includes("tenant-documents/")) {
        cleanFilePath = cleanFilePath.split("tenant-documents/")[1];
      }
      cleanFilePath = cleanFilePath.replace(/^\/+/, ""); // Remove leading slashes

      // 2. Delete file from Storage Bucket
      const { error: storageError } = await supabase.storage
        .from("tenant-documents")
        .remove([cleanFilePath]);

      if (storageError) {
        console.error("Storage removal issue:", storageError.message);
      }

      // 3. Delete metadata row from Database
      const { error: dbError } = await supabase
        .from("tenant_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      // 4. Update UI State
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      alert("Error deleting file: " + err.message);
    }
  };

  // Filtered Documents
  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter === "Verified") return doc.status === "Verified";
    if (statusFilter === "Pending") return doc.status === "Pending";
    if (statusFilter === "Rejected") return doc.status === "Rejected";
    return true;
  });

  // Metric Computations
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === "Verified").length;
  const pendingDocs = documents.filter((d) => d.status === "Pending").length;
  const totalSizeBytes = documents.reduce(
    (acc, d) => acc + (d.file_size_bytes || 0),
    0,
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
    <div className="min-h-screen bg-[#F8F5EE] text-[#2D1F1A] px-4 md:px-10 py-8 font-sans">
      {/* Top Bar Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            Documents
          </h1>
          <p className="text-sm text-[#6E5D53] mt-1">
            Store and manage your important documents securely.
          </p>
        </div>
        <button className="p-2.5 bg-white border border-[#EADBCE] rounded-xl hover:bg-[#FAF7F2] transition shadow-sm">
          <Bell className="w-5 h-5 text-[#2D1F1A]" />
        </button>
      </div>

      {/* 📊 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#F6F2EA] rounded-xl flex items-center justify-center text-[#C5924E]">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6E5D53]">Total Documents</p>
            <h3 className="text-2xl font-serif font-bold">{totalDocs}</h3>
            <p className="text-[11px] text-[#A09085]">Files uploaded</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6E5D53]">Verified Documents</p>
            <h3 className="text-2xl font-serif font-bold">{verifiedDocs}</h3>
            <p className="text-[11px] text-[#A09085]">Verified & approved</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6E5D53]">Pending Review</p>
            <h3 className="text-2xl font-serif font-bold">{pendingDocs}</h3>
            <p className="text-[11px] text-[#A09085]">Awaiting verification</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#F6F2EA] rounded-xl flex items-center justify-center text-[#C5924E]">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6E5D53]">Storage Used</p>
            <h3 className="text-2xl font-serif font-bold">{totalMB} MB</h3>
            <p className="text-[11px] text-[#A09085]">of {maxMB} MB used</p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Upload Box */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#EADBCE] border-dashed flex flex-col items-center justify-center text-center shadow-sm relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />

          <div className="w-14 h-14 bg-[#FAF7F2] border border-[#EADBCE] rounded-full flex items-center justify-center text-[#C5924E] mb-4">
            <Upload className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
            Upload New Document
          </h2>
          <p className="text-xs text-[#6E5D53] mt-1 mb-4">
            Drag & drop your file here or click the button below
          </p>

          <div className="flex items-center gap-3 mb-6">
            <label className="text-xs font-semibold text-[#6E5D53]">
              Doc Type:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg text-[#2D1F1A] focus:outline-none"
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
            className="px-6 py-2.5 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Choose File
              </>
            )}
          </button>

          <p className="text-[11px] text-[#A09085] mt-4">
            Supported formats: PDF, JPG, PNG • Max file size: 10MB
          </p>
        </div>

        {/* Storage Usage Circle Dial */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] flex flex-col justify-between shadow-sm">
          <h3 className="text-base font-serif font-bold text-[#2D1F1A] mb-4">
            Storage Usage
          </h3>

          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="#F6F2EA"
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
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-serif font-bold">
                  {storagePercent}%
                </span>
                <span className="text-[10px] text-[#A09085]">
                  {totalMB} MB / {maxMB} MB
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="w-full bg-[#F6F2EA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C5924E] h-full transition-all duration-300"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <button className="w-full py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2D1F1A] hover:bg-[#F0E6D8] transition flex items-center justify-center gap-2">
              <HardDrive className="w-4 h-4 text-[#C5924E]" /> Manage Storage
            </button>
          </div>
        </div>
      </div>

      {/* 📄 Documents Table & Tips Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Container */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EADBCE] p-6 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif font-bold text-[#2D1F1A]">
              Your Documents
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-[#6E5D53] focus:outline-none"
            >
              <option value="All Documents">All Documents</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-[#C5924E]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-[#A09085] text-xs">
              No documents found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-[#F0E6D8] text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
                  <th className="pb-3">Document Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Uploaded On</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EA] text-xs">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF7F2] transition">
                    <td className="py-3.5 font-medium text-[#2D1F1A] flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-[10px] font-bold">
                        {doc.document_name.split(".").pop().toUpperCase()}
                      </div>
                      <span className="truncate max-w-[150px]">
                        {doc.document_name}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#6E5D53]">
                      {doc.document_type}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          doc.status === "Verified"
                            ? "bg-emerald-50 text-emerald-700"
                            : doc.status === "Rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {doc.status === "Verified" && "✓ Verified"}
                        {doc.status === "Pending" && "🕒 Pending"}
                        {doc.status === "Rejected" && "✕ Rejected"}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#6E5D53]">
                      {formatDate(doc.uploaded_at)}
                    </td>
                    <td className="py-3.5 text-[#6E5D53]">
                      {formatFileSize(doc.file_size_bytes)}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2 text-[#6E5D53]">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:text-[#2D1F1A] transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="p-1.5 hover:text-[#2D1F1A] transition"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1.5 hover:text-red-600 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 💡 Document Tips Sidebar */}
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-[#2D1F1A] mb-6">
              Document Tips
            </h3>

            <div className="space-y-5 text-xs text-[#6E5D53]">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-amber-50 text-[#C5924E] rounded-xl shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">
                  Only upload genuine documents. Fake documents will be
                  rejected.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 bg-amber-50 text-[#C5924E] rounded-xl shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">
                  Your documents are encrypted and stored securely.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 bg-amber-50 text-[#C5924E] rounded-xl shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">
                  Accepted formats: PDF, JPG, PNG. Max file size: 10MB.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 bg-amber-50 text-[#C5924E] rounded-xl shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">
                  Verification usually takes 1-2 working days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

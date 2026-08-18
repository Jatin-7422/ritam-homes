import React from "react";
import { FileText, Sparkles } from "lucide-react";

export default function TenantDocuments() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          Tenant Documents 📄
        </h1>
        <p className="text-sm text-[#6E5D53] mt-1">
          Access your lease agreements, rent receipts, and verification
          documents.
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="text-center py-24 bg-white rounded-3xl border border-[#EADBCE] shadow-sm p-8 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] text-xs font-bold rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>

          <h3 className="text-2xl font-serif font-bold text-[#2D1F1A] mb-3">
            Document Vault Module
          </h3>

          <p className="text-sm text-[#6E5D53] leading-relaxed mb-6">
            We are working on a secure document vault. Soon, you will be able to
            view your signed lease agreements, download receipts, and submit
            verification documents directly from your dashboard.
          </p>

          <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs text-[#6E5D53] font-medium">
            Stay tuned! This feature will be available in the upcoming update.
          </div>
        </div>
      </div>
    </div>
  );
}

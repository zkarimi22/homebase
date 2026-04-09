"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FadeIn from "@/components/FadeIn";
import { useAuth } from "@/lib/auth";
import { FileText, Upload, X, Download, Trash2, Loader2 } from "lucide-react";

const categories = ["all", "mortgage", "insurance", "tax", "receipt", "inspection", "warranty", "other"];

type Doc = {
  documentId: string;
  name: string;
  category: string;
  fileType: string;
  sizeKb: number;
  s3Key: string;
  uploadedAt: string;
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const userId = user?.userId || "default";
  const [filter, setFilter] = useState("all");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("other");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?userId=${userId}`);
      const data = await res.json();
      setDocs(data.documents || []);
    } catch {
      // Fall back to empty
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const uploadFiles = async (files: File[], category: string) => {
    setUploading(true);
    try {
      for (const file of files) {
        // 1. Get presigned URL
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            category,
          }),
        });
        const { uploadUrl } = await res.json();

        // 2. Upload to S3
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      }
      await fetchDocs();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      setPendingFiles([]);
      setShowCategoryPicker(false);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setPendingFiles(fileArray);
    setShowCategoryPicker(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDownload = async (doc: Doc) => {
    const res = await fetch("/api/documents/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s3Key: doc.s3Key }),
    });
    const { downloadUrl } = await res.json();
    window.open(downloadUrl, "_blank");
  };

  const handleDelete = async (doc: Doc) => {
    await fetch("/api/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, documentId: doc.documentId }),
    });
    await fetchDocs();
  };

  const filtered =
    filter === "all" ? docs : docs.filter((d) => d.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 md:px-10 md:py-14">
      <FadeIn>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1">Documents</h1>
        <p className="text-black/35 text-base mb-12 font-medium">
          Securely store and organize your important files.
        </p>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-full font-semibold transition-all ${
                filter === cat
                  ? "bg-black text-white"
                  : "bg-white border border-black/[0.06] text-black/40 hover:text-black/60 hover:border-black/12"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Upload zone */}
      <FadeIn delay={0.15}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 mb-10 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-[#3B5EFB] bg-blue-50/50"
              : "border-black/10 bg-white hover:border-black/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#3B5EFB]" />
              <span className="text-sm text-black/50 font-medium">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto text-black/20 mb-2" />
              <p className="text-sm text-black/35 font-medium">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-black/20 mt-1">
                PDF, images, documents — any file type
              </p>
            </>
          )}
        </div>
      </FadeIn>

      {/* Category picker modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                Select category for {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}
              </h3>
              <button
                onClick={() => { setShowCategoryPicker(false); setPendingFiles([]); }}
                className="text-black/30 hover:text-black/60"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {categories.filter((c) => c !== "all").map((cat) => (
                <button
                  key={cat}
                  onClick={() => setUploadCategory(cat)}
                  className={`px-3 py-2.5 text-xs uppercase tracking-wider rounded-xl font-semibold transition-all ${
                    uploadCategory === cat
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-black/40 hover:bg-neutral-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-xs text-black/30 mb-4">
              {pendingFiles.map((f) => f.name).join(", ")}
            </div>
            <button
              onClick={() => uploadFiles(pendingFiles, uploadCategory)}
              disabled={uploading}
              className="w-full py-3 bg-[#3B5EFB] text-white text-sm font-semibold rounded-xl hover:bg-[#2D4DE0] transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-black/20" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-black/10 mb-3" />
          <p className="text-sm text-black/30 font-medium">No documents yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc, i) => (
            <FadeIn key={doc.documentId} delay={0.03 * i}>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-black/[0.06] rounded-xl hover:border-black/10 transition-all group">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={17} className="text-black/25" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{doc.name}</p>
                  <p className="text-xs text-black/30">
                    {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {doc.sizeKb > 0 && <> &middot; {(doc.sizeKb / 1024).toFixed(1)} MB</>}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <span className="hidden sm:inline text-[11px] px-2.5 py-0.5 rounded-md bg-neutral-100 text-black/35 font-medium">
                    {doc.category}
                  </span>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-lg text-black/20 hover:text-black/60 hover:bg-neutral-100 transition-all md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 rounded-lg text-black/20 hover:text-red-500 hover:bg-red-50 transition-all md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <FadeIn delay={0.3}>
        <p className="text-xs text-black/20 mt-8 font-medium">
          {filtered.length} document{filtered.length !== 1 && "s"}
        </p>
      </FadeIn>
    </div>
  );
}

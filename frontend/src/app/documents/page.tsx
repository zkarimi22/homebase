"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { documents } from "@/lib/mock-data";
import { FileText, Upload } from "lucide-react";

const categories = ["all", "mortgage", "insurance", "tax", "receipt", "inspection", "warranty"];

export default function DocumentsPage() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? documents : documents.filter((d) => d.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-10 py-14">
      <FadeIn>
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">Documents</h1>
        <p className="text-black/35 text-base mb-12 font-medium">
          All your important files, semantically organized.
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

      {/* Upload stub */}
      <FadeIn delay={0.15}>
        <div className="bg-white border border-dashed border-black/10 rounded-2xl p-10 mb-10 text-center">
          <Upload size={20} className="mx-auto text-black/20 mb-2" />
          <p className="text-sm text-black/25 font-medium">
            Drop files here or click to upload
          </p>
        </div>
      </FadeIn>

      {/* Document list */}
      <div className="space-y-2">
        {filtered.map((doc, i) => (
          <FadeIn key={doc.id} delay={0.04 * i}>
            <div className="flex items-center justify-between p-4 bg-white border border-black/[0.06] rounded-xl hover:border-black/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <FileText size={17} className="text-black/25" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold">{doc.name}</p>
                  <p className="text-xs text-black/30">
                    {new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    &middot; {(doc.size_kb / 1000).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-neutral-100 text-black/35 font-medium">
                  {doc.category}
                </span>
                <button className="text-xs text-black/25 hover:text-black/60 transition-colors font-medium">
                  Download
                </button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <p className="text-xs text-black/20 mt-8 font-medium">
          {filtered.length} document{filtered.length !== 1 && "s"}
        </p>
      </FadeIn>
    </div>
  );
}

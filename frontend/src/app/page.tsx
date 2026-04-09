"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { useAuth } from "@/lib/auth";
import { useChat } from "@ai-sdk/react";
import {
  property,
  financeSummary,
  documents,
  projects,
  neighborhoodFeed,
  obligations,
  profile,
} from "@/lib/mock-data";
import {
  Search,
  ArrowRight,
  FileText,
  DollarSign,
  Hammer,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Receipt,
  CalendarDays,
  Trash2,
  Recycle,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ListTodo,
  Home,
  Bed,
  Bath,
  Ruler,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";

type DocResult = { documentId: string; name: string; category: string };

const suggestions = [
  "Spring checklist",
  "Cancel a subscription",
  "Recommended projects",
  "Equipment tips",
  "Recommended services",
];

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

const today = new Date();
const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
const monthDay = today.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
});

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.userId || "default";
  const [query, setQuery] = useState("");
  const [docResults, setDocResults] = useState<DocResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const displayName = user?.name?.split(" ")[0] || profile.name.split(" ")[0];

  const [chatInput, setChatInput] = useState("");
  const { messages, sendMessage, status } = useChat({});
  const chatLoading = status === "streaming" || status === "submitted";

  // Document search autocomplete
  const searchDocs = useCallback(async (q: string) => {
    if (q.length < 2) { setDocResults([]); return; }
    try {
      const res = await fetch(`/api/documents/search?userId=${userId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setDocResults(data.results || []);
      setShowResults(true);
    } catch { setDocResults([]); }
  }, [userId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDocs(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchDocs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // If no doc matches, open AI chat
    if (docResults.length === 0) {
      setShowChat(true);
      setShowResults(false);
      sendMessage({ text: query });
      setChatInput("");
    }
  };
  const activeProjects = projects.filter((p) => p.status === "in_progress");
  const plannedProjects = projects.filter((p) => p.status === "planned");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const upcomingEvents = neighborhoodFeed
    .filter((n) => new Date(n.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const recentDocs = documents.slice(0, 4);

  const feedIcons: Record<string, React.ReactNode> = {
    garbage: <Trash2 size={14} />,
    recycling: <Recycle size={14} />,
    alert: <AlertTriangle size={14} />,
    community: <Users size={14} />,
  };

  return (
    <div className="max-w-5xl mx-auto px-10 py-14">
      {/* Greeting */}
      <FadeIn>
        <h1 className="text-[2.5rem] leading-tight text-black/25 font-medium mb-1">
          Welcome back, {displayName}.
        </h1>
        <h2 className="text-[2.5rem] leading-tight font-extrabold tracking-tight">
          It&apos;s {dayName}, {monthDay}.
          <br />
          How can we help?
        </h2>
      </FadeIn>

      {/* Search with autocomplete */}
      <FadeIn delay={0.05}>
        <div className="mt-10 mb-3 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-white border border-black/[0.06] rounded-2xl px-5 py-4 transition-all focus-within:border-black/15 focus-within:shadow-sm">
              <Search size={18} className="text-black/20 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Ask a question, find a file, or make a request"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-black/25"
              />
              <button type="submit" className="text-black/15 hover:text-black/40 transition-colors ml-3">
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          {/* Autocomplete dropdown */}
          {showResults && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/[0.06] rounded-xl shadow-lg overflow-hidden z-40">
              {docResults.length > 0 ? (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] text-black/30 uppercase tracking-widest font-semibold">
                    Documents
                  </p>
                  {docResults.map((doc) => (
                    <Link
                      key={doc.documentId}
                      href="/documents"
                      onClick={() => { setShowResults(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <FileText size={14} className="text-black/25" />
                      <span className="text-sm">{doc.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-black/30 ml-auto">
                        {doc.category}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-black/[0.04]" />
                </>
              ) : null}
              <button
                onClick={() => { setShowChat(true); setShowResults(false); sendMessage({ text: query }); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors w-full text-left"
              >
                <Sparkles size={14} className="text-[#3B5EFB]" />
                <span className="text-sm text-[#3B5EFB] font-medium">
                  Ask AI: &ldquo;{query}&rdquo;
                </span>
              </button>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Suggestions */}
      <FadeIn delay={0.08}>
        <div className="mb-14">
          <p className="text-[11px] text-black/30 mb-2.5 uppercase tracking-widest font-semibold">
            Suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setShowChat(true); sendMessage({ text: s }); }}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full bg-white border border-black/[0.06] text-black/50 hover:border-black/12 hover:text-black/70 transition-all font-medium"
              >
                <span className="opacity-40">&#10038;</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* AI Chat panel */}
      {showChat && (
        <FadeIn>
          <div className="mb-14 bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04]">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#3B5EFB]" />
                <span className="text-xs font-semibold text-black/50">Homebase AI</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-black/20 hover:text-black/50">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-5 space-y-4">
              {messages.map((m) => {
                const text = m.parts
                  ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p) => p.text)
                  .join("") || "";
                return (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#3B5EFB] text-white"
                          : "bg-neutral-100 text-black/70"
                      }`}
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 px-4 py-2.5 rounded-2xl">
                    <Loader2 size={14} className="animate-spin text-black/30" />
                  </div>
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim() || chatLoading) return;
                sendMessage({ text: chatInput });
                setChatInput("");
              }}
              className="border-t border-black/[0.04] p-3 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask a follow-up..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-neutral-50 rounded-xl text-sm outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2.5 bg-[#3B5EFB] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </FadeIn>
      )}

      {/* Home Details */}
      <FadeIn delay={0.1}>
        <div className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold tracking-tight">
              Home details
            </h3>
            <Link
              href="/finances"
              className="text-xs text-black/30 hover:text-black/60 transition-colors font-medium"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                icon: <DollarSign size={15} />,
                label: "Monthly Expenses",
                value: `$${fmt(obligations.reduce((s, o) => s + o.amount, 0))}`,
                sub: "Monthly Avg.",
              },
              {
                icon: <TrendingUp size={15} />,
                label: "Home Value",
                value: `$${fmt(financeSummary.home_value)}`,
                sub: "Estimated",
              },
              {
                icon: <ShieldCheck size={15} />,
                label: "Equity",
                value: `$${fmt(financeSummary.equity)}`,
                sub: `${Math.round((financeSummary.equity / financeSummary.home_value) * 100)}% of value`,
              },
              {
                icon: <Receipt size={15} />,
                label: "Insurance",
                value: `$${fmt(financeSummary.insurance_annual)}`,
                sub: "Annual",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white border border-black/[0.06] rounded-2xl p-5"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-black/35">
                    {card.icon}
                  </div>
                  <span className="text-[13px] font-semibold">{card.label}</span>
                </div>
                <p className="text-2xl font-extrabold tracking-tight mb-0.5">
                  {card.value}
                </p>
                <p className="text-xs text-black/30 font-medium">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Property snapshot */}
      <FadeIn delay={0.15}>
        <div className="mb-14">
          <h3 className="text-lg font-extrabold tracking-tight mb-5">
            Your property
          </h3>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                <Home size={17} className="text-black/35" />
              </div>
              <div>
                <p className="text-sm font-bold">{property.address}</p>
                <p className="text-xs text-black/30 font-medium">
                  {property.city}, {property.state} {property.zip}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-6">
              {[
                { icon: <Home size={13} />, label: "Type", value: property.type },
                { icon: <CalendarDays size={13} />, label: "Year Built", value: String(property.year_built) },
                { icon: <Ruler size={13} />, label: "Sq Ft", value: fmt(property.sqft) },
                { icon: <Bed size={13} />, label: "Bedrooms", value: String(property.bedrooms) },
                { icon: <Bath size={13} />, label: "Bathrooms", value: String(property.bathrooms) },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-black/25">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[11px] text-black/30 mb-0.5 font-medium uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Two-column: Documents + Projects */}
      <div className="grid grid-cols-2 gap-6 mb-14">
        {/* Recent Documents */}
        <FadeIn delay={0.2}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold tracking-tight">
                Recent documents
              </h3>
              <Link
                href="/documents"
                className="text-xs text-black/30 hover:text-black/60 transition-colors font-medium"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3.5 bg-white border border-black/[0.06] rounded-xl hover:border-black/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-black/25" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{doc.name}</p>
                    <p className="text-xs text-black/30">
                      {new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-black/35 font-medium">
                    {doc.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Projects */}
        <FadeIn delay={0.22}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold tracking-tight">Projects</h3>
              <Link
                href="/projects"
                className="text-xs text-black/30 hover:text-black/60 transition-colors font-medium"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white border border-black/[0.06] rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <p className="text-xl font-extrabold">{completedProjects.length}</p>
                <p className="text-[11px] text-black/30 font-medium">Completed</p>
              </div>
              <div className="bg-white border border-black/[0.06] rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <p className="text-xl font-extrabold">{activeProjects.length}</p>
                <p className="text-[11px] text-black/30 font-medium">In Progress</p>
              </div>
              <div className="bg-white border border-black/[0.06] rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
                  <ListTodo size={16} className="text-blue-500" />
                </div>
                <p className="text-xl font-extrabold">{plannedProjects.length}</p>
                <p className="text-[11px] text-black/30 font-medium">Planned</p>
              </div>
            </div>
            <div className="space-y-2">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3.5 bg-white border border-black/[0.06] rounded-xl"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Hammer size={16} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden max-w-24">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${Math.round((p.spent / p.budget) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-black/30 font-medium">
                        ${fmt(p.spent)} / ${fmt(p.budget)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Neighborhood */}
      <FadeIn delay={0.25}>
        <div className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold tracking-tight">
              Neighborhood updates
            </h3>
            <Link
              href="/neighborhood"
              className="text-xs text-black/30 hover:text-black/60 transition-colors font-medium"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white border border-black/[0.06] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black/30">
                    {feedIcons[item.type]}
                  </div>
                  <span className="text-[11px] text-black/25 font-medium">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="text-[13px] font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-black/35 leading-relaxed line-clamp-2">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

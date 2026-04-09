"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { projects } from "@/lib/mock-data";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  in_progress: "bg-amber-50 text-amber-600",
  planned: "bg-blue-50 text-blue-500",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  planned: "Planned",
};

const filters = ["all", "in_progress", "planned", "completed"];

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="max-w-5xl mx-auto px-10 py-14">
      <FadeIn>
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">Projects</h1>
        <p className="text-black/35 text-base mb-12 font-medium">
          Track every home improvement from plan to completion.
        </p>
      </FadeIn>

      {/* Summary */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-1">
              Total Budget
            </p>
            <p className="text-2xl font-extrabold tracking-tight">${fmt(totalBudget)}</p>
          </div>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-1">
              Total Spent
            </p>
            <p className="text-2xl font-extrabold tracking-tight">${fmt(totalSpent)}</p>
          </div>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-1">
              Projects
            </p>
            <p className="text-2xl font-extrabold tracking-tight">{projects.length}</p>
          </div>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.15}>
        <div className="flex gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-full font-semibold transition-all ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-white border border-black/[0.06] text-black/40 hover:text-black/60 hover:border-black/12"
              }`}
            >
              {f === "all" ? "All" : statusLabels[f]}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Project list */}
      <div className="space-y-2">
        {filtered.map((project, i) => (
          <FadeIn key={project.id} delay={0.04 * i}>
            <div
              className="bg-white border border-black/[0.06] rounded-xl cursor-pointer hover:border-black/10 transition-all"
              onClick={() =>
                setExpanded(expanded === project.id ? null : project.id)
              }
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${
                      statusStyles[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </span>
                  <p className="text-[13px] font-semibold">{project.title}</p>
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-sm font-bold">
                    ${fmt(project.spent)}{" "}
                    <span className="text-black/25 font-medium">/ ${fmt(project.budget)}</span>
                  </p>
                  <span className="text-black/15 text-sm">
                    {expanded === project.id ? "−" : "+"}
                  </span>
                </div>
              </div>

              {expanded === project.id && (
                <div className="px-5 pb-5 pt-1 border-t border-black/[0.04]">
                  <p className="text-sm text-black/40 leading-relaxed mb-3">
                    {project.description}
                  </p>
                  <div className="flex gap-5 text-[11px] text-black/30 font-medium">
                    {project.started_at && (
                      <span>
                        Started{" "}
                        {new Date(project.started_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    )}
                    {project.completed_at && (
                      <span>
                        Completed{" "}
                        {new Date(project.completed_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    )}
                    <span className="capitalize">Priority: {project.priority}</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden max-w-xs">
                    <div
                      className="h-full bg-black rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((project.spent / project.budget) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

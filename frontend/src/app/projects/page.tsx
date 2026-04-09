"use client";

import { useState, useEffect, useCallback } from "react";
import FadeIn from "@/components/FadeIn";
import { useAuth } from "@/lib/auth";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

type Project = {
  projectId: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
  spent: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

const statusFlow: Record<string, { next: string; label: string; icon: React.ReactNode; color: string }> = {
  planned: {
    next: "in_progress",
    label: "Planned",
    icon: <ListTodo size={14} />,
    color: "bg-blue-50 text-blue-600",
  },
  in_progress: {
    next: "completed",
    label: "In Progress",
    icon: <Clock size={14} />,
    color: "bg-amber-50 text-amber-600",
  },
  completed: {
    next: "planned",
    label: "Completed",
    icon: <CheckCircle2 size={14} />,
    color: "bg-emerald-50 text-emerald-600",
  },
};

const priorities = ["low", "medium", "high"];
const filters = ["all", "planned", "in_progress", "completed"];

export default function ProjectsPage() {
  const { user } = useAuth();
  const userId = user?.userId || "default";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newBudget, setNewBudget] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects?userId=${userId}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        budget: Number(newBudget) || 0,
      }),
    });
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setNewBudget("");
    setCreating(false);
    setShowCreate(false);
    await fetchProjects();
  };

  const advanceStatus = async (project: Project) => {
    const nextStatus = statusFlow[project.status]?.next || "planned";
    await fetch(`/api/projects/${project.projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: nextStatus }),
    });
    await fetchProjects();
  };

  const deleteProject = async (project: Project) => {
    await fetch(`/api/projects/${project.projectId}?userId=${userId}`, {
      method: "DELETE",
    });
    await fetchProjects();
  };

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const counts = {
    planned: projects.filter((p) => p.status === "planned").length,
    in_progress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 md:px-10 md:py-14">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1">Projects</h1>
            <p className="text-black/35 text-sm sm:text-base font-medium">
              Track every home improvement from plan to completion.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#3B5EFB] text-white text-sm font-semibold rounded-xl hover:bg-[#2D4DE0] transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            New project
          </button>
        </div>
      </FadeIn>

      {/* Status counts */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {(["planned", "in_progress", "completed"] as const).map((s) => (
            <div
              key={s}
              className="bg-white border border-black/[0.06] rounded-2xl p-5 text-center"
            >
              <div
                className={`w-9 h-9 rounded-lg ${statusFlow[s].color} flex items-center justify-center mx-auto mb-2`}
              >
                {statusFlow[s].icon}
              </div>
              <p className="text-2xl font-extrabold">{counts[s]}</p>
              <p className="text-[11px] text-black/30 font-medium">{statusFlow[s].label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.12}>
        <div className="flex gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-full font-semibold transition-all ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-white border border-black/[0.06] text-black/40 hover:text-black/60"
              }`}
            >
              {f === "all" ? "All" : statusFlow[f]?.label || f}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <form
            onSubmit={createProject}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">New project</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="text-black/30 hover:text-black/60">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Project title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm outline-none focus:border-black/25 transition-colors mb-3"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm outline-none focus:border-black/25 transition-colors mb-3 resize-none"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-black/40 mb-1 uppercase tracking-wider">
                  Priority
                </label>
                <div className="flex gap-1.5">
                  {priorities.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-2 text-xs rounded-lg font-semibold capitalize transition-all ${
                        newPriority === p
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-black/40"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black/40 mb-1 uppercase tracking-wider">
                  Budget
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-black/10 rounded-lg text-sm outline-none focus:border-black/25 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-[#3B5EFB] text-white text-sm font-semibold rounded-xl hover:bg-[#2D4DE0] transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create project"}
            </button>
          </form>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-black/20" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ListTodo size={32} className="mx-auto text-black/10 mb-3" />
          <p className="text-sm text-black/30 font-medium">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project, i) => {
            const sf = statusFlow[project.status];
            return (
              <FadeIn key={project.projectId} delay={0.03 * i}>
                <div className="bg-white border border-black/[0.06] rounded-xl hover:border-black/10 transition-all group">
                  <div className="flex items-center gap-3 px-5 py-4">
                    {/* Status advance button */}
                    <button
                      onClick={() => advanceStatus(project)}
                      className={`w-8 h-8 rounded-lg ${sf.color} flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform`}
                      title={`Move to ${statusFlow[project.status]?.next}`}
                    >
                      {project.status === "completed" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <p
                          className={`text-[13px] font-semibold truncate ${
                            project.status === "completed" ? "line-through text-black/30" : ""
                          }`}
                        >
                          {project.title}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 ${sf.color}`}>
                          {sf.label}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 ${
                            project.priority === "high"
                              ? "bg-red-50 text-red-500"
                              : project.priority === "medium"
                              ? "bg-amber-50 text-amber-500"
                              : "bg-neutral-100 text-black/35"
                          }`}
                        >
                          {project.priority}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-xs text-black/35 mt-0.5 truncate">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {project.budget > 0 && (
                      <p className="text-sm font-bold text-black/50">
                        ${project.budget.toLocaleString()}
                      </p>
                    )}

                    <button
                      onClick={() => deleteProject(project)}
                      className="p-1.5 rounded-lg text-black/15 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}

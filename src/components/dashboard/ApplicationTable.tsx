'use client'

import { useState } from "react";
import { FitScoreBadge } from "./FitScoreBadge";
import { StatusBadge } from "./StatusBadge";
import { ResumesDiffView } from "./ResumesDiffView";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  platform: string;
  fitScore: number | null;
  fitReasoning: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  status: string;
  jobUrl: string;
  originalResume: string | null;
  tailoredResume: string | null;
  coverLetter: string | null;
  appliedAt: string | null;
  createdAt: string;
}

const STATUS_ORDER = ["discovered", "scored", "tailored", "ready", "applied", "interviewing", "rejected"];

export function ApplicationTable({ apps }: { apps: Application[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"score" | "date">("date");

  const filtered = apps
    .filter((a) => filter === "all" || a.status === filter)
    .sort((a, b) =>
      sort === "score"
        ? (b.fitScore ?? 0) - (a.fitScore ?? 0)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", ...STATUS_ORDER].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              filter === s
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            )}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-600">Sort:</span>
          <button
            onClick={() => setSort("date")}
            className={cn(
              "px-2 py-1 rounded text-xs",
              sort === "date" ? "text-white bg-zinc-700" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Date
          </button>
          <button
            onClick={() => setSort("score")}
            className={cn(
              "px-2 py-1 rounded text-xs",
              sort === "score" ? "text-white bg-zinc-700" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Score
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-6"></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role / Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Platform</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Fit</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 text-sm">
                  No applications yet. Start an agent run to discover jobs.
                </td>
              </tr>
            )}
            {filtered.map((app) => (
              <>
                <tr
                  key={app.id}
                  className={cn(
                    "border-b border-zinc-800/50 transition-colors cursor-pointer",
                    expanded === app.id ? "bg-zinc-900" : "hover:bg-zinc-900/50"
                  )}
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                >
                  <td className="px-4 py-3 text-zinc-600">
                    {expanded === app.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{app.jobTitle}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{app.company} {app.location ? `· ${app.location}` : ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-400 capitalize">{app.platform}</span>
                  </td>
                  <td className="px-4 py-3">
                    <FitScoreBadge score={app.fitScore} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 tabular-nums">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-zinc-600 hover:text-indigo-400 transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </td>
                </tr>

                {expanded === app.id && (
                  <tr key={`${app.id}-detail`} className="bg-zinc-900/70 border-b border-zinc-800">
                    <td colSpan={7} className="px-6 py-5">
                      <div className="space-y-4">
                        {/* AI Reasoning */}
                        {app.fitReasoning && (
                          <div>
                            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">AI Reasoning</h4>
                            <p className="text-sm text-zinc-300 leading-relaxed">{app.fitReasoning}</p>
                            <div className="mt-2 flex gap-4">
                              {app.matchedSkills.length > 0 && (
                                <div>
                                  <span className="text-xs text-emerald-500 font-medium">Matched: </span>
                                  <span className="text-xs text-zinc-400">{app.matchedSkills.join(", ")}</span>
                                </div>
                              )}
                              {app.missingSkills.length > 0 && (
                                <div>
                                  <span className="text-xs text-red-400 font-medium">Missing: </span>
                                  <span className="text-xs text-zinc-400">{app.missingSkills.join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Resume Diff */}
                        {app.originalResume && app.tailoredResume && (
                          <div>
                            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Resume Diff</h4>
                            <ResumesDiffView
                              original={app.originalResume}
                              tailored={app.tailoredResume}
                            />
                          </div>
                        )}

                        {/* Cover Letter */}
                        {app.coverLetter && (
                          <div>
                            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Cover Letter</h4>
                            <div className="rounded-md border border-zinc-700 bg-zinc-800/50 p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                              {app.coverLetter}
                            </div>
                          </div>
                        )}

                        {/* Status Update */}
                        <div>
                          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Update Status</h4>
                          <div className="flex gap-2 flex-wrap">
                            {STATUS_ORDER.map((s) => (
                              <button
                                key={s}
                                onClick={async () => {
                                  await fetch(`/api/applications/${app.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: s }),
                                  });
                                  window.location.reload();
                                }}
                                className={cn(
                                  "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
                                  app.status === s
                                    ? "bg-indigo-600 border-indigo-500 text-white"
                                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

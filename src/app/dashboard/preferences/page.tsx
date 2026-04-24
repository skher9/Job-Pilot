'use client'

import { useState, useEffect } from "react";
import { DEFAULT_CONFIG_YAML, parseConfig } from "@/lib/config/yaml-parser";
import { YamlPreview } from "@/components/profile/YamlPreview";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle } from "lucide-react";
import yaml from "js-yaml";
import type { Config } from "@/lib/config/schema";

const PLATFORMS = ["linkedin", "indeed", "naukri"] as const;
const EXPERIENCE_LEVELS = ["entry-level", "mid-level", "senior", "lead"] as const;
const JOB_TYPES = ["full-time", "part-time", "contract", "remote", "hybrid"] as const;

const DEFAULT_CONFIG: Config = {
  search: {
    keywords: ["Frontend Engineer", "React Developer", "Full Stack Engineer"],
    locations: ["Remote"],
    platforms: ["linkedin"],
    experience_level: ["mid-level", "senior"],
    job_type: ["full-time", "remote"],
    blacklist_companies: [],
    blacklist_keywords: [],
  },
  application: {
    min_fit_score: 7,
    max_applications_per_run: 20,
    auto_apply: false,
    cover_letter: true,
    tailor_resume: true,
  },
  ai: {
    model: "deepseek-chat",
    resume_aggressiveness: "moderate",
  },
};

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) { onChange([...value, t]); setInput(""); }
  };
  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 p-2 min-h-[40px]">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-200">
          {tag}
          <button onClick={() => onChange(value.filter((t) => t !== tag))} className="text-zinc-500 hover:text-zinc-200">×</button>
        </span>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} onBlur={add} placeholder={placeholder ?? "Add, press Enter"} className="flex-1 min-w-24 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none" />
    </div>
  );
}

export default function PreferencesPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showAutoApplyWarning, setShowAutoApplyWarning] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { configYaml?: string }) => {
        if (data.configYaml) {
          try {
            setConfig(parseConfig(data.configYaml));
          } catch {
            // malformed stored yaml — keep defaults
          }
        }
      })
      .catch(() => {});
  }, []);

  const configYaml = (() => { try { return yaml.dump(config, { lineWidth: 120 }); } catch { return DEFAULT_CONFIG_YAML; } })();

  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const setSearch = (updates: Partial<Config["search"]>) =>
    set("search", { ...config.search, ...updates });

  const setApp = (updates: Partial<Config["application"]>) =>
    set("application", { ...config.application, ...updates });

  const save = async () => {
    setSaveError("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configYaml }),
    });
    if (!res.ok) {
      setSaveError("Save failed. Try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Preferences</h1>
        <p className="mt-1 text-sm text-zinc-500">Configure search filters, AI settings, and automation rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Search keywords */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">Search Keywords</h2>
            <TagInput value={config.search.keywords} onChange={(v) => setSearch({ keywords: v })} placeholder="Frontend Engineer, React..." />
          </section>

          {/* Locations */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">Locations</h2>
            <TagInput value={config.search.locations} onChange={(v) => setSearch({ locations: v })} placeholder="Remote, Pune, Bangalore..." />
          </section>

          {/* Platforms */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">Platforms</h2>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const cur = config.search.platforms;
                    const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p];
                    if (next.length > 0) setSearch({ platforms: next });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
                    config.search.platforms.includes(p)
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600">Indeed + Naukri scrapers coming in v1.1</p>
          </section>

          {/* Experience level + job type */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">Filters</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <button key={l} onClick={() => { const cur = config.search.experience_level ?? []; const next = cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]; setSearch({ experience_level: next }); }}
                      className={cn("px-3 py-1 rounded-md text-xs border transition-colors", (config.search.experience_level ?? []).includes(l) ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((t) => (
                    <button key={t} onClick={() => { const cur = config.search.job_type ?? []; const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]; setSearch({ job_type: next }); }}
                      className={cn("px-3 py-1 rounded-md text-xs border transition-colors", (config.search.job_type ?? []).includes(t) ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Application settings */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">Application Settings</h2>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400">Minimum Fit Score Threshold</label>
                <span className="text-sm font-medium text-white tabular-nums">{config.application.min_fit_score}/10</span>
              </div>
              <input type="range" min={1} max={10} value={config.application.min_fit_score}
                onChange={(e) => setApp({ min_fit_score: parseInt(e.target.value) })}
                className="w-full accent-indigo-500" />
              <p className="text-xs text-zinc-600">Jobs below this score are skipped</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400">Max Applications per Run</label>
                <span className="text-sm font-medium text-white tabular-nums">{config.application.max_applications_per_run}</span>
              </div>
              <input type="range" min={1} max={50} value={config.application.max_applications_per_run}
                onChange={(e) => setApp({ max_applications_per_run: parseInt(e.target.value) })}
                className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-3">
              {[
                { key: "cover_letter" as const, label: "Generate Cover Letters" },
                { key: "tailor_resume" as const, label: "Tailor Resume per Job" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-zinc-300">{label}</span>
                  <button onClick={() => setApp({ [key]: !config.application[key] })}
                    className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", config.application[key] ? "bg-indigo-600" : "bg-zinc-700")}>
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", config.application[key] ? "translate-x-4" : "translate-x-1")} />
                  </button>
                </label>
              ))}

              {/* Auto-apply toggle with warning */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm text-zinc-300">Auto-Apply</span>
                  <p className="text-xs text-zinc-600">Submits applications without review</p>
                </div>
                <button
                  onClick={() => {
                    if (!config.application.auto_apply) setShowAutoApplyWarning(true);
                    else setApp({ auto_apply: false });
                  }}
                  className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", config.application.auto_apply ? "bg-amber-600" : "bg-zinc-700")}>
                  <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", config.application.auto_apply ? "translate-x-4" : "translate-x-1")} />
                </button>
              </label>
            </div>
          </section>

          {/* AI settings */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">AI Settings</h2>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Resume Tailoring Aggressiveness</label>
              <div className="flex gap-2">
                {(["conservative", "moderate", "aggressive"] as const).map((a) => (
                  <button key={a} onClick={() => set("ai", { model: config.ai?.model ?? "gpt-4o", ...config.ai, resume_aggressiveness: a })}
                    className={cn("px-3 py-1.5 rounded-md text-xs border transition-colors capitalize flex-1", config.ai?.resume_aggressiveness === a ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500")}>
                    {a}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-600">Aggressive = full rewrite preserving all facts</p>
            </div>
          </section>

          {/* Blacklists */}
          <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-medium text-white">Blacklists</h2>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Companies to Skip</label>
              <TagInput value={config.search.blacklist_companies ?? []} onChange={(v) => setSearch({ blacklist_companies: v })} placeholder="CompanyX, CompanyY..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Keywords to Skip</label>
              <TagInput value={config.search.blacklist_keywords ?? []} onChange={(v) => setSearch({ blacklist_keywords: v })} placeholder="PHP, Angular..." />
            </div>
          </section>

          {/* Save */}
          <button onClick={save} className={cn("w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all", saved ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white")}>
            {saved ? <><Check size={14} /> Saved</> : "Save Preferences"}
          </button>
          {saveError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{saveError}</p>
          )}
        </div>

        {/* YAML preview */}
        <YamlPreview yaml={configYaml} className="sticky top-6 self-start" />
      </div>

      {/* Auto-apply warning modal */}
      {showAutoApplyWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border border-amber-500/30 bg-zinc-900 p-6 max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Enable Auto-Apply?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  The agent will submit applications automatically without asking you first.
                  Only enable this if you&apos;ve reviewed your profile and preferences carefully.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAutoApplyWarning(false)} className="flex-1 py-2 rounded-md border border-zinc-700 text-sm text-zinc-400 hover:border-zinc-500 transition-colors">Cancel</button>
              <button onClick={() => { setApp({ auto_apply: true }); setShowAutoApplyWarning(false); }} className="flex-1 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-sm text-white font-medium transition-colors">Enable Auto-Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

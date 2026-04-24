'use client'

import { useState, useEffect } from "react";
import { YamlPreview } from "./YamlPreview";
import { dumpProfile } from "@/lib/config/yaml-parser";
import { DEFAULT_PROFILE_YAML } from "@/lib/config/yaml-parser";
import type { Profile } from "@/lib/config/schema";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check } from "lucide-react";

const STEPS = ["Personal", "Experience", "Education", "Skills", "Projects"] as const;
type Step = (typeof STEPS)[number];

const emptyProfile: Profile = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  summary: "",
  experience: [{ title: "", company: "", duration: "", responsibilities: [""], skills: [] }],
  education: [{ degree: "", institution: "", year: "" }],
  skills: { primary: [], backend: [], tools: [] },
  projects: [],
};

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput("");
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 p-2 min-h-[40px]">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-200"
        >
          {tag}
          <button
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-zinc-500 hover:text-zinc-200"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder ?? "Add tag, press Enter"}
        className="flex-1 min-w-24 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
      />
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500 transition-colors resize-none"
      />
    </div>
  );
}

export function ProfileForm({ initialYaml }: { initialYaml?: string }) {
  const [step, setStep] = useState<Step>("Personal");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [yaml, setYaml] = useState(initialYaml ?? DEFAULT_PROFILE_YAML);
  const [yamlMode, setYamlMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    try {
      setYaml(dumpProfile(profile));
    } catch {
      // ignore invalid intermediate states
    }
  }, [profile]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setSaveError("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileYaml: yaml }),
    });
    if (!res.ok) {
      setSaveError("Save failed. Try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form panel */}
      <div className="space-y-5">
        {/* Step tabs */}
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {STEPS.map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs font-medium transition-colors",
                step === s ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Step content */}
        {step === "Personal" && (
          <div className="space-y-4">
            <Input label="Full Name" value={profile.personal.name} onChange={(v) => set("personal", { ...profile.personal, name: v })} placeholder="Jane Doe" />
            <Input label="Email" type="email" value={profile.personal.email} onChange={(v) => set("personal", { ...profile.personal, email: v })} placeholder="jane@example.com" />
            <Input label="Phone" value={profile.personal.phone ?? ""} onChange={(v) => set("personal", { ...profile.personal, phone: v })} placeholder="+91 99999 99999" />
            <Input label="Location" value={profile.personal.location ?? ""} onChange={(v) => set("personal", { ...profile.personal, location: v })} placeholder="Pune, India" />
            <Input label="LinkedIn URL" value={profile.personal.linkedin ?? ""} onChange={(v) => set("personal", { ...profile.personal, linkedin: v })} placeholder="https://linkedin.com/in/jane" />
            <Input label="GitHub URL" value={profile.personal.github ?? ""} onChange={(v) => set("personal", { ...profile.personal, github: v })} placeholder="https://github.com/jane" />
            <Input label="Portfolio" value={profile.personal.portfolio ?? ""} onChange={(v) => set("personal", { ...profile.personal, portfolio: v })} placeholder="https://jane.dev" />
            <Textarea label="Professional Summary" value={profile.summary ?? ""} onChange={(v) => set("summary", v)} rows={4} />
          </div>
        )}

        {step === "Experience" && (
          <div className="space-y-6">
            {(profile.experience ?? []).map((exp, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Experience #{i + 1}</span>
                  {(profile.experience ?? []).length > 1 && (
                    <button
                      onClick={() => set("experience", (profile.experience ?? []).filter((_, j) => j !== i))}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <Input label="Job Title" value={exp.title} onChange={(v) => { const e = [...(profile.experience ?? [])]; e[i] = { ...e[i], title: v }; set("experience", e); }} placeholder="SDE II" />
                <Input label="Company" value={exp.company} onChange={(v) => { const e = [...(profile.experience ?? [])]; e[i] = { ...e[i], company: v }; set("experience", e); }} placeholder="Acme Corp" />
                <Input label="Duration" value={exp.duration} onChange={(v) => { const e = [...(profile.experience ?? [])]; e[i] = { ...e[i], duration: v }; set("experience", e); }} placeholder="2022 - Present" />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Responsibilities</label>
                  {exp.responsibilities.map((r, j) => (
                    <div key={j} className="flex gap-2">
                      <input
                        value={r}
                        onChange={(e) => {
                          const exps = [...(profile.experience ?? [])];
                          const resp = [...exps[i].responsibilities];
                          resp[j] = e.target.value;
                          exps[i] = { ...exps[i], responsibilities: resp };
                          set("experience", exps);
                        }}
                        className="flex-1 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500"
                        placeholder="Built something cool..."
                      />
                      <button onClick={() => { const exps = [...(profile.experience ?? [])]; exps[i] = { ...exps[i], responsibilities: exps[i].responsibilities.filter((_, k) => k !== j) }; set("experience", exps); }} className="text-zinc-600 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button onClick={() => { const exps = [...(profile.experience ?? [])]; exps[i] = { ...exps[i], responsibilities: [...exps[i].responsibilities, ""] }; set("experience", exps); }} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"><Plus size={11} /> Add bullet</button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Skills used</label>
                  <TagInput value={exp.skills ?? []} onChange={(v) => { const e = [...(profile.experience ?? [])]; e[i] = { ...e[i], skills: v }; set("experience", e); }} />
                </div>
              </div>
            ))}
            <button onClick={() => set("experience", [...(profile.experience ?? []), { title: "", company: "", duration: "", responsibilities: [""], skills: [] }])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5">
              <Plus size={12} /> Add experience
            </button>
          </div>
        )}

        {step === "Education" && (
          <div className="space-y-4">
            {(profile.education ?? []).map((edu, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Education #{i + 1}</span>
                  {(profile.education ?? []).length > 1 && (
                    <button onClick={() => set("education", (profile.education ?? []).filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
                  )}
                </div>
                <Input label="Degree" value={edu.degree} onChange={(v) => { const e = [...(profile.education ?? [])]; e[i] = { ...e[i], degree: v }; set("education", e); }} placeholder="B.E. Computer Engineering" />
                <Input label="Institution" value={edu.institution} onChange={(v) => { const e = [...(profile.education ?? [])]; e[i] = { ...e[i], institution: v }; set("education", e); }} placeholder="Example University" />
                <Input label="Year" value={edu.year} onChange={(v) => { const e = [...(profile.education ?? [])]; e[i] = { ...e[i], year: v }; set("education", e); }} placeholder="2021" />
              </div>
            ))}
            <button onClick={() => set("education", [...(profile.education ?? []), { degree: "", institution: "", year: "" }])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"><Plus size={12} /> Add education</button>
          </div>
        )}

        {step === "Skills" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Primary / Frontend Skills</label>
              <TagInput value={profile.skills?.primary ?? []} onChange={(v) => set("skills", { ...profile.skills, primary: v })} placeholder="React, TypeScript, Next.js..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Backend Skills</label>
              <TagInput value={profile.skills?.backend ?? []} onChange={(v) => set("skills", { ...profile.skills, backend: v })} placeholder="Node.js, PostgreSQL..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Tools & DevOps</label>
              <TagInput value={profile.skills?.tools ?? []} onChange={(v) => set("skills", { ...profile.skills, tools: v })} placeholder="Git, Docker, AWS..." />
            </div>
          </div>
        )}

        {step === "Projects" && (
          <div className="space-y-4">
            {(profile.projects ?? []).map((proj, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Project #{i + 1}</span>
                  <button onClick={() => set("projects", (profile.projects ?? []).filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
                <Input label="Name" value={proj.name} onChange={(v) => { const p = [...(profile.projects ?? [])]; p[i] = { ...p[i], name: v }; set("projects", p); }} />
                <Textarea label="Description" value={proj.description} onChange={(v) => { const p = [...(profile.projects ?? [])]; p[i] = { ...p[i], description: v }; set("projects", p); }} rows={2} />
                <Input label="URL" value={proj.url ?? ""} onChange={(v) => { const p = [...(profile.projects ?? [])]; p[i] = { ...p[i], url: v }; set("projects", p); }} placeholder="https://..." />
              </div>
            ))}
            <button onClick={() => set("projects", [...(profile.projects ?? []), { name: "", description: "", url: "" }])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"><Plus size={12} /> Add project</button>
          </div>
        )}

        {/* Toggle YAML mode */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button onClick={() => setYamlMode(!yamlMode)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            {yamlMode ? "← Back to form" : "Advanced: Edit YAML directly →"}
          </button>
          <button
            onClick={save}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all",
              saved
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
          >
            {saved ? <><Check size={14} /> Saved</> : "Save Profile"}
          </button>
          {saveError && (
            <p className="text-xs text-red-400">{saveError}</p>
          )}
        </div>

        {yamlMode && (
          <textarea
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            rows={20}
            className="w-full font-mono text-xs rounded-md border border-zinc-700 bg-zinc-900 p-3 text-zinc-300 outline-none focus:border-indigo-500 resize-none"
            spellCheck={false}
          />
        )}
      </div>

      {/* YAML preview panel */}
      {!yamlMode && <YamlPreview yaml={yaml} className="sticky top-6 self-start" />}
    </div>
  );
}

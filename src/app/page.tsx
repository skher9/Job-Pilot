import Link from "next/link";
import { Zap, Bot, FileText, BarChart3, ArrowRight, Check } from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "Agent Pipeline",
    desc: "Scrape jobs → score fit → tailor resume → generate cover letter. All automated.",
  },
  {
    icon: BarChart3,
    title: "AI Job Scoring",
    desc: "GPT-4o scores each job 1–10 based on your profile. Only applies above your threshold.",
  },
  {
    icon: FileText,
    title: "Resume Diff",
    desc: "See exactly what the AI changed between your base resume and the tailored version.",
  },
];

const WHAT_CHANGES = [
  ["Python CLI only", "Full web dashboard with real UI"],
  ["YAML is the only interface", "Form-based editor generates YAML under the hood"],
  ["No fit scoring", "AI scores each job 1–10 before applying"],
  ["No persistent state", "Full application tracker with status history"],
  ["No reasoning visibility", "AI logs: why it applied, what it changed"],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-white">JobPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Sign in
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition-colors">
            Dashboard
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-xs text-indigo-300 font-medium">v0.1 — Early Access</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
          AI-powered job hunting.
          <br />
          <span className="text-indigo-400">Apply smarter, not harder.</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Scrapes jobs. Scores fit with GPT-4o. Tailors your resume. Generates cover letters.
          Tracks everything. Built for engineers who want results, not busywork.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-colors">
            Open Dashboard
            <ArrowRight size={15} />
          </Link>
          <Link href="/register" className="rounded-md border border-zinc-700 hover:border-zinc-500 px-6 py-3 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors">
            Create Account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/20">
                <Icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-medium text-white text-sm">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">What&apos;s different</h2>
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-2 border-b border-zinc-800">
            <div className="px-4 py-3 text-xs font-medium text-zinc-500">AIHawk / existing tools</div>
            <div className="px-4 py-3 text-xs font-medium text-indigo-400 border-l border-zinc-800">JobPilot</div>
          </div>
          {WHAT_CHANGES.map(([before, after]) => (
            <div key={before} className="grid grid-cols-2 border-b border-zinc-800/50 last:border-0">
              <div className="px-4 py-3 text-sm text-zinc-600">{before}</div>
              <div className="px-4 py-3 text-sm text-zinc-300 border-l border-zinc-800/50 flex items-start gap-2">
                <Check size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                {after}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-6 text-center">
        <p className="text-xs text-zinc-700">JobPilot — Built with Next.js, Prisma, OpenAI, Playwright.</p>
      </footer>
    </main>
  );
}

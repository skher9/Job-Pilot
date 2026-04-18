'use client'

import { cn } from "@/lib/utils";

export function YamlPreview({ yaml, className }: { yaml: string; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">YAML Preview</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(yaml);
          }}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-zinc-400 overflow-auto max-h-[600px] leading-5 whitespace-pre">
        {yaml || "# Start filling in the form to generate YAML"}
      </pre>
    </div>
  );
}

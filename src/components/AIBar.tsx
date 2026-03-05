import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

const AIBar: React.FC = () => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px]">
      <div className="bg-surface-1 border border-border-visible rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl shadow-black/40" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px hsl(228 90% 64% / 0.1)" }}>
        <Sparkles size={18} className="text-sw-purple flex-shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything — 'Why did Blinkit sales drop last Tuesday?'"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <kbd className="flex-shrink-0 px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
      </div>
    </div>
  );
};

export default AIBar;

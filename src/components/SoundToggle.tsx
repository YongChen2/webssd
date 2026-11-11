"use client";

import { useEffect } from "react";
import { restoreSound, setSound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { soundStore } from "@/lib/story";

export function SoundToggle() {
  const on = useStore(soundStore);
  useEffect(() => {
    restoreSound();
  }, []);
  return (
    <button
      type="button"
      onClick={() => setSound(!on)}
      aria-pressed={on}
      aria-label={on ? "Vypnout zvuk" : "Zapnout zvuk"}
      title={on ? "Zvuk zapnutý" : "Zvuk vypnutý"}
      className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition-colors duration-500 ease-fluid hover:text-white"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 8v4h3l4 3.5v-11L6 8H3z" />
        {on ? <path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5.5a6.5 6.5 0 0 1 0 9" /> : <path d="M13.5 8l4 4M17.5 8l-4 4" />}
      </svg>
    </button>
  );
}

import { soundStore } from "./story";

let ctx: AudioContext | null = null;
const KEY = "velor-sound";

function audio() {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function restoreSound() {
  try {
    if (localStorage.getItem(KEY) === "1") soundStore.set(true);
  } catch {
    /* úložiště nemusí být dostupné */
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  soundStore.set(on);
  if (on) play("tick");
}

type Kind = "tick" | "click" | "select";

/** Krátké syntetizované zvuky, žádné soubory ke stažení. */
export function play(kind: Kind) {
  if (!soundStore.get()) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const tone = (type: OscillatorType, f0: number, f1: number, dur: number, vol: number, at = 0) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t + at);
    o.frequency.exponentialRampToValueAtTime(f1, t + at + dur);
    g.gain.setValueAtTime(0.0001, t + at);
    g.gain.exponentialRampToValueAtTime(vol, t + at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
    o.connect(g).connect(a.destination);
    o.start(t + at);
    o.stop(t + at + dur + 0.02);
  };
  if (kind === "tick") tone("sine", 2200, 1500, 0.035, 0.025);
  else if (kind === "select") tone("triangle", 520, 880, 0.12, 0.05);
  else {
    // „cvaknutí“ při složení disku
    tone("square", 1100, 160, 0.05, 0.05);
    tone("sine", 220, 90, 0.12, 0.07, 0.01);
  }
}

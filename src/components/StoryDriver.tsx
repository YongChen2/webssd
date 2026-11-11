"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_POSE, story, type Pose } from "@/lib/story";
import { play } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

const p = (o: Partial<Pose>): Pose => ({ ...HERO_POSE, ...o });

/**
 * Póza disku v jednotlivých sekcích (vůči záběru v hero).
 * Pořadí = pořadí sekcí na stránce. `after` = disk zmizí.
 */
const DESKTOP: Record<string, Pose> = {
  top: p({}),
  technologie: p({ y: 0.24, s: 0.82, rx: -0.3, ry: 0.5, rz: 0.1, spin: 0 }),
  rychlost: p({ x: 0.25, y: 0.22, s: 0.7, rx: -0.2, ry: -0.35, rz: 0.05, spin: 0, hw: 1 }),
  chlazeni: p({ x: 0.22, y: 0.22, s: 0.85, rx: 0.5, ry: 0, rz: 0.08, spin: 0, heat: 1 }),
  modely: p({ x: 0, y: 0.3, s: 0.55, rx: 0.1, ry: 0, rz: 0.1, spin: 0 }),
  after: p({ x: 0, y: 0.3, s: 0.45, rx: 0.1, o: 0, spin: 0 }),
};

const MOBILE: Record<string, Pose> = {
  top: p({}),
  technologie: p({ y: 0.14, s: 0.95, rx: -0.25, ry: 0.5, rz: 0.95, spin: 0 }),
  rychlost: p({ y: 0.36, s: 0.95, rx: -0.2, ry: -0.35, rz: 0.95, spin: 0, hw: 1 }),
  chlazeni: p({ y: 0.34, s: 1, rx: 0.5, ry: 0, rz: 0.95, spin: 0, heat: 1 }),
  modely: p({ y: 0.38, s: 0.8, rx: 0.1, ry: 0, rz: 0.95, spin: 0 }),
  after: p({ y: 0.38, s: 0.7, rx: 0.1, o: 0, rz: 0.95, spin: 0 }),
};

/** Póza v těchto sekcích sleduje živou polohu prvku (disk „visí“ nad kartami modelů). */
const FOLLOW: Record<string, string> = { modely: "modely-stage", after: "modely-stage" };

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Převádí scroll na `story.target` (póza disku) a řídí pin + exploded view v sekci Technologie.
 * Žádný React render: jen zápis do sdíleného objektu, který čte 3D smyčka.
 */
export function StoryDriver() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const poses = mobile ? MOBILE : DESKTOP;
      const ids = Object.keys(poses);
      const keys = Object.keys(HERO_POSE) as (keyof Pose)[];

      // úseky přechodu: od vstupu sekce do viewportu po okamžik, kdy je u 35 % výšky
      let segs: { start: number; end: number }[] = [];
      const compute = () => {
        const vh = window.innerHeight;
        segs = ids.map((id) => {
          if (id === "top") return { start: -1, end: -1 };
          const el = document.getElementById(id === "after" ? "kompatibilita" : id);
          if (!el) return { start: Infinity, end: Infinity };
          // pinnutá sekce: pozice před pinem
          const top = id === "technologie" ? (techTrigger?.start ?? 0) : el.getBoundingClientRect().top + window.scrollY;
          return { start: top - vh, end: top - vh * 0.35 };
        });
        resolve();
      };

      const poseOf = (id: string): Pose => {
        const base = poses[id];
        const el = FOLLOW[id] ? document.getElementById(FOLLOW[id]) : null;
        if (!el) return base;
        const r = el.getBoundingClientRect();
        const frac = (r.top + r.height / 2) / window.innerHeight;
        const baseFrac = window.innerWidth / window.innerHeight < 0.9 ? -0.11 : -0.2;
        return { ...base, y: 0.5 - frac - baseFrac };
      };

      const resolve = () => {
        const y = window.scrollY;
        let i = 0;
        for (let n = 1; n < ids.length; n++) if (y >= segs[n].start) i = n;
        const to = poseOf(ids[i]);
        if (i === 0 || y >= segs[i].end) {
          Object.assign(story.target, to);
          return;
        }
        const from = poseOf(ids[i - 1]);
        const t = ease(clamp01((y - segs[i].start) / (segs[i].end - segs[i].start)));
        for (const k of keys) story.target[k] = from[k] + (to[k] - from[k]) * t;
      };

      // exploded view: pin sekce, scroll řídí rozložení, popisky i závěrečné „cvaknutí“
      let techTrigger: ScrollTrigger | undefined;
      let snapped = false;
      const tech = document.getElementById("technologie");
      if (tech) {
        techTrigger = ScrollTrigger.create({
          trigger: tech,
          start: "top top",
          end: mobile ? "+=170%" : "+=300%",
          pin: true,
          anticipatePin: 1,
          onToggle: (self) => {
            story.labelsOn = self.isActive;
            story.labelsListeners.forEach((l) => l());
            if (!self.isActive) {
              story.extraYaw = self.progress > 0.5 ? 0.45 : -0.45;
              story.explode = 0;
            }
          },
          onUpdate: (self) => {
            const t = self.progress;
            story.techProgress = t;
            const open = ease(clamp01((t - 0.06) / 0.3));
            const q = clamp01((t - 0.8) / 0.15);
            // zavření s přeběhem: disk se „zacvakne“
            const closeEase = 1 - Math.pow(1 - q, 3) * Math.cos(q * 4.2);
            story.explode = open * (1 - closeEase);
            story.extraYaw = (t - 0.5) * 0.9;
            const done = t > 0.93;
            if (done && !snapped) {
              snapped = true;
              story.pulseAt = performance.now();
              play("click");
            } else if (t < 0.9) snapped = false;
          },
        });
      }

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: resolve,
        onRefresh: compute,
      });
      compute();
      ScrollTrigger.addEventListener("refresh", compute);

      return () => {
        ScrollTrigger.removeEventListener("refresh", compute);
        st.kill();
        techTrigger?.kill();
        Object.assign(story.target, HERO_POSE);
        story.explode = 0;
        story.labelsOn = false;
        story.labelsListeners.forEach((l) => l());
      };
    });

    // reduced motion: bez scroll animací, statický disk jen v hero
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const hero = document.getElementById("top");
      if (!hero) return;
      // statický render jen v hero, jinde plátno schováme (smyčka v tomto režimu neběží)
      const io = new IntersectionObserver(([e]) => {
        const c = document.getElementById("story-canvas");
        if (c) c.style.visibility = e.isIntersecting ? "visible" : "hidden";
      });
      io.observe(hero);
      return () => io.disconnect();
    });

    return () => mm.revert();
  }, []);

  return null;
}

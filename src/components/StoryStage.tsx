"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { loadStore } from "@/lib/story";
import { StoryDriver } from "./StoryDriver";

// Three.js se stáhne až po vykreslení stránky (samostatný chunk)
const StoryScene = dynamic(() => import("./three/StoryScene"), { ssr: false });

const CAPACITIES = site.models.map((m) => m.capacity as string);

/** Fixní 3D plátno za obsahem celé stránky + driver, který ho řídí scrollem. */
export function StoryStage() {
  const [scene, setScene] = useState<null | { lite: boolean; reduced: boolean }>(null);

  useEffect(() => {
    const start = () => {
      setScene({
        lite: window.matchMedia("(max-width: 767px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4,
        reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    };
    loadStore.set(0.1);
    const idle = window.requestIdleCallback?.(start, { timeout: 1200 }) ?? window.setTimeout(start, 300);
    return () => {
      window.cancelIdleCallback?.(idle);
      clearTimeout(idle);
    };
  }, []);

  return (
    <>
      {scene && (
        <StoryScene
          accent={site.accent}
          brand={site.brand}
          capacities={CAPACITIES}
          lite={scene.lite}
          reducedMotion={scene.reduced}
        />
      )}
      <StoryDriver />
    </>
  );
}

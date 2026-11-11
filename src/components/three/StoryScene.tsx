"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { capacityStore, heatSinkStore, loadStore, PART_KEYS, story, type Pose } from "@/lib/story";
import { buildHighway } from "./buildHighway";
import { buildSsd, HS_LEN, HS_X } from "./buildSsd";
import { buildStudioEnv } from "./studioEnv";

/** Uvolní hlavní vlákno mezi kroky inicializace, aby nevznikl jeden dlouhý task. */
const yieldFrame = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

type Props = {
  accent: string;
  brand: string;
  capacities: string[];
  lite: boolean;
  reducedMotion: boolean;
};

const POSE_KEYS = Object.keys(story.target) as (keyof Pose)[];

/**
 * Jedno trvalé plátno pro celý příběh: disk se podle `story.target` (zapisuje ho scroll)
 * přesouvá, otáčí a rozkládá mezi sekcemi.
 */
export default function StoryScene({ accent, brand, capacities, lite, reducedMotion }: Props) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    loadStore.set(Math.max(loadStore.get(), 0.3));

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lite,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      loadStore.set(1); // bez WebGL zůstane CSS záře na pozadí
      return;
    }
    let pixelRatio = Math.min(window.devicePixelRatio, lite ? 1.5 : 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    let env: THREE.Texture | null = null;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

    const key = new THREE.DirectionalLight("#ffffff", 3.2);
    key.position.set(4, 8, 6);
    const rim = new THREE.DirectionalLight(accent, 3.5);
    rim.position.set(-6, 2.5, -6);
    scene.add(key, rim);

    let disposed = false;
    let inner: (() => void) | undefined;
    const studio = buildStudioEnv(accent);

    // inicializace po krocích (prostředí → model → částice), každý v jiném snímku
    void (async () => {
      await yieldFrame();
      if (disposed) return;
      env = pmrem.fromScene(studio.scene, 0.04, 0.1, 60, { size: 128 }).texture;
      studio.dispose();
      scene.environment = env;
      scene.environmentIntensity = 1.1;
      loadStore.set(0.55);
      await yieldFrame();
      if (disposed) return;

      const model = buildSsd({ accent, brand, capacity: capacities[capacityStore.get()] ?? "", lite });
      loadStore.set(0.75);
      if (disposed) return model.dispose();
      await yieldFrame();
      const highway = buildHighway(accent, lite);
      scene.add(highway.object);
      loadStore.set(0.85);
      await yieldFrame();
      if (disposed) {
        model.dispose();
        highway.dispose();
        return;
      }

      const root = new THREE.Group(); // pozice v záběru
      const tilt = new THREE.Group(); // náklon + reakce na myš
      const spin = new THREE.Group(); // rotace kolem vlastní osy
      spin.add(model.group);
      tilt.add(spin);
      root.add(tilt);
      scene.add(root);

      // kontaktní stín pod diskem
      const shadowTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, "rgba(0,0,0,0.55)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 3.4).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 }),
      );
      shadow.position.y = -1.1;
      spin.add(shadow);

      // aktuální (vyhlazená) póza
      const cur = { ...story.target };
      let hoCur = heatSinkStore.get() ? 0 : 1;
      let hotCur = hoCur;

      let w = 1;
      let h = 1;
      let visW = 1;
      let visH = 1;
      let baseY = 0;
      let dist = 15;
      let portrait = false;
      let heatTime = 0;
      const resize = () => {
        w = el.clientWidth;
        h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        portrait = aspect < 0.9;
        camera.aspect = aspect;
        const k = 2 * Math.tan(THREE.MathUtils.degToRad(14));
        // disk musí být vidět celý: na šířku ~10.5 j., na výšku ~7 j.
        dist = Math.max((portrait ? 8.6 : 14) / (aspect * k), 13);
        camera.position.set(0, 0, dist);
        camera.updateProjectionMatrix();
        visH = dist * k;
        visW = visH * aspect;
        baseY = portrait ? -visH * 0.11 : -visH * 0.2;
        highway.object.scale.setScalar(dist / 16);
        if (reducedMotion || !running) draw(0);
      };

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };

      const timer = new THREE.Timer();
      let angle = -0.5;
      let first = true;
      let intro = reducedMotion ? 1 : 0;
      const t0 = performance.now();
      let lastScroll = window.scrollY;
      let scrollSpeed = 0;
      let hwOffset = 0;
      // adaptivní kvalita: FPS prvních ~2 s určí tier (high / medium / low)
      type Tier = "high" | "medium" | "low";
      let tier: Tier = lite ? "medium" : "high";
      let measuring = true;
      let mStart = 0;
      let mFrames = 0;
      let assessments = 0;
      let lastSY = window.scrollY;
      let lastExplode = story.explode;
      let keepUntil = 0;
      let lastActive = performance.now();
      const v3 = new THREE.Vector3();

      const poke = () => {
        keepUntil = performance.now() + 900;
        if (!running && tier !== "low") wake();
      };
      const unsubCap = capacityStore.subscribe(() => {
        model.setCapacity(capacities[capacityStore.get()] ?? "");
        if (reducedMotion) draw(0);
        else poke();
      });
      const unsubSink = heatSinkStore.subscribe(() => {
        if (reducedMotion) draw(0);
        else poke();
      });

      const applyTier = (t: Tier) => {
        tier = t;
        if (t === "medium") {
          pixelRatio = Math.min(pixelRatio, 1);
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(w, h, false);
          highway.setDensity(0.5);
        } else if (t === "low") {
          // statický poster místo živého 3D; pin a labely se vypnou (viz StoryDriver)
          renderer.setAnimationLoop(null);
          running = false;
          el.style.display = "none";
          document.documentElement.classList.remove("scene-ready");
          document.documentElement.classList.add("tier-low");
          window.dispatchEvent(new Event("story-low"));
        }
      };
      /** Vyhodnotí naměřené FPS a případně sníží tier. */
      const assess = () => {
        const fps = mFrames / Math.max(0.5, (performance.now() - mStart) / 1000);
        assessments++;
        if (fps < 28) applyTier("low");
        else if (fps < 46) applyTier(tier === "high" ? "medium" : "low");
        // po snížení se měří ještě jednou
        if (tier !== "low" && fps < 46 && assessments < 2) {
          mStart = performance.now();
          mFrames = 0;
          measuring = true;
        } else measuring = false;
      };

      function draw(dt: number) {
        const t = timer.getElapsed();
        const damp = 1 - Math.exp(-dt * (reducedMotion ? 60 : 7));
        for (const k of POSE_KEYS) cur[k] += (story.target[k] - cur[k]) * (dt === 0 ? 1 : damp);

        intro = reducedMotion ? 1 : Math.min(1, (performance.now() - t0) / 1400);
        el!.style.opacity = String(Math.min(1, Math.max(0, cur.o)) * intro);
        if (cur.o < 0.01) return; // mimo záběr nic nevykreslujeme

        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 4);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 4);

        if (!reducedMotion) angle += dt * 0.22 * cur.spin;
        // plynulý přechod z volné rotace na pevný úhel (nejkratší cestou)
        const want = cur.ry + story.extraYaw;
        const diff = Math.atan2(Math.sin(want - angle), Math.cos(want - angle));
        spin.rotation.y = angle + diff * (1 - cur.spin);

        const since = (performance.now() - story.pulseAt) / 1000;
        const pulse = since < 0.7 ? 1 + Math.sin(since * 30) * Math.exp(-since * 8) * 0.03 : 1;

        tilt.rotation.x = 0.78 + cur.rx + mouse.y * 0.16;
        tilt.rotation.y = mouse.x * 0.3;
        tilt.rotation.z = (portrait ? -0.95 : -0.1) + cur.rz + mouse.x * 0.05;
        root.position.x = cur.x * visW + mouse.x * 0.15;
        root.position.y = baseY + cur.y * visH;
        root.scale.setScalar(cur.s * pulse);
        if (!reducedMotion) spin.position.y = Math.sin(t * 0.8) * 0.06;

        // rozložení + chladič (teplotní mapa)
        const hoTarget = heatSinkStore.get() ? 0 : 1;
        hoCur += (hoTarget - hoCur) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 3.2));
        hotCur += (hoTarget - hotCur) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 2.2));
        model.layout(story.explode, hoCur);
        heatTime += dt;
        model.setHeat(cur.heat, hotCur, heatTime);

        // světelný pruh: 2 s přejezd, pak pauza
        const cycle = (t % 5.5) / 2.2;
        const p = reducedMotion ? 0.62 : -0.25 + Math.min(cycle, 1.5) * 1.5;
        model.edgeMaterial.uniforms.uPos.value = p;
        const visible = p > -0.05 && p < 1.05;
        model.sweepLight.intensity = visible ? 14 : 0;
        model.sweepLight.position.x = (p - 0.5) * HS_LEN + HS_X;

        // datová dálnice: rychlost toku sleduje rychlost scrollu
        highway.object.visible = cur.hw > 0.01;
        if (highway.object.visible) {
          const sy = window.scrollY;
          const inst = dt > 0 ? Math.abs(sy - lastScroll) / dt : 0;
          lastScroll = sy;
          scrollSpeed += (inst - scrollSpeed) * Math.min(1, dt * 5);
          const boost = Math.min(scrollSpeed / 1400, 4);
          hwOffset += (4 + boost * 16) * dt;
          highway.uniforms.uOffset.value = hwOffset;
          highway.uniforms.uSpeed.value = 0.35 + boost;
          highway.uniforms.uAmount.value = cur.hw;
        }

        renderer.render(scene, camera);

        if (measuring && dt > 0) {
          if (!mStart) mStart = performance.now();
          mFrames++;
          if (performance.now() - mStart > 2000) assess();
        }

        // kotvy popisků pro exploded view
        if (story.labelsOn) {
          root.updateMatrixWorld();
          for (const k of PART_KEYS) {
            model.anchors[k].getWorldPosition(v3).project(camera);
            story.anchors[k].x = (v3.x * 0.5 + 0.5) * w;
            story.anchors[k].y = (-v3.y * 0.5 + 0.5) * h;
          }
        }

        if (first) {
          first = false;
          loadStore.set(1);
          document.documentElement.classList.add("scene-ready");
        }
      }

      // smyčka běží jen když je karta aktivní
      let running = false;
      const wakeEvents = ["scroll", "touchstart", "touchmove", "pointerdown", "resize"] as const;
      const wake = () => {
        wakeEvents.forEach((e) => window.removeEventListener(e, wake));
        lastActive = performance.now();
        sync();
      };
      const sleep = () => {
        renderer.setAnimationLoop(null);
        running = false;
        wakeEvents.forEach((e) => window.addEventListener(e, wake, { passive: true }));
      };
      /** Mění se něco, co je vidět? (scroll, doznívání pózy, rozložení, přepínač, částice) */
      const active = () => {
        const sy = window.scrollY;
        let a = sy !== lastSY;
        lastSY = sy;
        for (const k of POSE_KEYS) if (Math.abs(story.target[k] - cur[k]) > 0.002) a = true;
        if (Math.abs(story.explode - lastExplode) > 1e-4) a = true;
        lastExplode = story.explode;
        if (Math.abs((heatSinkStore.get() ? 0 : 1) - hoCur) > 0.004) a = true;
        if (cur.hw > 0.01 || performance.now() < keepUntil) a = true;
        return a;
      };
      const sync = () => {
        if (tier === "low") return;
        running = !document.hidden && !reducedMotion;
        renderer.setAnimationLoop(
          running
            ? (time: number) => {
                // mimo záběr (disk skrytý) se renderer úplně zastaví, probudí ho až scroll
                if (cur.o < 0.01 && story.target.o < 0.01) return sleep();
                // na mobilech se kreslí jen při pohybu (on-demand), ne v nekonečné smyčce
                if (lite && !measuring) {
                  if (active()) lastActive = performance.now();
                  else if (performance.now() - lastActive > 700) return sleep();
                }
                timer.update(time);
                draw(Math.min(timer.getDelta(), 0.05));
              }
            : null,
        );
      };
      document.addEventListener("visibilitychange", sync);

      // shadery se kompilují asynchronně (paralelně mimo hlavní vlákno), první snímek pak neblokuje
      root.updateMatrixWorld();
      if (renderer.extensions.has("KHR_parallel_shader_compile")) await renderer.compileAsync(scene, camera);
      if (disposed) {
        model.dispose();
        highway.dispose();
        return;
      }

      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();
      if (reducedMotion) draw(0);
      else window.addEventListener("pointermove", onMove, { passive: true });
      sync();

      inner = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        unsubCap();
        unsubSink();
        document.removeEventListener("visibilitychange", sync);
        wakeEvents.forEach((e) => window.removeEventListener(e, wake));
        window.removeEventListener("pointermove", onMove);
        model.dispose();
        highway.dispose();
        shadow.geometry.dispose();
        (shadow.material as THREE.Material).dispose();
        shadowTex.dispose();
        env?.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      document.documentElement.classList.remove("scene-ready");
      inner?.();
      if (!inner) {
        studio.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [accent, brand, capacities, lite, reducedMotion]);

  return (
    <div
      ref={wrap}
      id="story-canvas"
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[100lvh] w-full [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      aria-hidden
    />
  );
}

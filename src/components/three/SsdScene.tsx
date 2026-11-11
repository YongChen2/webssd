"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildSsd } from "./buildSsd";

type Props = {
  accent: string;
  brand: string;
  lite: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
};

const HS_LEN = 6.75;

export default function SsdScene({ accent, brand, lite, reducedMotion, onReady }: Props) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lite,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // bez WebGL zůstane CSS záře na pozadí
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.95;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

    const key = new THREE.DirectionalLight("#ffffff", 3.2);
    key.position.set(4, 8, 6);
    const rim = new THREE.DirectionalLight(accent, 3.5);
    rim.position.set(-6, 2.5, -6);
    scene.add(key, rim);

    const model = buildSsd({ accent, brand, lite });
    const root = new THREE.Group(); // pozice v záběru
    const tilt = new THREE.Group(); // náklon + reakce na myš
    const spin = new THREE.Group(); // pomalá rotace
    spin.add(model.group);
    tilt.add(spin);
    root.add(tilt);
    scene.add(root);

    let portrait = false;
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      portrait = aspect < 0.9;
      camera.aspect = aspect;
      const k = 2 * Math.tan(THREE.MathUtils.degToRad(14));
      // disk musí být vidět celý: na šířku ~10.5 j., na výšku ~7 j.
      const dist = Math.max((portrait ? 8.6 : 14) / (aspect * k), 13);
      camera.position.set(0, 0, dist);
      camera.updateProjectionMatrix();
      root.position.y = portrait ? -dist * k * 0.11 : -dist * k * 0.2;
      if (reducedMotion) draw(0);
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

    function draw(dt: number) {
      const t = timer.getElapsed();
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 4);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 4);

      if (!reducedMotion) angle += dt * 0.22;
      spin.rotation.y = angle;
      tilt.rotation.x = 0.78 + mouse.y * 0.16;
      tilt.rotation.y = mouse.x * 0.3;
      tilt.rotation.z = (portrait ? -0.95 : -0.1) + mouse.x * 0.05;
      root.position.x = mouse.x * 0.15;
      if (!reducedMotion) spin.position.y = Math.sin(t * 0.8) * 0.06;

      // světelný pruh: 2 s přejezd, pak pauza
      const cycle = (t % 5.5) / 2.2;
      const p = reducedMotion ? 0.62 : -0.25 + Math.min(cycle, 1.5) * 1.5;
      model.edgeMaterial.uniforms.uPos.value = p;
      const visible = p > -0.05 && p < 1.05;
      model.sweepLight.intensity = visible ? 14 : 0;
      model.sweepLight.position.x = (p - 0.5) * HS_LEN + 0.075;

      renderer.render(scene, camera);
      if (first) {
        first = false;
        onReady?.();
      }
    }

    // smyčka běží jen když je sekce vidět a karta aktivní
    let inView = true;
    const sync = () => {
      const run = inView && !document.hidden && !reducedMotion;
      renderer.setAnimationLoop(
        run
          ? (time: number) => {
              timer.update(time);
              draw(Math.min(timer.getDelta(), 0.05));
            }
          : null,
      );
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    if (reducedMotion) draw(0);
    else window.addEventListener("pointermove", onMove, { passive: true });
    sync();

    return () => {
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      model.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [accent, brand, lite, reducedMotion, onReady]);

  return <div ref={wrap} className="absolute inset-0 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" aria-hidden />;
}

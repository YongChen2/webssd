import * as THREE from "three";
import type { PartKey } from "@/lib/story";

export type SsdModel = {
  group: THREE.Group;
  /** Kotvy popisků (pohybují se s příslušnou částí). */
  anchors: Record<PartKey, THREE.Object3D>;
  edgeMaterial: THREE.ShaderMaterial;
  sweepLight: THREE.PointLight;
  /** Exploded view (e) a odstranění chladiče (ho, 0–1) pro teplotní mapu. */
  layout: (e: number, ho: number) => void;
  /** Teplotní mapa: amount = viditelnost, hot = 1 bez chladiče, time = animace. */
  setHeat: (amount: number, hot: number, time: number) => void;
  /** Přepíše štítek s kapacitou na chladiči. */
  setCapacity: (text: string) => void;
  dispose: () => void;
};

type Options = { accent: string; brand: string; capacity: string; lite: boolean };

const HS_LEN = 6.75;
const HS_X = 0.075;

function labelTexture(
  lines: { text: string; size: number; weight?: number; alpha?: number }[],
  w: number,
  h: number,
  bg: string,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const total = lines.reduce((s, l) => s + l.size * 1.35, 0);
  let y = h / 2 - total / 2;
  for (const l of lines) {
    ctx.font = `${l.weight ?? 400} ${l.size}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = `rgba(255,255,255,${l.alpha ?? 0.55})`;
    y += (l.size * 1.35) / 2;
    ctx.fillText(l.text, w / 2, y);
    y += (l.size * 1.35) / 2;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Šestiúhelníková mřížka – vizuál grafenové vrstvy. */
function grapheneTexture() {
  const w = 1024;
  const h = 300;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7b828c";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(20,24,32,0.55)";
  ctx.lineWidth = 1.5;
  const r = 15;
  const dx = r * Math.sqrt(3);
  for (let row = -1; row < h / (r * 1.5) + 1; row++) {
    for (let col = -1; col < w / dx + 1; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const cy = row * r * 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Štítek chladiče: značka vlevo, kapacita vpravo. */
function drawBand(ctx: CanvasRenderingContext2D, w: number, h: number, brand: string, capacity: string) {
  ctx.fillStyle = "#1b1c22";
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `300 ${Math.round(h * 0.21)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(brand.split("").join(" "), w * 0.3, h / 2);
  ctx.font = `200 ${Math.round(h * 0.34)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(capacity, w * 0.74, h / 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(w * 0.5, h * 0.22, 2, h * 0.56);
}

export function buildSsd({ accent, brand, capacity, lite }: Options): SsdModel {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

  const group = new THREE.Group();
  const accentColor = new THREE.Color(accent);
  const m = new THREE.Matrix4();

  /* ---------- PCB (M.2 2280: 80 × 22 mm → 8 × 2.2 jednotky) ---------- */
  const shape = new THREE.Shape();
  shape.moveTo(-4, -1.1);
  shape.lineTo(4, -1.1);
  shape.lineTo(4, -0.3);
  shape.absarc(4, 0, 0.3, -Math.PI / 2, Math.PI / 2, true); // výřez pro šroubek
  shape.lineTo(4, 1.1);
  shape.lineTo(-4, 1.1);
  shape.lineTo(-4, 0.75); // klíč M
  shape.lineTo(-3.65, 0.75);
  shape.lineTo(-3.65, 0.55);
  shape.lineTo(-4, 0.55);
  shape.closePath();

  const pcbGeo = track(
    new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false, curveSegments: 16 }),
  );
  pcbGeo.rotateX(-Math.PI / 2);
  const pcbMat = track(
    new THREE.MeshStandardMaterial({ color: "#0a0f1c", roughness: 0.42, metalness: 0.4 }),
  );
  const pcb = new THREE.Group();
  pcb.add(new THREE.Mesh(pcbGeo, pcbMat));

  // plošné spoje – jemné měděné dráhy na horní straně desky
  const traceMat = track(
    new THREE.MeshStandardMaterial({ color: "#2a4a78", roughness: 0.5, metalness: 0.8 }),
  );
  const traceGeo = track(new THREE.BoxGeometry(1, 0.004, 0.018));
  const traces: [number, number, number][] = []; // x středu, z, délka
  for (let i = 0; i < 9; i++) traces.push([-3.0 + (i % 3) * 0.12, -0.75 + i * 0.12, 0.7 - (i % 4) * 0.1]);
  for (let i = 0; i < 8; i++) traces.push([-0.55 + (i % 2) * 0.1, -0.85 + i * 0.24, 0.55]);
  for (let i = 0; i < 7; i++) traces.push([3.1 + (i % 2) * 0.1, -0.7 + i * 0.22, 0.8]);
  const traceMesh = new THREE.InstancedMesh(traceGeo, traceMat, traces.length);
  const sc = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  traces.forEach(([x, z, len], i) => {
    pos.set(x, 0.082, z);
    sc.set(len, 1, 1);
    m.compose(pos, q, sc);
    traceMesh.setMatrixAt(i, m);
  });
  pcb.add(traceMesh);

  // zlaté kontakty (samostatná část – v exploded view se vysune)
  const goldMat = track(
    new THREE.MeshStandardMaterial({ color: "#d9b25c", roughness: 0.28, metalness: 1 }),
  );
  const fingerGeo = track(new THREE.BoxGeometry(0.3, 0.012, 0.055));
  const fingerZ: number[] = [];
  for (let z = -1.03; z <= 1.031; z += 0.0936) {
    if (z > -0.8 && z < -0.5) continue; // místo klíče
    fingerZ.push(z);
  }
  const fingers = new THREE.InstancedMesh(fingerGeo, goldMat, fingerZ.length * 2);
  fingerZ.forEach((z, i) => {
    m.makeTranslation(-3.83, 0.084, z);
    fingers.setMatrixAt(i * 2, m);
    m.makeTranslation(-3.83, -0.004, z);
    fingers.setMatrixAt(i * 2 + 1, m);
  });
  const connector = new THREE.Group();
  connector.add(fingers);

  // drobné součástky
  const capMat = track(
    new THREE.MeshStandardMaterial({ color: "#8a8f9c", roughness: 0.4, metalness: 0.9 }),
  );
  const capGeo = track(new THREE.BoxGeometry(0.12, 0.06, 0.07));
  const capPos: [number, number][] = [
    [-3.35, 0.8], [-3.35, 0.6], [-3.35, 0.4], [-3.35, -0.2], [-3.35, -0.45],
    [3.3, 0.85], [3.3, 0.65], [3.3, -0.65], [3.3, -0.85], [3.45, 0.75],
  ];
  const caps = new THREE.InstancedMesh(capGeo, capMat, capPos.length);
  capPos.forEach(([x, z], i) => {
    m.makeTranslation(x, 0.11, z);
    caps.setMatrixAt(i, m);
  });
  pcb.add(caps);
  group.add(pcb, connector);

  /* ---------- čipy ---------- */
  const chipSide = track(
    new THREE.MeshStandardMaterial({ color: "#0c0d10", roughness: 0.6, metalness: 0.15 }),
  );
  const chip = (w: number, h: number, d: number, x: number, lines: Parameters<typeof labelTexture>[0]) => {
    const geo = track(new THREE.BoxGeometry(w, h, d));
    const tex = track(labelTexture(lines, 512, Math.round((512 * d) / w), "#0c0d10"));
    const top = track(
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.2 }),
    );
    const mesh = new THREE.Mesh(geo, [chipSide, chipSide, top, chipSide, chipSide, chipSide]);
    mesh.position.set(x, 0.08 + h / 2, 0);
    return mesh;
  };

  const controller = new THREE.Group();
  controller.add(
    chip(1.1, 0.1, 1.1, -2.6, [
      { text: brand, size: 64, weight: 600, alpha: 0.7 },
      { text: "NVMe CTRL · 8CH", size: 34 },
    ]),
  );
  const dram = new THREE.Group();
  dram.add(
    chip(0.8, 0.09, 1.3, -1.35, [
      { text: "DDR4", size: 96, weight: 600, alpha: 0.6 },
      { text: "CACHE", size: 60 },
    ]),
  );
  const nand = new THREE.Group();
  nand.add(
    chip(1.5, 0.11, 1.5, 0.3, [
      { text: "3D NAND", size: 62, weight: 600, alpha: 0.65 },
      { text: "TLC · 176L", size: 40 },
    ]),
    chip(1.5, 0.11, 1.5, 2.1, [
      { text: "3D NAND", size: 62, weight: 600, alpha: 0.65 },
      { text: "TLC · 176L", size: 40 },
    ]),
  );
  group.add(controller, dram, nand);

  /* ---------- teplovodivá podložka + grafenová vrstva ---------- */
  const padMat = track(
    new THREE.MeshStandardMaterial({
      color: accentColor.clone().multiplyScalar(0.35),
      roughness: 0.9,
      metalness: 0,
    }),
  );
  const pad = new THREE.Mesh(track(new THREE.BoxGeometry(6.5, 0.03, 1.9)), padMat);
  pad.position.set(0.1, 0.205, 0);
  const padG = new THREE.Group();
  padG.add(pad);
  group.add(padG);

  const grapheneTex = track(grapheneTexture());
  const grapheneMat = track(
    new THREE.MeshStandardMaterial({ map: grapheneTex, roughness: 0.32, metalness: 0.95 }),
  );
  const grapheneSide = track(
    new THREE.MeshStandardMaterial({ color: "#3a3f48", roughness: 0.4, metalness: 0.9 }),
  );
  const grapheneMesh = new THREE.Mesh(track(new THREE.BoxGeometry(6.6, 0.012, 1.95)), [
    grapheneSide, grapheneSide, grapheneMat, grapheneSide, grapheneSide, grapheneSide,
  ]);
  grapheneMesh.position.set(0.1, 0.226, 0);
  const graphene = new THREE.Group();
  graphene.add(grapheneMesh);
  group.add(graphene);

  /* ---------- chladič ---------- */
  const alu = track(
    new THREE.MeshStandardMaterial({ color: "#2b2d35", roughness: 0.34, metalness: 1 }),
  );
  const heatsink = new THREE.Group();
  const base = new THREE.Mesh(track(new THREE.BoxGeometry(HS_LEN, 0.12, 2.2)), alu);
  base.position.set(HS_X, 0.28, 0);
  heatsink.add(base);

  const finsPerSide = lite ? 4 : 7;
  const finGeo = track(new THREE.BoxGeometry(HS_LEN, 0.15, lite ? 0.085 : 0.05));
  const fins = new THREE.InstancedMesh(finGeo, alu, finsPerSide * 2);
  for (let i = 0; i < finsPerSide; i++) {
    const z = 0.42 + (i * (1.075 - 0.42)) / (finsPerSide - 1);
    m.makeTranslation(HS_X, 0.415, z);
    fins.setMatrixAt(i * 2, m);
    m.makeTranslation(HS_X, 0.415, -z);
    fins.setMatrixAt(i * 2 + 1, m);
  }
  heatsink.add(fins);

  // středový pás se značkou a kapacitou (překreslitelný)
  const BAND_W = 2048;
  const BAND_H = Math.round((BAND_W * 0.68) / HS_LEN);
  const bandCanvas = document.createElement("canvas");
  bandCanvas.width = BAND_W;
  bandCanvas.height = BAND_H;
  const bandCtx = bandCanvas.getContext("2d")!;
  drawBand(bandCtx, BAND_W, BAND_H, brand, capacity);
  const bandTex = track(new THREE.CanvasTexture(bandCanvas));
  bandTex.colorSpace = THREE.SRGBColorSpace;
  bandTex.anisotropy = 4;
  const bandTop = track(
    new THREE.MeshStandardMaterial({ map: bandTex, roughness: 0.38, metalness: 0.9 }),
  );
  const band = new THREE.Mesh(track(new THREE.BoxGeometry(HS_LEN, 0.15, 0.68)), [
    alu, alu, bandTop, alu, alu, alu,
  ]);
  band.position.set(HS_X, 0.415, 0);
  heatsink.add(band);

  // světelný pruh po hraně
  const edgeMaterial = track(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPos: { value: -0.3 }, uColor: { value: accentColor } },
      vertexShader: /* glsl */ `
        varying float vX;
        void main() {
          vX = position.x / ${HS_LEN.toFixed(2)} + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uPos; uniform vec3 uColor; varying float vX;
        void main() {
          float d = vX - uPos;
          float core = exp(-d * d * 900.0);
          float tail = exp(-d * d * 60.0) * step(d, 0.0) * 0.5;
          float a = core + tail + 0.05;
          gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.7) * a * 2.4, a);
        }`,
    }),
  );
  const edgeGeo = track(new THREE.BoxGeometry(HS_LEN, 0.028, 0.02));
  for (const z of [1.108, -1.108]) {
    const e = new THREE.Mesh(edgeGeo, edgeMaterial);
    e.position.set(HS_X, 0.28, z);
    heatsink.add(e);
  }
  group.add(heatsink);

  const sweepLight = new THREE.PointLight(accentColor, 0, 3.2, 1.6);
  sweepLight.position.set(0, 0.75, 1.25);
  group.add(sweepLight);

  /* ---------- teplotní mapa (heatmap shader) ---------- */
  const heatMaterial = track(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uAmount: { value: 0 }, uHot: { value: 0 }, uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uAmount; uniform float uHot; uniform float uTime;
        float blob(vec2 p, vec2 c, vec2 r) { vec2 d = (p - c) / r; return exp(-dot(d, d)); }
        vec3 ramp(float t) {
          vec3 c0 = vec3(0.03, 0.08, 0.42);
          vec3 c1 = vec3(0.04, 0.50, 0.78);
          vec3 c2 = vec3(0.08, 0.78, 0.58);
          vec3 c3 = vec3(0.93, 0.86, 0.20);
          vec3 c4 = vec3(0.98, 0.45, 0.10);
          vec3 c5 = vec3(0.92, 0.06, 0.08);
          t = clamp(t, 0.0, 1.0) * 5.0;
          if (t < 1.0) return mix(c0, c1, t);
          if (t < 2.0) return mix(c1, c2, t - 1.0);
          if (t < 3.0) return mix(c2, c3, t - 2.0);
          if (t < 4.0) return mix(c3, c4, t - 3.0);
          return mix(c4, c5, t - 4.0);
        }
        void main() {
          vec2 p = vec2((vUv.x - 0.5) * 7.2 - 0.1, (vUv.y - 0.5) * 2.3);
          float spot = blob(p, vec2(-2.6, 0.0), vec2(0.78, 0.72))
                     + blob(p, vec2(0.3, 0.0), vec2(1.0, 0.85)) * 0.62
                     + blob(p, vec2(2.1, 0.0), vec2(1.0, 0.85)) * 0.58
                     + blob(p, vec2(-1.35, 0.0), vec2(0.6, 0.75)) * 0.45;
          spot = clamp(spot, 0.0, 1.0);
          // s chladičem se teplo rozprostře do plochy a zůstane chladné
          float spread = 0.20 + 0.15 * blob(p, vec2(-0.6, 0.0), vec2(3.4, 1.4));
          float h = mix(spread + spot * 0.10, spot * 0.97 + 0.06, uHot);
          h += sin(p.x * 3.0 + uTime * 1.3) * 0.012 * (0.4 + uHot);
          float iso = abs(fract(h * 9.0) - 0.5);
          vec3 col = ramp(h) + smoothstep(0.44, 0.5, iso) * 0.10;
          vec2 e = abs(vUv - 0.5) * 2.0;
          float mask = smoothstep(1.0, 0.9, max(e.x, e.y));
          gl_FragColor = vec4(col, uAmount * mask * mix(0.74, 0.9, uHot));
        }`,
    }),
  );
  const heatMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(7.2, 2.3).rotateX(-Math.PI / 2)), heatMaterial);
  heatMesh.position.set(0.1, 0.5, 0);
  heatMesh.renderOrder = 5;
  heatMesh.visible = false;
  group.add(heatMesh);

  /* ---------- kotvy popisků ---------- */
  const mkAnchor = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    const a = new THREE.Object3D();
    a.position.set(x, y, z);
    parent.add(a);
    return a;
  };
  const anchors: Record<PartKey, THREE.Object3D> = {
    heatsink: mkAnchor(heatsink, 1.4, 0.5, 1.0),
    graphene: mkAnchor(graphene, 3.2, 0.226, 0.95),
    nand: mkAnchor(nand, 2.1, 0.19, 0.7),
    dram: mkAnchor(dram, -1.35, 0.17, 0.62),
    controller: mkAnchor(controller, -2.6, 0.18, -0.5),
    connector: mkAnchor(connector, -3.83, 0.09, 0.9),
  };

  /* ---------- exploded view ---------- */
  // [část, výška rozložení, zpoždění] – horní vrstvy odcházejí první
  const stack: [THREE.Object3D, number, number][] = [
    [heatsink, 2.5, 0],
    [graphene, 1.95, 0.07],
    [padG, 1.5, 0.12],
    [nand, 1.1, 0.18],
    [dram, 0.84, 0.22],
    [controller, 0.58, 0.26],
  ];
  const cooler = new Set<THREE.Object3D>([heatsink, graphene, padG]);

  const layout = (e: number, ho: number) => {
    for (const [obj, lift, d] of stack) {
      // při e ≤ 0 (složeno / přeběh „cvaknutí“) žádné zpoždění, jinak by se vrstvy propadly pod desku
      const ei = e >= 0 ? Math.max(0, (e - d) / (1 - d)) : e * 0.5;
      const off = cooler.has(obj) ? ho * 5 : 0;
      obj.position.y = ei * lift + off;
      obj.visible = !(cooler.has(obj) && ho > 0.985);
    }
    connector.position.x = -Math.max(e, 0) * 1.0 + Math.min(e, 0) * 0.3;
    connector.position.y = -Math.max(e, 0) * 0.25;
  };

  const setHeat = (amount: number, hot: number, time: number) => {
    heatMesh.visible = amount > 0.01;
    heatMaterial.uniforms.uAmount.value = amount;
    heatMaterial.uniforms.uHot.value = hot;
    heatMaterial.uniforms.uTime.value = time;
    // s chladičem leží mapa na žebrování, bez něj na čipech
    heatMesh.position.y = 0.205 + (1 - hot) * 0.3;
  };

  const setCapacity = (text: string) => {
    drawBand(bandCtx, BAND_W, BAND_H, brand, text);
    bandTex.needsUpdate = true;
  };

  return {
    group,
    anchors,
    edgeMaterial,
    sweepLight,
    layout,
    setHeat,
    setCapacity,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

export { HS_LEN, HS_X };

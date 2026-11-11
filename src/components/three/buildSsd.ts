import * as THREE from "three";

export type SsdModel = {
  group: THREE.Group;
  /** Pojmenované části – použije je exploded view ve scroll story. */
  parts: Record<"pcb" | "controller" | "dram" | "nand" | "pad" | "heatsink", THREE.Object3D>;
  edgeMaterial: THREE.ShaderMaterial;
  sweepLight: THREE.PointLight;
  dispose: () => void;
};

type Options = { accent: string; brand: string; lite: boolean };

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

export function buildSsd({ accent, brand, lite }: Options): SsdModel {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

  const group = new THREE.Group();
  const accentColor = new THREE.Color(accent);

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

  // zlaté kontakty
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
  const m = new THREE.Matrix4();
  fingerZ.forEach((z, i) => {
    m.setPosition(-3.83, 0.084, z);
    fingers.setMatrixAt(i * 2, m);
    m.setPosition(-3.83, -0.004, z);
    fingers.setMatrixAt(i * 2 + 1, m);
  });
  pcb.add(fingers);

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
    m.setPosition(x, 0.11, z);
    caps.setMatrixAt(i, m);
  });
  pcb.add(caps);
  group.add(pcb);

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

  const controller = chip(1.1, 0.1, 1.1, -2.6, [
    { text: brand, size: 64, weight: 600, alpha: 0.7 },
    { text: "NVMe CTRL · 8CH", size: 34 },
  ]);
  const dram = chip(0.8, 0.09, 1.3, -1.35, [
    { text: "DDR4", size: 96, weight: 600, alpha: 0.6 },
    { text: "CACHE", size: 60 },
  ]);
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

  /* ---------- teplovodivá podložka ---------- */
  const padMat = track(
    new THREE.MeshStandardMaterial({
      color: accentColor.clone().multiplyScalar(0.35),
      roughness: 0.9,
      metalness: 0,
    }),
  );
  const pad = new THREE.Mesh(track(new THREE.BoxGeometry(6.5, 0.03, 1.9)), padMat);
  pad.position.set(0.1, 0.205, 0);
  group.add(pad);

  /* ---------- chladič ---------- */
  const alu = track(
    new THREE.MeshStandardMaterial({ color: "#2b2d35", roughness: 0.34, metalness: 1 }),
  );
  const heatsink = new THREE.Group();
  const HS_LEN = 6.75;
  const HS_X = 0.075;
  const base = new THREE.Mesh(track(new THREE.BoxGeometry(HS_LEN, 0.12, 2.2)), alu);
  base.position.set(HS_X, 0.28, 0);
  heatsink.add(base);

  const finsPerSide = lite ? 4 : 7;
  const finGeo = track(new THREE.BoxGeometry(HS_LEN, 0.15, lite ? 0.085 : 0.05));
  const fins = new THREE.InstancedMesh(finGeo, alu, finsPerSide * 2);
  for (let i = 0; i < finsPerSide; i++) {
    const z = 0.42 + (i * (1.075 - 0.42)) / (finsPerSide - 1);
    m.setPosition(HS_X, 0.415, z);
    fins.setMatrixAt(i * 2, m);
    m.setPosition(HS_X, 0.415, -z);
    fins.setMatrixAt(i * 2 + 1, m);
  }
  heatsink.add(fins);

  // středový pás s logem
  const bandTex = track(
    labelTexture(
      [{ text: brand.split("").join(" "), size: 44, weight: 300, alpha: 0.85 }],
      2048,
      Math.round((2048 * 0.68) / HS_LEN),
      "#1b1c22",
    ),
  );
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

  return {
    group,
    parts: { pcb, controller, dram, nand, pad, heatsink },
    edgeMaterial,
    sweepLight,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

import * as THREE from "three";

export type Highway = {
  object: THREE.Group;
  uniforms: {
    uOffset: { value: number };
    uSpeed: { value: number };
    uAmount: { value: number };
    uColor: { value: THREE.Color };
  };
  dispose: () => void;
};

const L = 36;

/**
 * „Datová dálnice“: GPU částice (čárky), které proudí po jízdních pruzích.
 * Celá animace běží ve vertex shaderu – z CPU se mění jen offset a rychlost.
 */
export function buildHighway(accent: string, lite: boolean): Highway {
  const n = lite ? 420 : 1500;
  const data = new Float32Array(n * 4); // fáze, y, z, násobek rychlosti
  for (let i = 0; i < n; i++) {
    const lane = Math.floor(Math.random() * 22) - 11;
    data[i * 4] = Math.random();
    data[i * 4 + 1] = lane * 0.3 + (Math.random() - 0.5) * 0.06;
    data[i * 4 + 2] = -5 + Math.random() * 7;
    data[i * 4 + 3] = 0.45 + Math.random() * 1.1;
  }

  const uniforms = {
    uOffset: { value: 0 },
    uSpeed: { value: 0 },
    uAmount: { value: 0 },
    uColor: { value: new THREE.Color(accent) },
  };

  const common = /* glsl */ `
    attribute vec4 aData;
    uniform float uOffset; uniform float uSpeed; uniform float uAmount;
    varying float vA;
    const float L = ${L.toFixed(1)};
    float headX() { return mod(aData.x * L + uOffset * aData.w, L) - L * 0.5; }
    float edgeFade(float x) { return smoothstep(0.0, 5.0, x + L * 0.5) * smoothstep(0.0, 5.0, L * 0.5 - x) * mix(0.3, 1.0, smoothstep(-7.0, 3.0, x)); }
  `;

  const frag = /* glsl */ `
    uniform vec3 uColor; varying float vA;
    void main() { gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.45) * vA * 1.7, vA); }
  `;
  const fragPoint = /* glsl */ `
    uniform vec3 uColor; varying float vA;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float a = vA * smoothstep(1.0, 0.0, d);
      gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.6) * a * 2.0, a);
    }
  `;

  const make = (vertex: string, mode: "lines" | "points") => {
    const fragment = mode === "lines" ? frag : fragPoint;
    const geo = new THREE.BufferGeometry();
    const count = mode === "lines" ? n * 2 : n;
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const attr = new Float32Array(count * 4);
    const end = new Float32Array(count);
    for (let i = 0; i < n; i++) {
      const reps = mode === "lines" ? 2 : 1;
      for (let r = 0; r < reps; r++) {
        const j = i * reps + r;
        attr.set(data.subarray(i * 4, i * 4 + 4), j * 4);
        end[j] = r;
      }
    }
    geo.setAttribute("aData", new THREE.BufferAttribute(attr, 4));
    geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    const obj = mode === "lines" ? new THREE.LineSegments(geo, mat) : new THREE.Points(geo, mat);
    obj.frustumCulled = false;
    return { obj, geo, mat };
  };

  const lines = make(
    /* glsl */ `
      ${common}
      attribute float aEnd;
      void main() {
        float len = (0.5 + uSpeed * 1.4) * aData.w;
        float x = headX() - aEnd * len;
        vA = (1.0 - aEnd) * edgeFade(x) * uAmount * (0.25 + 0.4 * aData.w);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(x, aData.y, aData.z, 1.0);
      }`,
    "lines",
  );
  const heads = make(
    /* glsl */ `
      ${common}
      void main() {
        float x = headX();
        vA = edgeFade(x) * uAmount * (0.35 + 0.5 * aData.w);
        vec4 mv = modelViewMatrix * vec4(x, aData.y, aData.z, 1.0);
        gl_PointSize = (1.6 + uSpeed * 0.7) * (16.0 / -mv.z) * 2.2;
        gl_Position = projectionMatrix * mv;
      }`,
    "points",
  );

  const object = new THREE.Group();
  object.add(lines.obj, heads.obj);
  object.visible = false;

  return {
    object,
    uniforms,
    dispose: () => {
      lines.geo.dispose();
      lines.mat.dispose();
      heads.geo.dispose();
      heads.mat.dispose();
    },
  };
}

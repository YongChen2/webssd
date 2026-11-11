import * as THREE from "three";

/**
 * Lehké studiové prostředí místo RoomEnvironment: tři softboxy (klíčový shora,
 * boční pruh, modrý rim) na tmavém pozadí. Dost na ostré odlesky na kovu a PCB,
 * bez desítek boxů a velké geometrie.
 */
export function buildStudioEnv(accent: string) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07070a");
  const mats: THREE.Material[] = [];
  const box = (w: number, h: number, color: THREE.ColorRepresentation, intensity: number, pos: [number, number, number], look: [number, number, number] = [0, 0, 0]) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    mats.push(m);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(...pos);
    mesh.lookAt(...look);
    scene.add(mesh);
    return mesh;
  };
  box(14, 9, "#ffffff", 7, [0, 12, 2]); // klíčový softbox shora
  box(2.5, 14, "#ffffff", 5, [-11, 3, 5]); // boční pruh
  box(2.5, 12, "#ffffff", 3.2, [11, 2, 4]); // protipruh
  box(16, 3, accent, 4.5, [0, 1, -12]); // akcentový rim zezadu
  box(18, 18, "#16161c", 1, [0, -10, 0]); // slabý odraz od podlahy
  return {
    scene,
    dispose: () => {
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}

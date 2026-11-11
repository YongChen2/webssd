import { createStore } from "./store";

/** Části modelu, ke kterým se v exploded view vážou popisky. */
export const PART_KEYS = ["heatsink", "graphene", "nand", "dram", "controller", "connector"] as const;
export type PartKey = (typeof PART_KEYS)[number];

/**
 * Póza disku vůči základnímu záběru v hero.
 * x, y – posun v násobcích viditelné šířky/výšky, s – měřítko, r* – přírůstek rotace (rad),
 * o – průhlednost plátna, spin – 1 = volná rotace, 0 = pevný úhel ry,
 * hw – intenzita „datové dálnice“, heat – intenzita teplotní mapy.
 */
export type Pose = {
  x: number;
  y: number;
  s: number;
  rx: number;
  ry: number;
  rz: number;
  o: number;
  spin: number;
  hw: number;
  heat: number;
};

export const HERO_POSE: Pose = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, o: 1, spin: 1, hw: 0, heat: 0 };

/**
 * Mutabilní sdílený stav „příběhu“. Scroll (GSAP) do něj píše, 3D smyčka z něj čte
 * každý snímek – bez React renderů.
 */
export const story = {
  /** cílová póza podle scrollu; scéna ji vyhlazuje */
  target: { ...HERO_POSE } as Pose,
  /** 0 = složený disk, 1 = rozložený (může krátce přeběhnout pod 0 = „cvaknutí“) */
  explode: 0,
  /** doplňková rotace během pinu exploded view */
  extraYaw: 0,
  techProgress: 0,
  /** je exploded view aktivní → projektovat kotvy popisků */
  labelsOn: false,
  /** posluchači změny labelsOn (popisky počítají polohy jen při aktivním pinu) */
  labelsListeners: new Set<() => void>(),
  /** čas posledního „cvaknutí“ (ms, performance.now) */
  pulseAt: -1e9,
  anchors: Object.fromEntries(PART_KEYS.map((k) => [k, { x: 0, y: 0 }])) as Record<PartKey, { x: number; y: number }>,
};

/** Skutečný postup načítání 3D (0–1): chunk → prostředí → model → první snímek. */
export const loadStore = createStore(0);
/** Vybraný model (index v site.models) – řídí štítek na disku i cenu. */
export const capacityStore = createStore<number>(1);
/** true = disk s chladičem */
export const heatSinkStore = createStore(true);
/** Zvukový design – ve výchozím stavu vypnutý. */
export const soundStore = createStore(false);

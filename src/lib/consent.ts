import { createStore } from "./store";

/** pending = ještě jsme nečetli úložiště (SSR / první render), unset = návštěvník se zatím nerozhodl */
export type Consent = "pending" | "unset" | "all" | "necessary";
const KEY = "velor-consent";

/** Souhlas s cookies. Analytika se načítá výhradně při hodnotě "all". */
export const consentStore = createStore<Consent>("pending");

export function restoreConsent() {
  try {
    const v = localStorage.getItem(KEY);
    consentStore.set(v === "all" || v === "necessary" ? v : "unset");
  } catch {
    consentStore.set("unset"); // úložiště nemusí být dostupné
  }
}

export function setConsent(v: "all" | "necessary") {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* ignore */
  }
  consentStore.set(v);
}

export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  consentStore.set("unset");
}

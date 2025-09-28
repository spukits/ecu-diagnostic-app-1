// client/src/settings.js
export const THEMES = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' };

const KEY = 'app_settings';
const DEFAULTS = {
  theme: THEMES.SYSTEM,
  brand: '#00BCD4',
  fontScale: 1.0,
  fontWeight: 500,       // ένταση γραμματοσειράς (400–700)
  tableCompact: false,
  chartAnimations: true,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function applySettings(s) {
  const root = document.documentElement;

  // theme
  if (s.theme === THEMES.SYSTEM) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', s.theme === THEMES.DARK);
  }

  // CSS variables
  root.style.setProperty('--brand', s.brand);
  root.style.setProperty('--font-scale', String(s.fontScale));
  root.style.setProperty('--font-weight', String(s.fontWeight));

  // data attributes
  root.dataset.tableCompact = s.tableCompact ? '1' : '0';
  root.dataset.chartAnimations = s.chartAnimations ? '1' : '0';

  // ενημέρωση components που ακούνε το event
  try {
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new Event("settings:changed"));
    }
  } catch {}
}

export function saveSettings(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  applySettings(next);
}

export function initSettings() {
  applySettings(loadSettings());
}

// === Helpers για χρήση στα components ===
export function brandColor() {
  const s = loadSettings();
  return s.brand || '#00BCD4';
}

export function chartAnimate() {
  const s = loadSettings();
  return !!s.chartAnimations;
}

export function isTableCompact() {
  const s = loadSettings();
  return !!s.tableCompact;
}

export function fontWeight() {
  const s = loadSettings();
  return s.fontWeight || 500;
}

export function textColor() {
  // Παίρνει την τρέχουσα τιμή από το CSS var --fg
  if (typeof window === "undefined") return "#e5e7eb";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--fg");
  return (v && v.trim()) || "#e5e7eb";
}

export function dimTextColor() {
  // Παίρνει την τρέχουσα τιμή από το CSS var --fg-dim
  if (typeof window === "undefined") return "#9ca3af";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--fg-dim");
  return (v && v.trim()) || "#9ca3af";
}

// Προαιρετικό: Hook για live αλλαγές
export function onSettingsChange(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("settings:changed", handler);
  return () => window.removeEventListener("settings:changed", handler);
}

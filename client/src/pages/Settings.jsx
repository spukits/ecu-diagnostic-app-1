// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { THEMES, loadSettings, saveSettings } from "../settings";

export default function Settings() {
  const [s, setS] = useState(loadSettings());

  // Εφαρμογή άμεσα κάθε αλλαγής
  useEffect(() => {
    saveSettings(s);
  }, [s]);

  const setTheme = (theme) => setS({ ...s, theme });
  const setBrand = (brand) => setS({ ...s, brand });
  const setFontScale = (fontScale) => setS({ ...s, fontScale });
  const setTableCompact = (v) => setS({ ...s, tableCompact: v });
  const setChartAnimations = (v) => setS({ ...s, chartAnimations: v });

  return (
    <div className="page-wrap">
      <h1 className="title mb-4">Settings</h1>

      {/* Theme */}
      <section className="card grid gap-3 mb-4">
        <h2 className="text-xl">Theme</h2>
        <div className="flex gap-2 flex-wrap">
          {[THEMES.LIGHT, THEMES.DARK].map((key) => (
            <button
              key={key}
              className={`btn ${s.theme === key ? "ring-2 ring-white/30" : ""}`}
              onClick={() => setTheme(key)}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <p className="muted">Εφαρμόζεται σε όλη την εφαρμογή.</p>
      </section>

      {/* Brand color (μόνο Custom) */}
      <section className="card grid gap-3 mb-4">
        <h2 className="text-xl">Brand Color</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="btn">
            Custom
            <input
              type="color"
              className="ml-2 cursor-pointer bg-transparent"
              value={s.brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </label>
          <span className="muted">Τρέχον: <code>{s.brand}</code></span>
        </div>
        <p className="muted">Χρησιμοποιείται σε κουμπιά/τονισμούς/διαγράμματα.</p>
      </section>

      {/* Font size */}
      <section className="card grid gap-3 mb-4">
        <h2 className="text-xl">Font Size</h2>
        <input
          type="range"
          min="0.9"
          max="1.1"
          step="0.01"
          value={s.fontScale}
          onChange={(e) => setFontScale(parseFloat(e.target.value))}
        />
        <div className="muted">
          Τρέχουσα κλίμακα: {Math.round(s.fontScale * 100)}%
        </div>
      </section>

      {/* Table/Chart preferences */}
      <section className="card grid gap-3">
        <h2 className="text-xl">Preferences</h2>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.tableCompact}
            onChange={(e) => setTableCompact(e.target.checked)}
          />
          Compact tables (λιγότερο padding σε rows)
        </label>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.chartAnimations}
            onChange={(e) => setChartAnimations(e.target.checked)}
          />
          Smooth chart animations
        </label>

        <p className="muted">
          Αυτές οι προτιμήσεις είναι διαθέσιμες σε Components μέσω{" "}
          <code>document.documentElement.dataset</code>.
        </p>
      </section>
    </div>
  );
}

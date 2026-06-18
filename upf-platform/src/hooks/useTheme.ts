import { useState } from "react";
import type { Theme } from "../types";

// ─── HOOK : useTheme ──────────────────────────────────────────────────────────
export function useTheme(): { theme: Theme; darkMode: boolean; setDarkMode: React.Dispatch<React.SetStateAction<boolean>> } {
  const [darkMode, setDarkMode] = useState(false);

  const theme: Theme = {
    bg:           darkMode ? "#0f172a"  : "#f1f5f9",
    surface:      darkMode ? "#1e293b"  : "#ffffff",
    surface2:     darkMode ? "#334155"  : "#f8fafc",
    border:       darkMode ? "#334155"  : "#e2e8f0",
    text:         darkMode ? "#f1f5f9"  : "#1e293b",
    textMuted:    darkMode ? "#94a3b8"  : "#64748b",
    primary:      "#1d4ed8",
    primaryLight: darkMode ? "#1e3a8a"  : "#dbeafe",
    accent:       "#059669",
    accentLight:  darkMode ? "#064e3b"  : "#d1fae5",
    orange:       "#ea580c",
    orangeLight:  darkMode ? "#431407"  : "#fed7aa",
    sidebar:      darkMode ? "#1e293b"  : "#1e3a8a",
  };

  return { theme, darkMode, setDarkMode };
}

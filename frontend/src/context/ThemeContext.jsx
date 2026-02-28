import { createContext, useContext, useState, useEffect } from "react";

const TC = createContext(null);

// ── Dark theme ────────────────────────────────────────────────────────────────
export const DARK = {
    bgPage: "#060608",
    bgCard: "rgba(13,13,16,0.98)",
    bgCardAlt: "#141418",
    bgInput: "#161618",
    bgButton: "#1a1a1a",
    borderCard: "#1e1e22",
    borderInput: "#2a2a2a",
    textPrimary: "#f1f5f9",
    textSecondary: "#9ca3af",
    textMuted: "#4b5563",
    sidebarBg: "rgba(8,8,12,0.98)",
    sidebarBorder: "#1f1f1f",
    sidebarText: "#e5e5e5",
    sidebarMuted: "#4b5563",
    sidebarActive: "#1e1e28",
    topbarBg: "rgba(6,6,8,0.94)",
    topbarBorder: "#1e1e22",
    fontHeading: '"Plus Jakarta Sans", sans-serif',
    fontBody: '"Plus Jakarta Sans", sans-serif',
    fontMono: '"Roboto Mono", monospace',
    isGlass: false,
};

// ── Light theme — Premium Matte ───────────────────────────────────────────────
// Philosophy: no blur, no glass, no transparency.
// Matte solid backgrounds. Depth from shadow, not opacity.
// Cool blue-tinted off-whites. Navy topbar/sidebar for crisp contrast.
export const LIGHT = {
    //  Page — cool slate matte (not white, not grey — a tinted off-canvas)
    bgPage: "#edf0f6",
    //  Cards — warm near-white, matte solid
    bgCard: "#f7f8fc",
    bgCardAlt: "#f0f3f9",
    bgInput: "#eef1f7",
    bgButton: "#e8ecf5",
    borderCard: "#dde3f0",      // soft blue-grey outline
    borderInput: "#c8d2e8",
    //  Typography — navy-black family
    textPrimary: "#141829",      // deep navy-black (not pure #000)
    textSecondary: "#3d4a7a",      // medium indigo
    textMuted: "#7b88b4",      // blue-grey
    //  Sidebar — deep dark navy, minimal
    sidebarBg: "#181c2e",
    sidebarBorder: "#242844",
    sidebarText: "#e8eaf5",
    sidebarMuted: "rgba(180,188,230,0.45)",
    sidebarActive: "rgba(99,102,241,0.18)",
    //  Topbar — matches sidebar for a unified dark header band
    topbarBg: "#181c2e",
    topbarBorder: "#242844",
    topbarText: "#f0f2fc",
    topbarTextMuted: "rgba(180,188,230,0.65)",
    fontHeading: '"Plus Jakarta Sans", sans-serif',
    fontBody: '"Plus Jakarta Sans", sans-serif',
    fontMono: '"Roboto Mono", monospace',
    //  NO glass — matte solid design
    isGlass: false,
    //  Shadow token for cards — used inline by components
    cardShadow: "0 1px 4px rgba(20,24,44,0.07), 0 4px 16px rgba(20,24,44,0.05)",
    cardShadowHov: "0 4px 20px rgba(20,24,44,0.13), 0 1px 4px rgba(20,24,44,0.08)",
};

// GLASS_STYLE kept for legacy compatibility but won't activate when isGlass=false
export const GLASS_STYLE = {
    backdropFilter: "blur(18px) saturate(180%)",
    WebkitBackdropFilter: "blur(18px) saturate(180%)",
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") !== "light");
    const colors = isDark ? DARK : LIGHT;

    useEffect(() => {
        localStorage.setItem("theme", isDark ? "dark" : "light");
        const b = document.body;
        b.style.backgroundColor = isDark ? "#060608" : "#edf0f6";
        b.style.backgroundImage = "none";
        b.style.color = colors.textPrimary;
        b.style.fontFamily = colors.fontBody;
        b.style.transition = "background-color 0.35s ease, color 0.25s ease";
    }, [isDark]);

    return (
        <TC.Provider value={{ isDark, colors, toggleTheme: () => setIsDark(v => !v) }}>
            {children}
        </TC.Provider>
    );
}

export function useTheme() { return useContext(TC); }

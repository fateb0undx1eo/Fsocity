import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import MachineCard from "../components/MachineCard";
import AddMachineModal from "../components/AddMachineModal";
import { useMachines } from "../context/MachinesContext";
import { useTheme } from "../context/ThemeContext";
import { useAlerts } from "../context/AlertsContext";
import socket from "../services/socket";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FILTER_OPTIONS = [
  { key: "All", label: "All", color: "#6366f1" },
  { key: "Normal", label: "● Normal", color: "#22c55e" },
  { key: "Warning", label: "● Warning", color: "#f59e0b" },
  { key: "Critical", label: "● Critical", color: "#ef4444" },
];

const GLASS_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

export default function Dashboard() {
  const [socketMachines, setSocketMachines] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const { userMachines, isHidden } = useMachines();
  const { colors: c, isDark } = useTheme();
  const { checkLimits } = useAlerts();

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("machines", (data) => {
      const arr = Object.values(data);
      setSocketMachines(arr);
      checkLimits(arr);
    });
    return () => { socket.off("connect"); socket.off("disconnect"); socket.off("machines"); };
  }, [checkLimits]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const allMachines = [
    ...socketMachines.filter(m => !isHidden(String(m.id))),
    ...userMachines,
  ];

  // Apply status filter + search
  const filtered = allMachines
    .filter(m => filter === "All" || (m.status || "Normal") === filter)
    .filter(m => !search.trim() ||
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      String(m.id).includes(search)
    );

  const searchBarBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.55)";
  const searchBarBorder = searchFocused
    ? "rgba(99,102,241,0.7)"
    : (isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)");

  const activeFilter = FILTER_OPTIONS.find(f => f.key === filter) || FILTER_OPTIONS[0];
  const counts = { All: allMachines.length };
  allMachines.forEach(m => {
    const s = m.status || "Normal";
    counts[s] = (counts[s] || 0) + 1;
  });

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ padding: "32px 36px", minWidth: 0 }}>

        {/* ── Header row ──────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: c.textPrimary, fontFamily: c.fontHeading, letterSpacing: "-0.03em", margin: 0 }}>
            Dashboard
          </h2>
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "999px",
            background: connected ? "#bbf7d0" : "#fecaca",
            color: connected ? "#14532d" : "#7f1d1d",
            textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: c.fontBody,
          }}>
            {connected ? "● Live" : "○ Off"}
          </span>
        </div>

        {/* ── Toolbar: Filter | Search | Add Machine ──────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>

          {/* ── LEFT: Filter dropdown ───────────────────────── */}
          <div ref={filterRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setFilterOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                background: filterOpen
                  ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)")
                  : (isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.55)"),
                border: `1.5px solid ${filterOpen ? "rgba(99,102,241,0.5)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)")}`,
                borderRadius: "999px",
                padding: "9px 16px",
                cursor: "pointer",
                color: filterOpen ? (isDark ? "#818cf8" : "#4f46e5") : c.textMuted,
                fontFamily: c.fontBody, fontSize: "13px", fontWeight: 600,
                transition: "all 0.15s",
                ...(isDark ? {} : GLASS_STYLE),
              }}
            >
              <FilterIcon />
              <span style={{ color: filter !== "All" ? activeFilter.color : "inherit" }}>
                {filter === "All" ? "Filter" : filter}
              </span>
              {filter !== "All" && (
                <span style={{
                  background: activeFilter.color + "22",
                  color: activeFilter.color,
                  borderRadius: "999px", padding: "1px 6px",
                  fontSize: "10px", fontWeight: 700,
                }}>{counts[filter] || 0}</span>
              )}
              <span style={{ opacity: 0.5, display: "flex", transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <ChevronDown />
              </span>
            </button>

            {/* Dropdown panel */}
            {filterOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100,
                background: isDark ? "#0f0f14" : "#fff",
                border: `1px solid ${isDark ? "#1e1e28" : "#e2e8f0"}`,
                borderRadius: "14px", padding: "6px",
                boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.6)" : "0 8px 32px rgba(20,24,44,0.14)",
                minWidth: "160px",
              }}>
                {FILTER_OPTIONS.map(f => {
                  const active = filter === f.key;
                  return (
                    <button key={f.key}
                      onClick={() => { setFilter(f.key); setFilterOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "8px 12px",
                        background: active ? `${f.color}14` : "transparent",
                        border: "none", borderRadius: "9px", cursor: "pointer",
                        color: active ? f.color : c.textPrimary,
                        fontFamily: c.fontBody, fontSize: "13px", fontWeight: active ? 700 : 400,
                        transition: "background 0.1s",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#f5f7fc"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span>{f.label}</span>
                      <span style={{
                        background: isDark ? "#1a1a22" : "#f1f5f9",
                        color: c.textMuted, borderRadius: "999px",
                        padding: "1px 8px", fontSize: "10px", fontWeight: 700,
                      }}>{counts[f.key] ?? 0}</span>
                    </button>
                  );
                })}
                {filter !== "All" && (
                  <div style={{ borderTop: `1px solid ${isDark ? "#1e1e28" : "#f1f5f9"}`, marginTop: "4px", paddingTop: "4px" }}>
                    <button onClick={() => { setFilter("All"); setFilterOpen(false); }}
                      style={{
                        width: "100%", padding: "7px 12px", background: "transparent",
                        border: "none", borderRadius: "9px", cursor: "pointer",
                        color: c.textMuted, fontFamily: c.fontBody, fontSize: "12px",
                        textAlign: "left",
                      }}>
                      Clear filter ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── CENTRE: Search bar ───────────────────────────── */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: "10px",
            background: searchBarBg,
            border: `1.5px solid ${searchBarBorder}`,
            borderRadius: "999px",
            padding: "9px 18px",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: searchFocused
              ? `0 0 0 3px ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`
              : isDark ? "none" : "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(99,102,241,0.08)",
            ...(isDark ? {} : GLASS_STYLE),
          }}>
            <span style={{ color: c.textMuted, flexShrink: 0, display: "flex" }}><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search machines…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: c.textPrimary, fontFamily: c.fontBody, fontSize: "13px",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: c.textMuted, fontSize: "16px", lineHeight: 1, padding: 0,
              }}>×</button>
            )}
          </div>

          {/* ── RIGHT: Add Machine ───────────────────────────── */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              flexShrink: 0,
              background: "#4f46e5",
              border: "none", borderRadius: "999px",
              color: "#fff", padding: "9px 22px",
              fontSize: "13px", fontWeight: 700,
              fontFamily: c.fontBody, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,70,229,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.4)"; }}
          >
            + Add Machine
          </button>
        </div>

        {/* ── Active filter indicator ───────────────────────── */}
        {filter !== "All" && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            marginBottom: "16px",
            background: `${activeFilter.color}12`,
            border: `1px solid ${activeFilter.color}30`,
            borderRadius: "999px", padding: "4px 12px",
            fontFamily: c.fontBody, fontSize: "11px", color: activeFilter.color, fontWeight: 700,
          }}>
            Showing: {filter} machines
            <button onClick={() => setFilter("All")} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: activeFilter.color, fontSize: "14px", lineHeight: 1, padding: 0, opacity: 0.7,
            }}>×</button>
          </div>
        )}

        {/* ── Machine grid ─────────────────────────────────────── */}
        {allMachines.length === 0 && !search ? (
          <div style={{ color: c.textMuted, fontSize: "14px", marginTop: "80px", textAlign: "center", fontFamily: c.fontBody }}>
            {connected ? "No machines yet — add one above." : "Waiting for telemetry data…"}
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div style={{ color: c.textMuted, fontSize: "14px", marginTop: "60px", textAlign: "center", fontFamily: c.fontBody }}>
                {search ? `No machines match "${search}"` : `No ${filter} machines.`}
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                width: "100%",
              }}>
                {filtered.map(m => <MachineCard key={m.id} machine={m} />)}

                {/* ── Plus ghost card ─────────────────────────── */}
                {!search && filter === "All" && <PlusCard onClick={() => setShowModal(true)} c={c} isDark={isDark} />}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && <AddMachineModal onClose={() => setShowModal(false)} />}
    </div>
  );
}


// Ghost card with + button
function PlusCard({ onClick, c, isDark }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: "18px",
        border: `2px dashed ${hov ? (isDark ? "rgba(99,102,241,0.7)" : "rgba(79,70,229,0.55)") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.25)")}`,
        background: hov
          ? (isDark ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.45)")
          : (isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.28)"),
        backdropFilter: !isDark ? "blur(12px)" : "none",
        WebkitBackdropFilter: !isDark ? "blur(12px)" : "none",
        cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "180px",
        gap: "12px",
        transition: "border-color 0.25s, background 0.25s, transform 0.25s cubic-bezier(0.34,1.4,0.64,1)",
        transform: hov ? "translateY(-4px) scale(1.015)" : "translateY(0) scale(1)",
      }}
    >
      {/* Plus circle */}
      <div style={{
        width: "48px", height: "48px", borderRadius: "50%",
        background: hov ? "#4f46e5" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.12)"),
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.25s",
        boxShadow: hov ? "0 6px 20px rgba(79,70,229,0.4)" : "none",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={hov ? "#fff" : (isDark ? "rgba(255,255,255,0.4)" : "rgba(99,102,241,0.6)")}
          strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span style={{
        fontSize: "13px", fontWeight: 600, fontFamily: c.fontBody,
        color: hov ? (isDark ? "rgba(255,255,255,0.8)" : "#4f46e5") : c.textMuted,
        transition: "color 0.2s",
      }}>
        Add Machine
      </span>
    </div>
  );
}

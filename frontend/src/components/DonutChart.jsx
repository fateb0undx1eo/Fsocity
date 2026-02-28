import { useState, useEffect } from "react";

const TWO_PI = Math.PI * 2;

function pt(cx, cy, r, a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }

function arcPath(cx, cy, outerR, innerR, a1, a2) {
    const o1 = pt(cx, cy, outerR, a1), o2 = pt(cx, cy, outerR, a2);
    const i1 = pt(cx, cy, innerR, a1), i2 = pt(cx, cy, innerR, a2);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return [
        `M ${o1.x} ${o1.y}`,
        `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
        `L ${i2.x} ${i2.y}`,
        `A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y}`,
        "Z",
    ].join(" ");
}

function lighten(hex, a) {
    if (!hex?.startsWith("#")) return hex;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.round(r + (255 - r) * a)},${Math.round(g + (255 - g) * a)},${Math.round(b + (255 - b) * a)})`;
}

function buildSlices(data) {
    const total = data.reduce((s, d) => s + Math.max(d.value, 0.5), 0);
    let angle = -Math.PI / 2;
    return data.map((d, i) => {
        const sweep = (Math.max(d.value, 0.5) / total) * TWO_PI;
        const s = angle, e = angle + sweep;
        angle = e;
        return { ...d, s, e, mid: (s + e) / 2, i };
    });
}

// Compact dimensions — fits neatly inside the right column card
const CX = 80, CY = 80, OUTER = 62, INNER = 38, POP = 10, SIZE = 160;

export default function DonutChart({ data, textColor = "rgba(255,255,255,0.35)" }) {
    const [hovIdx, setHovIdx] = useState(null);
    const [centerKey, setCenterKey] = useState(0);

    // ── Freeze data while hovering so 2s updates don't interrupt the animation
    const [frozenData, setFrozenData] = useState(data);
    useEffect(() => {
        if (hovIdx === null) setFrozenData(data);
    }, [data, hovIdx]);

    const slices = buildSlices(frozenData);
    const hov = hovIdx !== null ? slices[hovIdx] : null;

    function enter(i) { setHovIdx(i); setCenterKey(k => k + 1); }
    function leave() { setHovIdx(null); }

    return (
        <div>
            {/* Fixed-width SVG — never stretches */}
            <div style={{ width: SIZE, margin: "0 auto" }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
                    <defs>
                        {slices.map(s => (
                            <radialGradient key={s.i} id={`dg-${s.i}`} cx="38%" cy="38%" r="65%">
                                <stop offset="0%" stopColor={lighten(s.color, 0.5)} />
                                <stop offset="100%" stopColor={s.color} />
                            </radialGradient>
                        ))}
                        <filter id="sg" x="-70%" y="-70%" width="240%" height="240%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
                            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* Slices */}
                    {slices.map(s => {
                        const isHov = hovIdx === s.i;
                        const dim = hovIdx !== null && !isHov;
                        const dx = isHov ? Math.cos(s.mid) * POP : 0;
                        const dy = isHov ? Math.sin(s.mid) * POP : 0;
                        return (
                            <path key={s.i}
                                d={arcPath(CX, CY, OUTER, INNER, s.s, s.e)}
                                fill={isHov ? `url(#dg-${s.i})` : s.color + "dd"}
                                stroke={isHov ? lighten(s.color, 0.3) : "rgba(0,0,0,0.35)"}
                                strokeWidth={isHov ? 1.2 : 0.5}
                                filter={isHov ? "url(#sg)" : "none"}
                                style={{
                                    transform: `translate(${dx}px, ${dy}px)`,
                                    opacity: dim ? 0.28 : 1,
                                    cursor: "pointer",
                                    transition: "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s, fill 0.15s",
                                }}
                                onMouseEnter={() => enter(s.i)}
                                onMouseLeave={leave}
                            />
                        );
                    })}

                    {/* Center text */}
                    <g key={`c-${centerKey}`} style={{ animation: "dcFade 0.2s ease-out" }}>
                        {hov ? (
                            <>
                                <text x={CX} y={CY - 8} textAnchor="middle" fill={hov.color}
                                    style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800 }}>
                                    {hov.actual?.toFixed(1)}<tspan style={{ fontSize: 8, opacity: 0.7 }}>{hov.unit}</tspan>
                                </text>
                                <text x={CX} y={CY + 6} textAnchor="middle" fill="rgba(255,255,255,0.55)"
                                    style={{ fontFamily: "var(--font-body)", fontSize: 8.5 }}>
                                    {hov.name}
                                </text>
                                <text x={CX} y={CY + 18} textAnchor="middle" fill={hov.color}
                                    style={{ fontFamily: "var(--font-mono)", fontSize: 8, opacity: 0.6 }}>
                                    {hov.value.toFixed(0)}%
                                </text>
                            </>
                        ) : (
                            <text x={CX} y={CY + 4} textAnchor="middle" fill={textColor}
                                style={{ fontFamily: "var(--font-body)", fontSize: 9 }}>
                                hover slice
                            </text>
                        )}
                    </g>
                </svg>
            </div>

            {/* Compact legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" }}>
                {slices.map(s => (
                    <div key={s.i}
                        onMouseEnter={() => enter(s.i)}
                        onMouseLeave={leave}
                        style={{
                            display: "flex", alignItems: "center", gap: "7px",
                            fontSize: "11px", cursor: "pointer",
                            opacity: hovIdx !== null && hovIdx !== s.i ? 0.3 : 1,
                            transition: "opacity 0.2s",
                        }}>
                        <span style={{
                            width: 7, height: 7, borderRadius: "2px", background: s.color, flexShrink: 0,
                            boxShadow: hovIdx === s.i ? `0 0 6px ${s.color}` : "none", transition: "box-shadow 0.2s"
                        }} />
                        <span style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.55)", flex: 1 }}>{s.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
                            {s.actual?.toFixed(1)}<span style={{ opacity: 0.45, fontSize: 9 }}>{s.unit}</span>
                        </span>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes dcFade { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
        </div>
    );
}

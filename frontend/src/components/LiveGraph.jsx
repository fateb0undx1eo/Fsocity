import {
    LineChart, Line, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const LINE_COLORS = [
    "#60a5fa", "#34d399", "#f87171",
    "#fbbf24", "#a78bfa", "#fb923c",
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",   /* JetBrains Mono in tooltip */
        }}>
            <p style={{ color: "#9ca3af", marginBottom: "6px", fontFamily: "var(--font-body)", fontSize: "11px" }}>
                {label}
            </p>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ color: p.color, marginBottom: "2px" }}>
                    {p.dataKey}: <strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong>
                </div>
            ))}
        </div>
    );
};

export default function LiveGraph({ history, sensorKeys }) {
    if (!history || history.length === 0) {
        return (
            <div style={{
                height: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4b5563",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
            }}>
                Waiting for data…
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {sensorKeys.map((key, i) => (
                        <Line
                            key={key}
                            type="monotoneX"
                            dataKey={key}
                            stroke={LINE_COLORS[i % LINE_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

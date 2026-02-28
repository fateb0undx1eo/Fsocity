import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

// Accurate Y-axis domain per sensor type
export const SENSOR_DOMAINS = {
    temperature: [-10, 200], humidity: [0, 100], power: [0, 10],
    pressure: [0, 150], gas: [0, 10], vibration: [0, 50],
    current: [0, 50], voltage: [180, 260], fuel: [0, 100],
    rpm: [0, 3000], cpuTemp: [20, 120], load: [0, 100],
};

export default function SensorGraph({ sensorKey, history, color = "#60a5fa" }) {
    const domain = SENSOR_DOMAINS[sensorKey] ?? ["auto", "auto"];

    const data = (history || [])
        .map(p => ({ time: p.time, v: typeof p[sensorKey] === "number" ? p[sensorKey] : null }))
        .filter(p => p.v !== null);

    if (data.length < 2) {
        return (
            <div style={{
                height: 90, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#4b5563", fontSize: 12, fontFamily: "var(--font-body)",
            }}>
                Collecting data…
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={90}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis
                    domain={domain}
                    tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
                    axisLine={false} tickLine={false} tickCount={4}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                            <div style={{
                                background: "#111", border: "1px solid #2a2a2a", borderRadius: 6,
                                padding: "4px 8px", fontSize: 11, fontFamily: "var(--font-mono)", color,
                            }}>
                                {payload[0].value?.toFixed(2)}
                            </div>
                        );
                    }}
                />
                <Line
                    type="monotoneX" dataKey="v" stroke={color}
                    strokeWidth={1.5} dot={false} isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

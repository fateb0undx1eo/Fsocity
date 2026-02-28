import { useState } from "react";
import { useMachines } from "../context/MachinesContext";

const SENSOR_LABELS = {
    temperature: "Temperature (°C)", humidity: "Humidity (%)", power: "Power (kW)",
    pressure: "Pressure (bar)", gas: "Gas (ppm)", vibration: "Vibration (mm/s)",
    current: "Current (A)", voltage: "Voltage (V)", fuel: "Fuel Level (%)",
    rpm: "RPM", cpuTemp: "CPU Temp (°C)", load: "System Load (%)",
};

export default function AddMachineModal({ onClose }) {
    const { addMachine, ALL_SENSORS } = useMachines();
    const [name, setName] = useState("");
    const [selected, setSelected] = useState([]);

    function toggle(s) {
        setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    }

    function handleAdd() {
        if (!name.trim() || selected.length === 0) return;
        addMachine(name.trim(), selected);
        onClose();
    }

    const canAdd = name.trim() && selected.length > 0;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#0f0f0f", border: "1px solid #2a2a2a",
                    borderRadius: "20px", padding: "32px", width: "460px", maxWidth: "92vw",
                    maxHeight: "90vh", overflowY: "auto",
                }}
            >
                <h2 style={{
                    fontSize: "20px", fontWeight: 700, color: "#e5e5e5",
                    fontFamily: "var(--font-heading)", marginBottom: "24px",
                }}>
                    Add New Machine
                </h2>

                {/* Name */}
                <p style={{ fontSize: "11px", color: "#6b7280", fontFamily: "var(--font-body)", marginBottom: "6px", letterSpacing: "0.06em" }}>
                    MACHINE NAME
                </p>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Pump Station A"
                    style={{
                        width: "100%", background: "#141414", border: "1px solid #2a2a2a",
                        borderRadius: "10px", color: "#e5e5e5", padding: "10px 14px",
                        fontSize: "14px", fontFamily: "var(--font-body)", outline: "none",
                        marginBottom: "24px", boxSizing: "border-box",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#60a5fa"}
                    onBlur={e => e.target.style.borderColor = "#2a2a2a"}
                />

                {/* Sensor picker */}
                <p style={{ fontSize: "11px", color: "#6b7280", fontFamily: "var(--font-body)", marginBottom: "12px", letterSpacing: "0.06em" }}>
                    SELECT SENSORS ({selected.length} selected)
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "28px" }}>
                    {ALL_SENSORS.map(sensor => {
                        const on = selected.includes(sensor);
                        return (
                            <div
                                key={sensor}
                                onClick={() => toggle(sensor)}
                                style={{
                                    background: on ? "#0f2d4a" : "#141414",
                                    border: `1px solid ${on ? "#3b82f6" : "#2a2a2a"}`,
                                    borderRadius: "8px", padding: "9px 12px",
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                                    transition: "all 0.15s",
                                }}
                            >
                                <div style={{
                                    width: "14px", height: "14px", borderRadius: "4px", flexShrink: 0,
                                    border: `2px solid ${on ? "#3b82f6" : "#6b7280"}`,
                                    background: on ? "#3b82f6" : "transparent",
                                    transition: "all 0.15s",
                                }} />
                                <span style={{
                                    fontSize: "12px", fontFamily: "var(--font-body)",
                                    color: on ? "#e5e5e5" : "#9ca3af",
                                }}>
                                    {SENSOR_LABELS[sensor] || sensor}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, background: "#141414", border: "1px solid #2a2a2a",
                            borderRadius: "10px", color: "#9ca3af", padding: "11px",
                            cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "14px",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!canAdd}
                        style={{
                            flex: 1, background: canAdd ? "#2563eb" : "#1a1a1a",
                            border: "none", borderRadius: "10px",
                            color: canAdd ? "#fff" : "#4b5563",
                            padding: "11px", cursor: canAdd ? "pointer" : "default",
                            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px",
                            transition: "background 0.2s",
                        }}
                    >
                        Add Machine
                    </button>
                </div>
            </div>
        </div>
    );
}

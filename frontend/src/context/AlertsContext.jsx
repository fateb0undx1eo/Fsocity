import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AlertsCtx = createContext(null);
const SAFE_DEFAULT = { machineLimits: {}, alerts: [], setMachineLimit: () => { }, removeMachineLimit: () => { }, getMachineLimit: () => null, getMachineLimits: () => ({}), clearAlert: () => { }, clearAllAlerts: () => { }, markAllRead: () => { }, unreadCount: 0, checkLimits: () => { } };


const API_BASE = "http://localhost:5000";

// How long (ms) before the same machine+sensor can fire another alert/email
const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000; // 5 min for in-app bubble
const SENSOR_UNITS = {
    temperature: "°C", humidity: "%", power: "kW", pressure: "bar",
    gas: "ppm", vibration: "mm/s", current: "A", voltage: "V",
    fuel: "%", rpm: " RPM", cpuTemp: "°C", load: "%",
};

function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
    catch { return fallback; }
}

export function AlertsProvider({ children }) {
    // machineLimits: { [machineId]: { [sensorKey]: number } }
    const [machineLimits, setMachineLimits] = useState(() => load("iot_limits", {}));
    // alerts: array of alert event objects
    const [alerts, setAlerts] = useState(() => load("iot_alerts", []));
    // Track last notification timestamp per machine+sensor to debounce
    const cooldownRef = useRef({});

    // Persist to localStorage
    useEffect(() => { localStorage.setItem("iot_limits", JSON.stringify(machineLimits)); }, [machineLimits]);
    useEffect(() => { localStorage.setItem("iot_alerts", JSON.stringify(alerts)); }, [alerts]);

    // ── Limit helpers ───────────────────────────────────────────
    function setMachineLimit(machineId, sensor, value) {
        setMachineLimits(prev => ({
            ...prev,
            [machineId]: { ...(prev[machineId] || {}), [sensor]: value },
        }));
    }

    function removeMachineLimit(machineId, sensor) {
        setMachineLimits(prev => {
            const copy = { ...prev, [machineId]: { ...(prev[machineId] || {}) } };
            delete copy[machineId][sensor];
            if (Object.keys(copy[machineId]).length === 0) delete copy[machineId];
            return copy;
        });
    }

    function getMachineLimit(machineId, sensor) {
        return machineLimits[machineId]?.[sensor] ?? null;
    }

    function getMachineLimits(machineId) {
        return machineLimits[machineId] || {};
    }

    // ── Alert helpers ───────────────────────────────────────────
    function clearAlert(alertId) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }

    function clearAllAlerts() {
        setAlerts([]);
    }

    function markAllRead() {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    }

    const unreadCount = alerts.filter(a => !a.read).length;

    // ── Alert checking ──────────────────────────────────────────
    // Called by Dashboard / MachineDetail with live machine array
    const checkLimits = useCallback((machines) => {
        if (!machines || machines.length === 0) return;

        const now = Date.now();
        const newAlerts = [];

        machines.forEach(machine => {
            const limits = machineLimits[String(machine.id)];
            if (!limits) return;

            const sensors = machine.sensors || {};
            const sensorStatus = machine.sensorStatus || {};

            Object.entries(limits).forEach(([sensor, limit]) => {
                const value = sensors[sensor];
                if (value === undefined || value === null) return;
                if (value <= limit) return; // within limit → no alert

                const cdKey = `${machine.id}:${sensor}`;
                const lastTime = cooldownRef.current[cdKey] || 0;
                if (now - lastTime < NOTIFY_COOLDOWN_MS) return; // still in cooldown

                // Determine severity
                const sv = sensorStatus[sensor];
                const condition = sv === "Critical" ? "Critical" : "Warning";

                // Record cooldown
                cooldownRef.current[cdKey] = now;

                const alertObj = {
                    id: `${cdKey}-${now}`,
                    machineId: String(machine.id),
                    machineName: machine.name || String(machine.id),
                    sensor,
                    value,
                    limit,
                    condition,
                    unit: SENSOR_UNITS[sensor] || "",
                    timestamp: now,
                    read: false,
                };

                newAlerts.push(alertObj);

                // ── Browser notification ────────────────────────────────
                if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                    const sLabel = sensor === "cpuTemp" ? "CPU Temp" : sensor;
                    new Notification(`🚨 ${condition}: ${sLabel} on ${machine.name}`, {
                        body: `${sLabel} is ${value.toFixed(1)}${SENSOR_UNITS[sensor] || ""} — limit is ${limit}${SENSOR_UNITS[sensor] || ""}`,
                        icon: "/logo.png",
                        tag: cdKey,
                    });
                }

                // ── Email notification ──────────────────────────────────
                const alertEmail = localStorage.getItem("iot_alert_email")?.trim() ||
                    (() => { try { return JSON.parse(localStorage.getItem("iot_session") ?? "null")?.email; } catch { return null; } })();

                const emailEnabled = localStorage.getItem("iot_email_alerts") !== "false";

                if (alertEmail && emailEnabled) {
                    fetch(`${API_BASE}/api/send-alert`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            toEmail: alertEmail,
                            machineName: machine.name || String(machine.id),
                            machineId: String(machine.id),
                            sensor,
                            value,
                            limit,
                            condition,
                            unit: SENSOR_UNITS[sensor] || "",
                        }),
                    }).catch(err => console.warn("[AlertsCtx] Email call failed:", err.message));
                }
            });
        });

        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev].slice(0, 200)); // cap at 200
        }
    }, [machineLimits]);

    return (
        <AlertsCtx.Provider value={{
            machineLimits, alerts,
            setMachineLimit, removeMachineLimit, getMachineLimit, getMachineLimits,
            clearAlert, clearAllAlerts, markAllRead,
            unreadCount, checkLimits,
        }}>
            {children}
        </AlertsCtx.Provider>
    );
}

export function useAlerts() {
    const ctx = useContext(AlertsCtx);
    return ctx ?? SAFE_DEFAULT;
}

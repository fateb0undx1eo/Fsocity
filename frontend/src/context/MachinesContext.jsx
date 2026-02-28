import { createContext, useContext, useState, useEffect, useRef } from "react";

const Ctx = createContext(null);

export const ALL_SENSORS = [
    "temperature", "humidity", "power", "pressure", "gas",
    "vibration", "current", "voltage", "fuel", "rpm", "cpuTemp", "load",
];

const DEFAULTS = {
    temperature: 25, humidity: 50, power: 3, pressure: 50, gas: 2,
    vibration: 10, current: 15, voltage: 220, fuel: 60, rpm: 1200,
    cpuTemp: 45, load: 30,
};

const CLAMPS = {
    temperature: [-10, 200], humidity: [0, 100], power: [0, 10],
    pressure: [0, 150], gas: [0, 10], vibration: [0, 50],
    current: [0, 50], voltage: [180, 260], fuel: [0, 100],
    rpm: [0, 3000], cpuTemp: [20, 120], load: [0, 100],
};

const WARN_CRIT = {
    temperature: [80, 95], pressure: [80, 110], gas: [5, 8],
    vibration: [20, 35], current: [30, 40], cpuTemp: [75, 95], load: [80, 95],
};

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function rand(a, b) { return Math.random() * (b - a) + a; }

function computeStatus(sensors) {
    const sensorStatus = {};
    for (const [key, val] of Object.entries(sensors)) {
        if (WARN_CRIT[key]) {
            const [warn, crit] = WARN_CRIT[key];
            sensorStatus[key] = val >= crit ? "Critical" : val >= warn ? "Warning" : "Normal";
        }
    }
    const status = Object.values(sensorStatus).includes("Critical") ? "Critical"
        : Object.values(sensorStatus).includes("Warning") ? "Warning" : "Normal";
    return { sensorStatus, status };
}

function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
    catch { return fallback; }
}

export function MachinesProvider({ children }) {
    const [userMachines, setUserMachines] = useState(() => load("um_machines", []));
    const [overrides, setOverrides] = useState(() => load("um_overrides", {}));
    const [hiddenIds, setHiddenIds] = useState(() => new Set(load("um_hidden", [])));
    const [userSensors, setUserSensors] = useState(() => {
        const saved = load("um_sensors", {});
        const init = {};
        load("um_machines", []).forEach(m => {
            const s = {};
            (m.sensorKeys || []).forEach(k => { s[k] = saved[m.id]?.[k] ?? DEFAULTS[k] ?? 0; });
            init[m.id] = s;
        });
        return init;
    });

    // Persist to localStorage
    useEffect(() => { localStorage.setItem("um_machines", JSON.stringify(userMachines)); }, [userMachines]);
    useEffect(() => { localStorage.setItem("um_overrides", JSON.stringify(overrides)); }, [overrides]);
    useEffect(() => { localStorage.setItem("um_hidden", JSON.stringify([...hiddenIds])); }, [hiddenIds]);
    useEffect(() => { localStorage.setItem("um_sensors", JSON.stringify(userSensors)); }, [userSensors]);

    // Keep a ref to latest overrides to avoid stale closures in the interval
    const overridesRef = useRef(overrides);
    useEffect(() => { overridesRef.current = overrides; }, [overrides]);

    // Simulate sensor data — variance depends on operational status
    useEffect(() => {
        if (userMachines.length === 0) return;
        const id = setInterval(() => {
            setUserSensors(prev => {
                const next = { ...prev };
                userMachines.forEach(m => {
                    const opStatus = overridesRef.current[m.id]?.operationalStatus ?? "Active";
                    if (opStatus === "Off") return;           // frozen when off
                    const v = opStatus === "Idle" ? 0.3 : 2;  // minimal drift when idle
                    const s = { ...(next[m.id] || {}) };
                    (m.sensorKeys || []).forEach(k => {
                        const val = (s[k] ?? DEFAULTS[k] ?? 0) + rand(-v, v);
                        const [mn, mx] = CLAMPS[k] || [0, 9999];
                        s[k] = clamp(val, mn, mx);
                    });
                    next[m.id] = s;
                });
                return next;
            });
        }, 2000);
        return () => clearInterval(id);
    }, [userMachines]);

    // ── Helpers ────────────────────────────────────────────
    function ov(id) { return overrides[id] || {}; }
    function patchOv(id, patch) { setOverrides(p => ({ ...p, [id]: { ...(p[id] || {}), ...patch } })); }

    function getRuntimeHours(id) {
        const o = ov(id);
        let ms = o.accumulatedMs || 0;
        if (o.operationalStatus === "Active" && o.startedAt) ms += Date.now() - o.startedAt;
        return ms / 3_600_000;
    }

    function getOperationalStatus(id) { return ov(id).operationalStatus ?? "Active"; }

    function setOperationalStatus(id, status) {
        setOverrides(prev => {
            const o = prev[id] || {};
            const wasActive = (o.operationalStatus ?? "Active") === "Active";
            const isActive = status === "Active";
            let acc = o.accumulatedMs || 0;
            if (wasActive && !isActive && o.startedAt) acc += Date.now() - o.startedAt;
            return {
                ...prev,
                [id]: { ...o, operationalStatus: status, startedAt: isActive ? Date.now() : null, accumulatedMs: acc },
            };
        });
    }

    function getMachineName(id, fallback = "") { return ov(id).name ?? fallback; }

    function setMachineName(id, name) {
        patchOv(id, { name });
        setUserMachines(p => p.map(m => m.id === id ? { ...m, name } : m));
    }

    function addMachine(name, sensorKeys) {
        const id = `user_${Date.now()}`;
        setUserMachines(p => [...p, { id, name, sensorKeys, isUserDefined: true }]);
        setOverrides(p => ({ ...p, [id]: { operationalStatus: "Active", startedAt: Date.now(), accumulatedMs: 0 } }));
        const s = {};
        sensorKeys.forEach(k => { s[k] = DEFAULTS[k] ?? 0; });
        setUserSensors(p => ({ ...p, [id]: s }));
    }

    function deleteMachine(id) {
        if (String(id).startsWith("user_")) {
            setUserMachines(p => p.filter(m => m.id !== id));
            setUserSensors(p => { const n = { ...p }; delete n[id]; return n; });
            setOverrides(p => { const n = { ...p }; delete n[id]; return n; });
        } else {
            setHiddenIds(p => new Set([...p, String(id)]));
        }
    }

    function isHidden(id) { return hiddenIds.has(String(id)); }

    function getEnrichedUserMachines() {
        return userMachines.map(m => {
            const sensors = userSensors[m.id] || {};
            const { sensorStatus, status } = computeStatus(sensors);
            return { ...m, name: ov(m.id).name ?? m.name, sensors, sensorStatus, status };
        });
    }

    return (
        <Ctx.Provider value={{
            userMachines: getEnrichedUserMachines(),
            isHidden,
            addMachine, deleteMachine, setMachineName,
            setOperationalStatus, getOperationalStatus,
            getRuntimeHours, getMachineName,
            ALL_SENSORS,
        }}>
            {children}
        </Ctx.Provider>
    );
}

export function useMachines() { return useContext(Ctx); }

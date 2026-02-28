import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);
const API_BASE = "https://fsocity.onrender.com/";

function loadSession() {
    try {
        const u = JSON.parse(localStorage.getItem("iot_session") ?? "null");
        if (!u) return null;
        const avatar = localStorage.getItem("iot_avatar") ?? null;
        return avatar ? { ...u, avatar } : u;
    } catch { return null; }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadSession);

    async function login(email, password) {
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) return { error: data.error ?? "Login failed." };
            const avatar = localStorage.getItem("iot_avatar") ?? null;
            const userWithAvatar = avatar ? { ...data.user, avatar } : data.user;
            localStorage.setItem("iot_session", JSON.stringify(data.user));
            setUser(userWithAvatar);
            return { ok: true };
        } catch {
            return { error: "Cannot reach server. Is the backend running?" };
        }
    }

    async function signup(name, email, password) {
        if (!name.trim() || !email.trim() || !password.trim())
            return { error: "All fields required." };
        try {
            const res = await fetch(`${API_BASE}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) return { error: data.error ?? "Signup failed." };
            localStorage.setItem("iot_session", JSON.stringify(data.user));
            setUser(data.user);
            return { ok: true };
        } catch {
            return { error: "Cannot reach server. Is the backend running?" };
        }
    }

    function logout() {
        localStorage.removeItem("iot_session");
        setUser(null);
    }

    /** Persist a base64 data URL as the user's profile picture. */
    function updateAvatar(dataUrl) {
        if (dataUrl) {
            localStorage.setItem("iot_avatar", dataUrl);
        } else {
            localStorage.removeItem("iot_avatar");
        }
        setUser(prev => prev ? { ...prev, avatar: dataUrl ?? undefined } : prev);
    }

    return (
        <AuthCtx.Provider value={{ user, login, signup, logout, updateAvatar }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() { return useContext(AuthCtx); }

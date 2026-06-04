export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token"); // Using "token" as defined in auth.constants.js

    if (!token) {
        // If we're on the login page, we might not have a token yet
        if (!window.location.pathname.includes('/login')) {
            console.warn("No auth token found in localStorage");
        }
    }

    const API_BASE = import.meta.env.VITE_API_BASE || "";
    const fullUrl = url.startsWith('http') ? url : (API_BASE + url);

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(fullUrl, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        console.warn("Session expired (401). Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("auth_user");
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
    }

    if (res.status === 403) {
        throw new Error("Access Denied: You do not have permission to perform this action.");
    }

    if (!res.ok) {
        const text = await res.text();
        let errorMsg = text;
        try {
            const parsed = JSON.parse(text);
            errorMsg = parsed.message || parsed.error || text;
        } catch (e) { }
        throw new Error(errorMsg || "API error");
    }

    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    return res.text();
}

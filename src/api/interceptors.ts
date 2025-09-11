import axios from "axios";
import { useNetworkStore } from "@/stores/useNetworkStore";

// Путь на сервер
export const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getContentType = () => ({
    'Content-Type': 'application/json'
});

// --- Запрос без авторизации ---
export const axiosClassic = axios.create({
    baseURL: API_URL,
    headers: getContentType()
})


// --- Запросы, при который нужна авторизация ---
export const axiosAuth = axios.create({
    baseURL: API_URL,
    headers: getContentType()
})

axiosAuth.interceptors.request.use(
    async (config) => {
        // Mark request start for VPN/latency watchdog
        try {
            // Guard against SSR
            if (typeof window !== 'undefined') {
                useNetworkStore.getState().markRequestStart();
                // Attach start time for duration measurement
                (config as any).metadata = { startTime: Date.now() };
            }
        } catch {}
        // Получаем токен из localStorage
        const localStorageToken = localStorage.getItem('accessToken');
        const sessionStorageToken = sessionStorage.getItem('accessToken');
        const storedToken = localStorageToken || sessionStorageToken;

        if (storedToken) {
            config.headers.Authorization = `Bearer ${storedToken}`;
        }

        // Если отправляем FormData, не устанавливаем Content-Type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        // Ensure pending count decremented on request error before sending
        try {
            if (typeof window !== 'undefined') {
                useNetworkStore.getState().markRequestEnd(0);
            }
        } catch {}
        return Promise.reject(error);
    }
);

// Response interceptor to compute duration and update network store
axiosAuth.interceptors.response.use(
    (response) => {
        try {
            if (typeof window !== 'undefined') {
                const start = (response.config as any)?.metadata?.startTime;
                const duration = start ? Date.now() - start : 0;
                useNetworkStore.getState().markRequestEnd(duration);
            }
        } catch {}
        return response;
    },
    (error) => {
        try {
            if (typeof window !== 'undefined') {
                const start = (error.config as any)?.metadata?.startTime;
                const duration = start ? Date.now() - start : 0;
                useNetworkStore.getState().markRequestEnd(duration);
            }
        } catch {}
        return Promise.reject(error);
    }
);

// Optional: watchdog timer to detect long-pending without responses
if (typeof window !== 'undefined') {
    const tick = () => {
        try {
            useNetworkStore.getState().tickPendingWatchdog();
        } catch {}
        window.setTimeout(tick, 2000);
    };
    // start lazily after first tick
    window.setTimeout(tick, 2000);
}


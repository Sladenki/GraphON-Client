import axios from "axios";

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
        // Получаем токен из localStorage
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);





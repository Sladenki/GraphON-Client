import axios from "axios";
import { notifyError } from "@/lib/notifications";

// Путь на сервер
export const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getContentType = () => ({
    'Content-Type': 'application/json'
});

// Флаг для предотвращения множественных редиректов
let isRedirecting = false;

// --- Запрос без авторизации ---
export const axiosClassic = axios.create({
    baseURL: API_URL,
    headers: getContentType(),
    withCredentials: true
})


// --- Запросы, при который нужна авторизация ---
export const axiosAuth = axios.create({
    baseURL: API_URL,
    headers: getContentType(),
    withCredentials: true
})

axiosAuth.interceptors.request.use(
    async (config) => {
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
        return Promise.reject(error);
    }
);

// Функция для обработки 401 ошибки
const handle401Error = () => {
    // Предотвращаем множественные редиректы
    if (isRedirecting) {
        return;
    }
    
    isRedirecting = true;
    
    // Очищаем токены из обоих хранилищ
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    
    // Показываем уведомление пользователю
    notifyError('Вы не авторизованы или токен истёк', 'Пожалуйста, войдите снова');
    
    // Перенаправляем на страницу входа
    setTimeout(() => {
        window.location.href = '/signIn';
    }, 100); // Небольшая задержка для отображения уведомления
};

// Response interceptor для обработки 401 ошибок
axiosAuth.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Проверяем, если статус ответа 401
        if (error.response && error.response.status === 401) {
            handle401Error();
        }
        
        return Promise.reject(error);
    }
);

// Response interceptor для axiosClassic (на случай 401 на публичных эндпоинтах)
axiosClassic.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Проверяем, если статус ответа 401
        if (error.response && error.response.status === 401) {
            handle401Error();
        }
        
        return Promise.reject(error);
    }
);




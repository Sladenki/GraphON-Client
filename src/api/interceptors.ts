'use client';

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
        // Токен автоматически отправляется в cookie (withCredentials: true)
        // Не нужно добавлять Authorization заголовок

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
    // Работаем только на клиенте
    if (typeof window === 'undefined') {
        return;
    }
    
    // Предотвращаем множественные редиректы
    if (isRedirecting) {
        return;
    }
    
    isRedirecting = true;
    
    // Токен хранится в HTTP-only cookie, сервер сам его очистит при logout
    // Не нужно очищать localStorage/sessionStorage
    
    // Показываем уведомление пользователю (только на клиенте)
    try {
        notifyError('Вы не авторизованы или токен истёк', 'Пожалуйста, войдите снова');
    } catch (e) {
        // Игнорируем ошибки уведомлений
    }
    
    // Перенаправляем на страницу входа
    setTimeout(() => {
        if (typeof window !== 'undefined') {
            window.location.href = '/signIn';
        }
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




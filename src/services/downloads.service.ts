import { axiosAuth } from "@/api/interceptors";

export const DownloadsService = {

    // Создание записи о скачивании
    createRecord(userId?: string | null) {
        const payload = userId ? { user_id: userId } : {};
        return axiosAuth.post("/downloads", payload);
    },

    // Получение общего количества скачиваний
    getTotalDownloads() {
        return axiosAuth.get<{ count: number }>("/downloads");
    },
};


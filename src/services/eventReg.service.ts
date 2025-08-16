import { axiosAuth, axiosClassic } from "@/api/interceptors";

export const EventRegService = {

    // --- Регистрация на мероприятие ---
    async toggleEvent(eventId: string) {
        return axiosAuth.patch(`/eventRegs/${eventId}`);
    },

    // --- Получение всех мероприятий пользователя ---
    async getEventsByUserId() {
        return axiosAuth.get(`/eventRegs/getEventsByUserId`);
    },

    // --- Получение пользователей на мероприятии ---
    async getUsersByEventId(eventId: string) {
        return axiosAuth.get(`/eventRegs/getUsersByEventId/${eventId}`);
    },

}
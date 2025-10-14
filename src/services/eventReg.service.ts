import { axiosAuth, axiosClassic } from "@/api/interceptors";

export const EventRegService = {

    // --- Регистрация на мероприятие ---
    async toggleEvent(eventId: string) {
        return axiosAuth.patch(`/eventRegs/${eventId}`);
    },

    

    // --- Получение пользователей на мероприятии ---
    async getUsersByEventId(eventId: string) {
        return axiosAuth.get(`/eventRegs/getUsersByEventId/${eventId}`);
    },

    // --- Получение всех мероприятий пользователя ---
    async getAllUserEvents() {
        return axiosAuth.get(`/eventRegs/getAllUserEvents`);
    },

}
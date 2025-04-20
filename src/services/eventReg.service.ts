import { axiosAuth, axiosClassic } from "@/api/interceptors";

export const EventRegService = {

    // --- Регистрация на мероприятие ---
    async toggleEvent(eventId: string) {
        console.log('eventId', eventId)
        return axiosAuth.patch(`/eventRegs/${eventId}`);
    },

    // --- Получение всех мероприятий пользователя ---
    async getEventsByUserId() {
        return axiosAuth.get(`/eventRegs/getEventsByUserId`);
    },

}
import { axiosAuth, axiosClassic } from "@/api/interceptors";

export const EventService = {

    // --- Создание мероприятия ---
    async createEvent(eventData: {
        graphId: string;
        name: string;
        description: string;
        eventDate: string;
        timeFrom: string;
        timeTo: string;
    }) {
        return axiosAuth.post("/event/create", eventData);
    },

    // --- Получение всех мероприятий ---
    async getUpcomingEvents() {
        return axiosAuth.get("/event/upcoming");
    },

    // --- Удаление мероприятия ---
    async deleteEvent(eventId: string) {
        return axiosAuth.delete(`/event/${eventId}`);
    },

    // --- Редактирование мероприятия ---
    async updateEvent(eventId: string, eventData: {
        graphId: string;
        name: string;
        description: string;
        eventDate: string;
        timeFrom: string;
        timeTo: string;
    }) {
        return axiosAuth.put(`/event/${eventId}`, eventData);
    },

}
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
        globalGraphId: string;
    }) {
        return axiosAuth.post("/event/create", eventData);
    },

    // --- Получение всех мероприятий ---
    async getUpcomingEvents(selectedGraphId: string, skip?: number, limit?: number) {
        const params = new URLSearchParams();
        if (skip !== undefined) params.append('skip', skip.toString());
        if (limit !== undefined) params.append('limit', limit.toString());
        const queryString = params.toString();
        return axiosAuth.get(`/event/upcoming/${selectedGraphId}${queryString ? `?${queryString}` : ''}`);
    },

    // --- Получение мероприятия по ID ---
    async getEventById(eventId: string) {
        return axiosAuth.get(`/event/${eventId}`);
    },

    // --- Получение недельного расписания по globalGraphId ---
    async getWeeklyScheduleByGlobalGraphId(globalGraphId: string) {
        return axiosAuth.get(`/event/weekly/${globalGraphId}`);
    },

    // --- Получение мероприятий по ID графа ---
    async getEventsByGraphId(graphId: string) {
        return axiosAuth.get(`/event/by-graph/${graphId}`);
    },

    // --- Получение прошедших мероприятий по ID графа ---
    async getPastEventsByGraphId(graphId: string) {
        return axiosAuth.get(`/event/past/by-graph/${graphId}`);
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
        place: string;
        eventDate?: string;
        timeFrom?: string;
        timeTo?: string;
        isDateTbd?: boolean;
    }) {
        return axiosAuth.put(`/event/${eventId}`, eventData);
    },

}
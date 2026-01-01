import { axiosAuth, axiosClassic } from "@/api/interceptors";

export const EventService = {

    // --- Создание мероприятия ---
    async createEvent(eventData: {
        graphId?: string; // Для владельцев групп
        parentGraphId?: string; // Для студентов (тематика)
        name: string;
        description?: string;
        place?: string;
        eventDate?: string;
        timeFrom?: string;
        timeTo?: string;
        globalGraphId: string;
        isDateTbd?: boolean;
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

    // --- Получение мероприятий, созданных студентами ---
    async getStudentCreatedEvents(globalGraphId?: string, parentGraphId?: string, skip?: number, limit?: number) {
        const params = new URLSearchParams();
        if (globalGraphId) params.append('globalGraphId', globalGraphId);
        if (parentGraphId) params.append('parentGraphId', parentGraphId);
        if (skip !== undefined) params.append('skip', skip.toString());
        if (limit !== undefined) params.append('limit', limit.toString());
        const queryString = params.toString();
        return axiosAuth.get(`/event/student-created${queryString ? `?${queryString}` : ''}`);
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

    // --- Приглашение друга на мероприятие ---
    async inviteFriend(eventId: string, targetUserId: string) {
        const { data } = await axiosAuth.post(`/event/invite/${eventId}/${targetUserId}`, {
            eventId: eventId,
            targetUserId: targetUserId
        });
        return data;
    },

}
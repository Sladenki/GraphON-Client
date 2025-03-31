import { axiosClassic } from "@/api/interceptors";

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
        return axiosClassic.post("/event/create", eventData);
    },

    async getUpcomingEvents() {
        return axiosClassic.get("/event/upcoming");
    },

}
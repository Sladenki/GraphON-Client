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

    // async getEventsByGraphId(graphId: string) {
    //     return axiosClassic.get(`/events/by-graph?graphId=${graphId}`);
    // },

    // async getUpcomingEvents() {
    //     return axiosClassic.get("/events/upcoming");
    // },

}
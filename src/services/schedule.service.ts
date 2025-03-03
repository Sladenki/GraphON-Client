import { axiosClassic } from "@/api/interceptors"

export const ScheduleService = {

    // ---  Получает расписание для одного графа + мероприятия ---
    async getFullScheduleByGraphId(graphId: string) {
        return axiosClassic.post(`/schedule/full-by-graph`, { graphId });
    },


}
import { axiosClassic } from "@/api/interceptors"

export const ScheduleService = {

    // Получает расписание для одного графа с понедельника по пятницу
    async getWeeklyScheduleByGraphId(graphId: string ) {
        return axiosClassic.post(`/schedule/weekday-by-graph`, { graphId });
    },


}
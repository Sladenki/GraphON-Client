import { axiosClassic } from "@/api/interceptors"

export const ScheduleService = {

    // Получает расписание для одного графа с понедельника по пятницу
    async getWeeklyScheduleByGraphId(graphId: string ) {
        console.log('getWeeklyScheduleByGraphId - graphId', graphId)
        return axiosClassic.post(`/schedule/weekday-by-graph`, { graphId });
    },


}
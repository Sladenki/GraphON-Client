import { axiosAuth } from "@/api/interceptors"

export const GraphSubsService = {

    // Подписываемся на граф
    async toggleGraphSub(graphId: string) {
        return axiosAuth.post(`/graphSubs`, { graphId })
    },

    // Получение расписания из подписанных графов
    async getSubsSchedule() {
        return axiosAuth.get(`/graphSubs/getSubsSchedule`)
    },

    // Для подписок
    // Получение событий из подписанных графов
    async getSubsEvents() {
        return axiosAuth.get(`/graphSubs/getSubsEvents`)
    }

}
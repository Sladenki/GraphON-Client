import { axiosAuth, axiosClassic } from "@/api/interceptors"

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
    },

    // Получение всех групп, на которые подписан пользователь
    async getUserSubscribedGraphs() {
        return axiosAuth.get(`/graphSubs/getUserSubscribedGraphs`)
    },

    // --- Получение подписчиков графа ---
    async getGraphSubscribers(graphId: string) {
        return axiosAuth.get(`/graphSubs/getGraphSubscribers/${graphId}`)
    }

}
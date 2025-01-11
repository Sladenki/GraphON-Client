import { axiosAuth } from "@/api/interceptors"

export const GraphSubsService = {

    // Подписываемся на граф
    async toggleGraphSub(graphId: string) {
        return axiosAuth.post(`/graphSubs`, { graphId })
    }

}
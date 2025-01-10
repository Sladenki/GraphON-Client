import { axiosAuth } from "@/api/interceptors"

export const GraphSubsService = {

    // Подписываемся на граф
    async toggleGraphSub(graphId: string) {
        console.log('graphId', graphId.toString())
        return axiosAuth.post(`/graphSubs`, { graphId })
    }

}
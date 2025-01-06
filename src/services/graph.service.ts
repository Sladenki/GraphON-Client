import { axiosClassic } from "@/api/interceptors"

export const GraphService = {

    // --- Получение графа по id ---
    async getGraphById(graphId: any) {
        return axiosClassic.get(`/graph/getById/${graphId}`)
    },

    // --- Получение главных родительских графов ---
    async getParentGraphs() {
        return axiosClassic.get(`/graph/getParentGraphs`)
    },

    async getAllChildrenGraphs(parentGraphId: string) {
        return axiosClassic.get(`/graph/getAllChildrenGraphs/${parentGraphId}`)
    }
}
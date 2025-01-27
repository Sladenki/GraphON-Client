import { axiosClassic } from "@/api/interceptors"

export const GraphService = {

    // --- Получение графа по id ---
    async getGraphById(graphId: any) {
        return axiosClassic.get(`/graph/getById/${graphId}`)
    },

    // --- Получение главных графов ---
    async getParentGraphs() {
        return axiosClassic.get(`/graph/getParentGraphs`)
    },

    // --- Получение дочерних графов по ID родительского ---
    async getAllChildrenGraphs(parentGraphId: string) {
        return axiosClassic.get(`/graph/getAllChildrenGraphs/${parentGraphId}`)
    }
}
import { axiosAuth, axiosClassic } from "@/api/interceptors"

interface IGraphData {
    _id: string;
    name: string;
    ownerUserId: string;
    subsNum: number;
    childGraphNum: number;
    imgPath: string;
}

export const GraphService = {

    // --- Создание графа ---
    // async createGraph(name: string) {
    //     return axiosAuth.post(`/graph`, { name })
    // },

    // --- Получение графа по id ---
    async getGraphById(graphId: string): Promise<IGraphData> {
        const response = await axiosClassic.get<IGraphData>(`/graph/getById/${graphId}`);
        return response.data;
    },

    // --- Получение главных графов ---
    async getParentGraphs() {
        return axiosClassic.get(`/graph/getParentGraphs`)
    },

    // --- Получение дочерних графов по ID родительского ---
    async getAllChildrenGraphs(parentGraphId: string) {
        return axiosClassic.get(`/graph/getAllChildrenGraphs/${parentGraphId}`)
    },


    // --- Получение всех дочерних графов по Id родительского графа-тематики - Для системы графов --- 
    async getAllChildrenByTopic(parentGraphId: string) {
        return axiosClassic.get(`/graph/getAllChildrenByTopic/${parentGraphId}`)
    },

    // --- Получение графов тем ---
    async getGraphsByTopic(globalGraphId: string) {
        return axiosClassic.get(`/graph/getTopicGraphs/${globalGraphId}`)
    },  

    // --- Получение глобального графа с его графами-тематиками ---
    async getTopicGraphsWithGlobal(globalGraphId: string) {
        return axiosClassic.get(`/graph/getTopicGraphsWithGlobal/${globalGraphId}`)
    }
}
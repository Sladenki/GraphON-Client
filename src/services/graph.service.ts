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

    // --- Получение графов тем ---
    async getGraphsByTopic(globalGraphId: string) {
        return axiosClassic.get(`/graph/getTopicGraphs/${globalGraphId}`)
    },  

}
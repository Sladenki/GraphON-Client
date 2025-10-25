import { axiosAuth, axiosClassic } from "@/api/interceptors"
import { GraphInfo } from "@/types/graph.interface";

export const GraphService = {

    // --- Получение графа по id ---
    async getGraphById(graphId: string): Promise<GraphInfo> {
        // Если пользователь авторизован (есть токен), запрашиваем через axiosAuth,
        // чтобы сервер вернул поле isSubscribed; иначе используем публичный клиент
        const hasWindow = typeof window !== 'undefined';
        const token = hasWindow ? (localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')) : null;
        const client = token ? axiosAuth : axiosClassic;
        const response = await client.get<GraphInfo>(`/graph/getById/${graphId}`);
        return response.data;
    },

    // --- Получение главных графов ---
    async getParentGraphs() {
        return axiosClassic.get(`/graph/getParentGraphs`)
    },

    // --- Получение глобальных графов ---
    async getGlobalGraphs() {
        return axiosClassic.get(`/graph/getGlobalGraphs`)
    },

    // --- Получение дочерних графов по ID родительского ---
    async getAllChildrenGraphs(parentGraphId: string) {
        return axiosClassic.get(`/graph/getAllChildrenGraphs/${parentGraphId}`)
    },

    // --- Получение дочерних графов по ID глобального графа ---
    async getAllChildrenByGlobal(globalGraphId: string) {
        return axiosClassic.get(`/graph/getAllChildrenByGlobal/${globalGraphId}`)
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
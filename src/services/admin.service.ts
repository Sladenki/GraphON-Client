import { axiosAuth } from "@/api/interceptors"
import { UserRole } from "@/types/user.interface"

export const AdminService = {

    // Присваивание роли пользователю
    async assignRole(userId: string, role: UserRole) {
        const { data } = await axiosAuth.patch(`/admin/assignRole/${userId}`, { role });
        return data;
    },

    // --- Создание глобального графа ---
    async createGlobalGraph(data: { name: string; city: string; image: File }) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('city', data.city);
        formData.append('image', data.image);

        const { data: response } = await axiosAuth.post('/graph/createGlobalGraph', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    // --- Создание графа-тематики ---
    async createTopicGraph(data: { name: string; parentGraphId: string; image: File }) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('parentGraphId', data.parentGraphId);
        formData.append('image', data.image);

        const { data: response } = await axiosAuth.post('/graph/createTopicGraph', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    // --- Создание графа --- 
    async createGraph(data: { name: string; parentGraphId: string; image: File }) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('parentGraphId', data.parentGraphId);
        formData.append('image', data.image);

        const { data: response } = await axiosAuth.post('/admin/createGraph', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    // --- Передача прав на граф ---
    async transferGraphOwnership(graphId: string, newOwnerId: string) {
        const { data } = await axiosAuth.patch(`/admin/transferGraphOwnership/${graphId}`, { newOwnerId });
        return data;
    },

    // --- Получение статистики приложения ---
    async getApplicationStats() {
        const { data } = await axiosAuth.get('/admin/user-stats');
        return data;
    },

    // --- Получение статистики использования ресурсов сервера ---
    async getServerResourceStats() {
        const { data } = await axiosAuth.get('/admin/server-stats');
        return data;
    },


};
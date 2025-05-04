import { axiosAuth } from "@/api/interceptors"
import { UserRole } from "@/types/user.interface"
import { CreateGraphDto } from "@/types/graph.interface"

export const AdminService = {

    // Присваивание роли пользователю
    async assignRole(userId: string, role: UserRole) {
        const { data } = await axiosAuth.patch(`/admin/assignRole/${userId}`, { role });
        return data;
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
    }
};
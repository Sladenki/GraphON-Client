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
    async createGraph(dto: CreateGraphDto) {
        const { data } = await axiosAuth.post('/admin/createGraph', dto);
        return data;
    }
};
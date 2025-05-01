import { axiosAuth, axiosClassic } from "@/api/interceptors"
import { UserRole } from "@/types/user.interface"

export const AdminService = {

    // Присваивание роли пользователю
    async assignRole(userId: string, role: UserRole) {
        const { data } = await axiosAuth.patch(`/admin/assignRole/${userId}`, { role });
        return data;
    }
};
import { axiosClassic } from "@/api/interceptors"
import { IGoogleAuthUser } from "@/types/user.interface"
import { IUser } from '@/types/user.interface';

export const UserService = {
    // Google Авторизация
    async auth(dto: IGoogleAuthUser) {
        return axiosClassic.post(`/user/auth`, dto)
    },

    async getAllUsers(lastId?: string, limit: number = 2): Promise<{ users: IUser[], hasMore: boolean }> {
        const params = new URLSearchParams();
        if (lastId) params.append('lastId', lastId);
        params.append('limit', limit.toString());
        
        const { data } = await axiosClassic.get<{ users: IUser[], hasMore: boolean }>(`/user/allUsers?${params.toString()}`);
        return data;
    },

    async getUserById(id: string): Promise<IUser> {
        const { data } = await axiosClassic.get<IUser>(`/users/${id}`);
        return data;
    }
}
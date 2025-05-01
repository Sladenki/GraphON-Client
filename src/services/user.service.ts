import { axiosClassic } from "@/api/interceptors"
import { IGoogleAuthUser } from "@/types/user.interface"
import { IUser } from '@/types/user.interface';

export const UserService = {
    // Google Авторизация
    async auth(dto: IGoogleAuthUser) {
        return axiosClassic.post(`/user/auth`, dto)
    },

    async getAllUsers(): Promise<IUser[]> {
        const { data } = await axiosClassic.get<IUser[]>('/user/allUsers');
        return data;
    },

    async getUserById(id: string): Promise<IUser> {
        const { data } = await axiosClassic.get<IUser>(`/users/${id}`);
        return data;
    }
}
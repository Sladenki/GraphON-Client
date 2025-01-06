import { axiosClassic } from "@/api/interceptors"
import { IGoogleAuthUser } from "@/types/user.interface"

export const UserService = {
    // Google Авторизация
    async auth(dto: IGoogleAuthUser) {
        return axiosClassic.post(`/user/auth`, dto)
    },

    async getAuthUrl() {
        return axiosClassic.get('/auth/google');
    },

}
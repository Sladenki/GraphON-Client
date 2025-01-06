import { axiosAuth, axiosClassic } from "@/api/interceptors"
import { IGoogleAuthUser } from "@/types/user.interface"

export const UserPostReactionService = {
    // Связываем пользователя и реакцию
    async createUserAndReactionConnection(reactionId: string, postId: string, isReacted: boolean) {
        return axiosAuth.post(`/userPostReactionPost`, { reactionId, postId, isReacted })
    }

}
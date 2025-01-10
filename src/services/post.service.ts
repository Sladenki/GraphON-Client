import { axiosAuth, axiosClassic } from "@/api/interceptors"

export const PostService = {

    // Создание поста
    async createPost(formData: FormData) {
 
        return axiosAuth.post('/post/create', formData, {
            headers: {
                // Удаляем Content-Type, чтобы axios установил multipart автоматически
                'Content-Type': undefined, 
            },
        });
    },

}
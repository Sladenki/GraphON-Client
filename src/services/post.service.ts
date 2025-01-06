import { axiosAuth, axiosClassic } from "@/api/interceptors"

export const PostService = {

    // Получение всех постов 
    async getPosts(skip: any) {
        return axiosClassic.get(`/post/getPosts?skip=${skip}`)
    },

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
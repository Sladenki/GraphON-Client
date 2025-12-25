import { axiosAuth, axiosClassic } from "@/api/interceptors"
import { IGoogleAuthUser } from "@/types/user.interface"
import { IUser, IUpdateUserDto } from '@/types/user.interface';
import { CursorPage, SocialUserListItem } from "@/types/social.interface";

export const UserService = {
    // Google Авторизация
    async auth(dto: IGoogleAuthUser) {
        return axiosClassic.post(`/user/auth`, dto)
    },

    // async getAllUsers(lastId?: string, limit: number = 2): Promise<{ users: IUser[], hasMore: boolean }> {
    //     const params = new URLSearchParams();
    //     if (lastId) params.append('lastId', lastId);
    //     params.append('limit', limit.toString());
        
    //     const { data } = await axiosClassic.get<{ users: IUser[], hasMore: boolean }>(`/user/allUsers?${params.toString()}`);
    //     return data;
    // },

    // Получение всех пользователей
    async getAllUsers() {        
        const { data } = await axiosClassic.get(`/user/allUsers`);
        return data;
    },

    // Получение всех пользователей по графу
    async getAllUsersByGraph(graphId: string): Promise<IUser[]> {
        const { data } = await axiosAuth.get<IUser[]>(`/user/allUsersByGraph/${graphId}`);
        return data;
    },

    // Смена выбора графа пользователя 
    async updateSelectedGraph(selectedGraphId: string) {
        const { data } = await axiosAuth.patch(`/user/selected-graph`, { selectedGraphId });
        return data;
    },

    // Обновление статуса студента
    async updateIsStudent(isStudent: boolean) {
        const { data } = await axiosAuth.patch(`/user/is-student`, { isStudent });
        return data;
    },

    // Обновление университетского графа
    async updateUniversityGraph(universityGraphId: string) {
        const { data } = await axiosAuth.patch(`/user/university-graph`, { universityGraphId });
        return data;
    },

    // Обновление профиля
    async updateProfile(dto: IUpdateUserDto) {
        const { data } = await axiosAuth.patch(`/user/profile`, dto);
        return data;
    },

    // Получение пользователя по ID
    async getById(id: string) {
        const { data } = await axiosAuth.get(`/user/getById/${id}`);
        return data;
    },

    // Social API: получить список пользователей порционно (cursor pagination)
    async getUserList(params?: { limit?: number; cursor?: string }): Promise<CursorPage<SocialUserListItem>> {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.cursor) searchParams.set('cursor', params.cursor);
        const qs = searchParams.toString();

        const { data } = await axiosAuth.get<CursorPage<SocialUserListItem>>(`/user/list${qs ? `?${qs}` : ''}`);
        return data;
    },

    // Social API: поиск пользователей порционно (cursor pagination)
    // Endpoint публичный (без @Auth) — используем axiosClassic, чтобы работало и без токена.
    async searchUsers(params: { q: string; limit?: number; cursor?: string }): Promise<CursorPage<SocialUserListItem>> {
        const q = (params?.q ?? '').trim();
        const searchParams = new URLSearchParams();
        searchParams.set('q', q);
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.cursor) searchParams.set('cursor', params.cursor);
        const qs = searchParams.toString();

        const { data } = await axiosClassic.get<CursorPage<SocialUserListItem>>(`/user/search?${qs}`);
        return data;
    }
}
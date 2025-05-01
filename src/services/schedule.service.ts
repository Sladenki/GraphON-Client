import { axiosClassic } from "@/api/interceptors"
import { ISchedule } from '@/types/schedule.interface';

export interface ICreateScheduleDto {
    graphId: string;
    name: string;
    type: string;
    roomNumber: number;
    dayOfWeek: number;
    timeFrom: string;
    timeTo: string;
}

export const ScheduleService = {

    // ---  Получает расписание для одного графа + мероприятия ---
    async getFullScheduleByGraphId(graphId: string) {
        return axiosClassic.post(`/schedule/full-by-graph`, { graphId });
    },

    async createSchedule(data: ICreateScheduleDto) {
        return axiosClassic.post<ISchedule>('/schedule/create', data);
    },

}
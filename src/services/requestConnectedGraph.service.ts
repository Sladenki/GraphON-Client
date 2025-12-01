import { axiosClassic } from '@/api/interceptors';

export const RequestConnectedGraphService = {
  async createRequest(userId: string | null, university: string) {
    return axiosClassic.post('/requests-connected-graph/create', {
      userId,
      university,
    });
  },
};



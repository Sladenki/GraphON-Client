import { axiosAuth } from "@/api/interceptors";

export const DownloadsService = {
  createRecord(userId?: string | null) {
    const payload = userId ? { user_id: userId } : {};
    return axiosAuth.post("/downloads", payload);
  },
};


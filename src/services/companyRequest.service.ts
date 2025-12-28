import { axiosAuth } from "@/api/interceptors";

export interface CompanyRequestUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avaPath: string;
  topInterests?: Array<{
    _id: string;
    name: string;
    displayName: string;
  }>;
}

export interface CommonInterest {
  interestId: string;
  interestName: string;
  userWeight: number;
  otherWeight: number;
}

export interface CompanyRequest {
  requestId: string;
  initiator: CompanyRequestUser;
  matchScore: number;
  commonInterests: CommonInterest[];
  createdAt: string;
  expiresAt: string;
}

export interface CreateCompanyRequestDto {
  eventId: string;
}

export interface CreateCompanyRequestResponse {
  requestId: string;
  message: string;
}

export interface CancelCompanyRequestResponse {
  success: boolean;
  message: string;
}

export const CompanyRequestService = {
  // Создать запрос на поиск компании
  async createRequest(eventId: string): Promise<CreateCompanyRequestResponse> {
    const { data } = await axiosAuth.post<CreateCompanyRequestResponse>('/interests/company-request', { eventId });
    return data;
  },

  // Получить все активные запросы
  async getActiveRequests(): Promise<CompanyRequest[]> {
    const { data } = await axiosAuth.get<CompanyRequest[]>('/interests/company-requests/active');
    return data;
  },

  // Получить запросы для конкретного мероприятия
  async getRequestsByEvent(eventId: string): Promise<CompanyRequest[]> {
    const { data } = await axiosAuth.get<CompanyRequest[]>(`/interests/company-requests/event/${eventId}`);
    return data;
  },

  // Отменить запрос
  async cancelRequest(requestId?: string): Promise<CancelCompanyRequestResponse> {
    const body = requestId ? { requestId } : {};
    const { data } = await axiosAuth.post<CancelCompanyRequestResponse>('/interests/company-request/cancel', body);
    return data;
  },
};


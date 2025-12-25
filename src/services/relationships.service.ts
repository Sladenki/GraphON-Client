import { axiosAuth } from "@/api/interceptors";
import {
  CursorPage,
  FriendAcceptResponse,
  FriendDeclineResponse,
  FriendRemoveResponse,
  FriendRequestResponse,
} from "@/types/social.interface";

export const RelationshipsService = {
  async request(targetUserId: string): Promise<FriendRequestResponse> {
    const { data } = await axiosAuth.post<FriendRequestResponse>(`/relationships/request/${targetUserId}`);
    return data;
  },

  async accept(requesterUserId: string): Promise<FriendAcceptResponse> {
    const { data } = await axiosAuth.post<FriendAcceptResponse>(`/relationships/accept/${requesterUserId}`);
    return data;
  },

  async decline(requesterUserId: string): Promise<FriendDeclineResponse> {
    const { data } = await axiosAuth.post<FriendDeclineResponse>(`/relationships/decline/${requesterUserId}`);
    return data;
  },

  async removeFriend(friendUserId: string): Promise<FriendRemoveResponse> {
    const { data } = await axiosAuth.delete<FriendRemoveResponse>(`/relationships/friends/${friendUserId}`);
    return data;
  },

  async getFriends(params?: { limit?: number; cursor?: string }): Promise<CursorPage<string>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    const qs = searchParams.toString();
    const { data } = await axiosAuth.get<CursorPage<string>>(`/relationships/friends${qs ? `?${qs}` : ""}`);
    return data;
  },

  // followers = входящие PENDING-заявки
  async getFollowers(params?: { limit?: number; cursor?: string }): Promise<CursorPage<string>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    const qs = searchParams.toString();
    const { data } = await axiosAuth.get<CursorPage<string>>(`/relationships/followers${qs ? `?${qs}` : ""}`);
    return data;
  },

  // following = исходящие PENDING-заявки
  async getFollowing(params?: { limit?: number; cursor?: string }): Promise<CursorPage<string>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    const qs = searchParams.toString();
    const { data } = await axiosAuth.get<CursorPage<string>>(`/relationships/following${qs ? `?${qs}` : ""}`);
    return data;
  },
};



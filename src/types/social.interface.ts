export interface CursorPage<TItem> {
  items: TItem[];
  nextCursor?: string;
}

export interface SocialUserListItem {
  _id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  username: string;
  avaPath: string;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
}

export type RelationshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface FriendRequestResponse {
  status: RelationshipStatus;
  created?: boolean;
  revived?: boolean;
}

export interface FriendAcceptResponse {
  status: 'ACCEPTED';
}

export interface FriendDeclineResponse {
  status: 'DECLINED';
}

export interface FriendRemoveResponse {
  removed: boolean;
}



import { IUser } from "./user.interface";


export interface graphId {
    _id: string,
    name: string
}

// Из чего состоит публикация 
export interface IPost {
    // id: string,
    content: string,
    imgPath?: string,
    keywords: string[],
    user: IUser;
    createdAt: string;
    reactions: any[],
    isReacted: boolean
    graph: graphId
}

export interface IPostClient extends IPost {
    id: string,
}

export interface IPostServer extends IPost {
    _id: string,
}

// Что нужно для создания поста
export interface ICreatePost {
    content: string,
    imgPath?: string
}
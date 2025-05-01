export interface IGraphList {
    _id: string,
    name: string,
    isSubscribed: boolean
    imgPath: string
}

export interface CreateGraphDto {
    name: string;
    parentGraphId: string;
}
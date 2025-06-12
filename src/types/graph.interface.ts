export interface IGraphList {
    _id: string,
    name: string,
    isSubscribed: boolean
    imgPath: string
    about?: string
}

export interface CreateGraphDto {
    name: string;
    parentGraphId: string;
}

export interface ParentGraph {
  _id: string;
  name: string;
}

export interface GraphInfo {
  _id: string;
  name: string;
  directorName: string;
  directorVkLink?: string;
  vkLink: string;
  ownerUserId: string;
  subsNum: number;
  childGraphNum: number;
  imgPath: string;
  parentGraphId: ParentGraph;
  graphType: string;
  globalGraphId: string;
  about: string;
}
export interface GraphNode {
  _id: string;
  name: string;
  imgPath?: string;
  parentGraphId?: string;
  childGraphNum: number;
  ownerUserId: string;
  subsNum: number;
  directorName?: string;
  directorVkLink?: string;
  vkLink?: string;
  graphType: 'global' | 'topic';
  city?: string;
}

export interface HexagonalGraph3DProps {
  data: GraphNode[];
  searchQuery: string;
}


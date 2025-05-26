import { Object3D } from 'three';

export interface GraphNode {
  _id: { $oid: string };
  name: string;
  imgPath?: string;
  parentGraphId?: { $oid: string };
  childGraphNum: number;
  ownerUserId: { $oid: string };
  subsNum: number;
  directorName?: string;
  directorVkLink?: string;
  vkLink?: string;
  emoji?: string;
}

export interface WaterGraph3DProps {
  data: GraphNode[];
  searchQuery?: string;
}

export interface ThemeNodeProps {
  theme: GraphNode;
  index: number;
  total: number;
  active: boolean;
  hovered: boolean;
  setActive: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  onThemeSelect: (theme: GraphNode) => void;
  data: GraphNode[];
  isMobile: boolean;
  anyActive: boolean;
}

export interface LeftPanelProps {
  data: GraphNode[];
  onThemeSelect: (theme: GraphNode | null) => void;
  selectedTheme: GraphNode | null;
}

// Add type for R3F canvas
declare global {
  interface HTMLCanvasElement {
    __r3f?: {
      scene: THREE.Scene;
    };
  }
} 
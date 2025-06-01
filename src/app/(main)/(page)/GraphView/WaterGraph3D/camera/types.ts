import { Object3D } from 'three';

export interface CameraControllerProps {
  activeNodeRef: React.RefObject<Object3D | null>;
  isMobile: boolean;
}

export interface OptimalCameraPosition {
  cameraPosition: THREE.Vector3;
  lookAt: THREE.Vector3;
} 
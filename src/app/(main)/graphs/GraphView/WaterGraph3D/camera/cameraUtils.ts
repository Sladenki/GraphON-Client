import * as THREE from 'three';
import { Object3D } from 'three';
import { OptimalCameraPosition } from './types';

export const calculateOptimalCameraPosition = (
  node: Object3D,
  isMobile: boolean
): OptimalCameraPosition => {
  // Получаем все дочерние элементы
  const children: THREE.Object3D[] = [];
  node.traverse((child) => {
    if (child !== node) {
      children.push(child);
    }
  });

  // Создаем ограничивающий бокс, включающий основной узел и все дочерние элементы
  const boundingBox = new THREE.Box3().setFromObject(node);
  children.forEach(child => {
    const childBox = new THREE.Box3().setFromObject(child);
    boundingBox.union(childBox);
  });

  // Получаем центр ограничивающего бокса
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  // Рассчитываем размер ограничивающего бокса
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const maxDimension = Math.max(size.x, size.y, size.z);

  // Рассчитываем оптимальное расстояние до камеры с учетом количества дочерних элементов
  const childCount = children.length;
  const distanceMultiplier = isMobile
    ? Math.max(2.5, 2 + childCount * 0.2)
    : Math.max(3, 2.5 + childCount * 0.15);

  const optimalDistance = Math.max(
    isMobile ? 6 : 8,
    maxDimension * distanceMultiplier
  );

  // Определяем позицию узла относительно центра сцены
  const nodePosition = node.position.clone();
  const angle = Math.atan2(nodePosition.y, nodePosition.x);
  
  // Рассчитываем смещение камеры в зависимости от позиции узла
  const offsetX = Math.cos(angle) * optimalDistance * 0.8;
  const offsetY = Math.sin(angle) * optimalDistance * 0.8;
  
  // Рассчитываем высоту камеры для лучшего обзора
  const heightOffset = optimalDistance * 0.5;

  // Рассчитываем финальную позицию камеры
  const cameraPosition = new THREE.Vector3(
    center.x + offsetX,
    center.y + offsetY + heightOffset,
    center.z + optimalDistance
  );

  // Немного смещаем точку фокуса вверх для лучшего обзора
  const lookAt = new THREE.Vector3(
    center.x,
    center.y + heightOffset * 0.5,
    center.z
  );

  return {
    cameraPosition,
    lookAt
  };
};

export const getDefaultCameraPosition = (isMobile: boolean): OptimalCameraPosition => {
  // Проверяем, является ли устройство iPhone для более точных настроек
  const isIPhone = typeof window !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const isSmallIPhone = isIPhone && screenWidth <= 375;
  
  let cameraDistance;
  if (isSmallIPhone) {
    cameraDistance = 9; // Увеличено для маленьких iPhone
  } else if (isIPhone) {
    cameraDistance = 10; // Увеличено для обычных iPhone
  } else if (isMobile) {
    cameraDistance = 8;
  } else {
    cameraDistance = 12;
  }
  
  return {
    cameraPosition: new THREE.Vector3(0, 0, cameraDistance),
    lookAt: new THREE.Vector3(0, 0, 0)
  };
}; 
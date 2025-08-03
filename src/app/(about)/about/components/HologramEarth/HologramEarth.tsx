'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import styles from './HologramEarth.module.scss';

export const HologramEarth = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Group | null>(null);


  useEffect(() => {
    if (!containerRef.current) return;

    // Создаем сцену
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      75,
      300 / 300,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Создаем рендерер с высоким качеством
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Добавляем рендерер в контейнер
    containerRef.current.appendChild(renderer.domElement);

    // Создаем группу для Земли
    const earthGroup = new THREE.Group();
    earthRef.current = earthGroup;

    // Создаем геометрию Земли с высоким разрешением (увеличиваем размер)
    const earthGeometry = new THREE.SphereGeometry(1.5, 128, 128);
    
    // Создаем материал с голографическим эффектом и текстурой Земли
    const earthMaterial = new THREE.ShaderMaterial({
             uniforms: {
         time: { value: 0 },
         hologramColor: { value: new THREE.Color(0x8a2be2) }, // Фиолетовый оттенок
         secondaryColor: { value: new THREE.Color(0x9370db) }, // Светло-фиолетовый
         earthTexture: { value: null }
       },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
             fragmentShader: `
         uniform float time;
         uniform vec3 hologramColor;
         uniform vec3 secondaryColor;
         uniform sampler2D earthTexture;
         varying vec3 vNormal;
         varying vec3 vPosition;
         varying vec2 vUv;
         
         void main() {
           vec3 normal = normalize(vNormal);
           vec3 viewDir = normalize(cameraPosition - vPosition);
           
           // Получаем цвет текстуры Земли с улучшенным качеством
           vec4 earthColor = texture2D(earthTexture, vUv);
           
           // Создаем голографический эффект
           float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
           float scanLine = sin(vPosition.y * 10.0 + time * 2.0) * 0.5 + 0.5;
           float grid = sin(vPosition.x * 20.0 + time) * sin(vPosition.z * 20.0 + time) * 0.3;
           
           // Комбинируем эффекты
           float hologram = fresnel * scanLine * (0.8 + grid);
           
           // Добавляем пульсацию
           float pulse = sin(time * 3.0) * 0.3 + 0.7;
           
           // Улучшенное смешивание цветов
           vec3 earthHologram = mix(earthColor.rgb, hologramColor, hologram * 0.4);
           vec3 finalColor = mix(earthHologram, secondaryColor, hologram * pulse * 0.15);
           
           // Улучшаем контрастность и яркость
           finalColor = pow(finalColor, vec3(0.85));
           finalColor = finalColor * 1.1; // Увеличиваем яркость
           
           float alpha = hologram * 0.4 + 0.6;
           
           gl_FragColor = vec4(finalColor, alpha);
         }
       `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Загружаем текстуру Земли с несколькими вариантами
    const textureLoader = new THREE.TextureLoader();
    
    const loadTexture = (url: string, fallback: boolean = false) => {
      textureLoader.load(
        url, 
        (texture) => {
          // Улучшаем качество текстуры
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          earthMaterial.uniforms.earthTexture.value = texture;
          console.log('Текстура Земли загружена успешно:', url);
        },
        (progress) => {
          if (progress.total > 0) {
            console.log('Загрузка текстуры:', (progress.loaded / progress.total * 100) + '%');
          }
        },
        (error) => {
          console.warn('Не удалось загрузить текстуру Земли:', url, error);
          if (!fallback) {
            // Пробуем fallback текстуру
            loadTexture('/earth-texture.jpg', true);
          } else {
            // Создаем более качественную текстуру как последний fallback
            createFallbackTexture();
          }
        }
      );
    };

    const createFallbackTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Создаем более детальную текстуру с континентами
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#1a4a8a');
        gradient.addColorStop(0.5, '#2a5a9a');
        gradient.addColorStop(1, '#1a4a8a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Добавляем более детальные "континенты"
        ctx.fillStyle = '#4a8a1a';
        
        // Северная Америка
        ctx.fillRect(200, 100, 240, 160);
        ctx.fillRect(160, 260, 200, 120);
        
        // Южная Америка
        ctx.fillRect(300, 400, 160, 240);
        
        // Европа и Азия
        ctx.fillRect(800, 160, 400, 200);
        ctx.fillRect(700, 360, 500, 160);
        
        // Африка
        ctx.fillRect(700, 400, 240, 300);
        
        // Австралия
        ctx.fillRect(1200, 500, 160, 120);
        
        // Добавляем детали
        ctx.fillStyle = '#3a7a0a';
        ctx.fillRect(220, 120, 200, 120);
        ctx.fillRect(820, 180, 360, 160);
        ctx.fillRect(720, 420, 200, 260);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        earthMaterial.uniforms.earthTexture.value = texture;
        console.log('Создана fallback текстура Земли');
      }
    };

    // Пробуем загрузить текстуру
    loadTexture('/earth-texture.jpg');

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Создаем внешнюю голографическую оболочку (уменьшаем размер)
    const shellGeometry = new THREE.SphereGeometry(1.7, 64, 64);
    const shellMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
             fragmentShader: `
         uniform float time;
         varying vec3 vNormal;
         varying vec3 vPosition;
         
         void main() {
           vec3 normal = normalize(vNormal);
           vec3 viewDir = normalize(cameraPosition - vPosition);
           
           float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
           float scanLine = sin(vPosition.y * 15.0 + time * 1.5) * 0.5 + 0.5;
           float pulse = sin(time * 2.0) * 0.3 + 0.7;
           
           float alpha = fresnel * scanLine * pulse * 0.3;
           vec3 color = vec3(0.5, 0.0, 1.0); // Фиолетовый цвет
           
           gl_FragColor = vec4(color, alpha);
         }
       `,
      transparent: true,
      side: THREE.BackSide
    });

    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    earthGroup.add(shell);

    // Добавляем линии сетки (уменьшаем размер)
    const gridGeometry = new THREE.SphereGeometry(1.6, 32, 32);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x8a2be2, // Фиолетовый цвет
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    earthGroup.add(grid);

    // Добавляем атмосферу (уменьшаем размер)
    const atmosphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vPosition);
          
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
          float pulse = sin(time * 1.5) * 0.2 + 0.8;
          
                     float alpha = fresnel * pulse * 0.15;
           vec3 color = vec3(0.5, 0.2, 0.8); // Фиолетовый оттенок
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);

    scene.add(earthGroup);

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0x606060, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x8a2be2, 1.2); // Фиолетовый свет
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Добавляем точечный свет для голографического эффекта
    const pointLight = new THREE.PointLight(0x9370db, 2.5, 10); // Светло-фиолетовый свет
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Добавляем дополнительный белый свет для лучшей видимости
    const whiteLight = new THREE.PointLight(0xffffff, 1, 8);
    whiteLight.position.set(-2, 1, 3);
    scene.add(whiteLight);

    // Анимация
    let time = 0;
    const animate = () => {
      time += 0.016;

      if (earthGroup) {
        // Автоматическое вращение
        earthGroup.rotation.y += 0.005;
        earthGroup.rotation.x = Math.sin(time * 0.5) * 0.1;
      }

      if (earthMaterial.uniforms) {
        earthMaterial.uniforms.time.value = time;
      }
      if (shellMaterial.uniforms) {
        shellMaterial.uniforms.time.value = time;
      }
      if (atmosphereMaterial.uniforms) {
        atmosphereMaterial.uniforms.time.value = time;
      }

      // Анимация света
      pointLight.position.x = Math.sin(time) * 3;
      pointLight.position.z = Math.cos(time) * 3;
      whiteLight.position.x = Math.cos(time * 0.7) * 2;
      whiteLight.position.z = Math.sin(time * 0.7) * 2;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Обработка изменения размера
    const handleResize = () => {
      if (containerRef.current && renderer) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        
        camera.aspect = size / size;
        camera.updateProjectionMatrix();
        
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      className={styles.hologramContainer}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <div ref={containerRef} className={styles.threeContainer} />
      <div className={styles.hologramOverlay}>
        <div className={styles.scanLine} />
        <div className={styles.scanLine} style={{ animationDelay: '0.5s' }} />
        <div className={styles.scanLine} style={{ animationDelay: '1s' }} />
      </div>
    </motion.div>
  );
}; 
import React, { FC, useEffect, useMemo, useCallback } from 'react'
import PopUpWrapper from '../../global/PopUpWrapper/PopUpWrapper';
import { useMutation } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import styles from './InfoGraphPopUp.module.scss'
import Image from "next/image";
import { GraphInfo } from '@/types/graph.interface';
import { useInfoGraphOptimization } from './useInfoGraphOptimization';

interface InfoGraphPopUpProps {
    graphId: any;
    isInfoGraphPopupOpen: boolean;
    closeInfoGraphPopup: () => void;
}

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

const InfoGraphPopUp: FC<InfoGraphPopUpProps> = React.memo(({ 
    graphId, 
    isInfoGraphPopupOpen, 
    closeInfoGraphPopup 
}) => {
    // Оптимизация для мобильных
    const { querySettings, imageSettings, createOptimizedHandler } = useInfoGraphOptimization();
    
    // --- Информация --- 
    const { mutate, data, isPending, isError } = useMutation<GraphInfo, unknown, string>({
        mutationFn: (graphId: string) => GraphService.getGraphById(graphId),
        ...querySettings,
    });

    // Мемоизированный обработчик загрузки данных
    const loadGraphData = useCallback(() => {
        if (graphId && isInfoGraphPopupOpen) {
            mutate(graphId);
        }
    }, [graphId, isInfoGraphPopupOpen, mutate]);

    useEffect(() => {
        loadGraphData();
    }, [loadGraphData]);

    // Мемоизированный URL изображения
    const fullImageUrl = useMemo(() => 
        data?.imgPath ? `${BASE_S3_URL}/${data.imgPath}` : "", 
    [data?.imgPath]
    );

    // Оптимизированные обработчики
    const handleVkClick = useCallback(createOptimizedHandler((e: React.MouseEvent) => {
        e.stopPropagation();
    }), [createOptimizedHandler]);

    const handleDirectorClick = useCallback(createOptimizedHandler((e: React.MouseEvent) => {
        e.stopPropagation();
    }), [createOptimizedHandler]);

    console.log('data', data)

    // Определяем размеры для разных устройств для предотвращения дергания
    const popupDimensions = useMemo(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        return {
            width: isMobile ? '95vw' : 900,
            height: isMobile ? '80vh' : 'auto' // Фиксированная высота на мобильных
        };
    }, []);

    return (
        <PopUpWrapper 
      isOpen={isInfoGraphPopupOpen} 
      onClose={closeInfoGraphPopup} 
      width={popupDimensions.width} 
      height={popupDimensions.height}
      modalId="info-graph-popup"
    >
            {isPending ? (
                <div className={styles.loaderContainer}>
                    <SpinnerLoader />
                </div>
            ) : isError ? (
                <div className={styles.errorContainer}>
                    <p>Ошибка загрузки данных</p>
                    <button onClick={loadGraphData} className={styles.retryButton}>
                        Попробовать снова
                    </button>
                </div>
            ) : data ? (
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.imageWrapper}>
                            <Image
                                className={styles.image}
                                src={fullImageUrl || '/noImage.png'}
                                alt={data.name}
                                fill
                                {...imageSettings}
                            />
                            <div className={styles.imageOverlay}>
                                <div className={styles.badge}>
                                    <span className={styles.badgeIcon}>👥</span>
                                    <span className={styles.badgeText}>{data.subsNum}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.headerContent}>
                            <h2 className={styles.title}>{data.name}</h2>
                            {data.parentGraphId?.name && (
                                <div className={styles.category}>
                                    <span className={styles.categoryIcon}>📚</span>
                                    <span>{data.parentGraphId.name}</span>
                                </div>
                            )}
                            {data.directorName && (
                                <div className={styles.director}>
                                    <span className={styles.directorLabel}>Руководитель:</span>
                                    {data.directorVkLink ? (
                                        <a 
                                            href={data.directorVkLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={styles.directorLink}
                                            onClick={handleDirectorClick}
                                        >
                                            {data.directorName}
                                        </a>
                                    ) : (
                                        <span className={styles.directorName}>{data.directorName}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {data.about && (
                        <div className={styles.aboutSection}>
                            <h3 className={styles.aboutTitle}>О сообществе</h3>
                            <p className={styles.about}>{data.about}</p>
                        </div>
                    )}
                    
                    {data.vkLink && (
                        <div className={styles.actions}>
                            <a 
                                className={styles.vkButton} 
                                href={data.vkLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={handleVkClick}
                            >
                                <span>Перейти в VK</span>
                            </a>
                        </div>
                    )}
                </div>
            ) : null}
        </PopUpWrapper>
    )
});

InfoGraphPopUp.displayName = 'InfoGraphPopUp';

export default InfoGraphPopUp

import React, { FC, useEffect, useMemo } from 'react'
import PopUpWrapper from '../PopUpWrapper/PopUpWrapper';
import { useMutation } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import styles from './InfoGraphPopUp.module.scss'
import Image from "next/image";
import { GraphInfo } from '@/types/graph.interface';

interface InfoGraphPopUpProps {
    graphId: any;
    isInfoGraphPopupOpen: boolean;
    closeInfoGraphPopup: () => void;
}

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

const InfoGraphPopUp: FC<InfoGraphPopUpProps> = ({ 
    graphId, 
    isInfoGraphPopupOpen, 
    closeInfoGraphPopup 
}) => {

    // --- Информация --- 
    const { mutate, data, isPending } = useMutation<GraphInfo, unknown, string>({
        mutationFn: (graphId: string) => GraphService.getGraphById(graphId),
    });

    useEffect(() => {
        // Вызовите мутацию сразу при монтировании компонента
        if (graphId) {
            mutate(graphId); 
        }
    }, [graphId, mutate]); // зависимость от graph и mutate, чтобы вызвать мутацию каждый раз, когда graph изменится




    const fullImageUrl = useMemo(() => 
        data?.imgPath ? `${BASE_S3_URL}/${data.imgPath}` : "", 
    [data]
    );

    console.log('data', data)


  return (
    <PopUpWrapper isOpen={isInfoGraphPopupOpen} onClose={closeInfoGraphPopup} width={900} height="auto">
        {isPending ? (
            <div className={styles.loaderContainer}>
                <SpinnerLoader />
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
                            sizes="200px"
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
                        >
                            <span>Перейти в VK</span>
                        </a>
                    </div>
                )}
            </div>
        ) : null}
    </PopUpWrapper>
  )
}

export default InfoGraphPopUp

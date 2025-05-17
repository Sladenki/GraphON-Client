import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import SchedulePopUp from '@/components/ui/SchedulePopUp/SchedulePopUp';
import styles from './GraphInfo.module.scss';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

interface IGraphData {
    _id: string;
    name: string;
    ownerUserId: string;
    subsNum: number;
    childGraphNum: number;
    imgPath: string;
}

interface GraphInfoProps {
    graphId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const GraphInfo: React.FC<GraphInfoProps> = ({ graphId, isOpen, onClose }) => {
    const { data: graphInfo, isLoading, error } = useQuery<IGraphData>({
        queryKey: ['graph/getById', graphId],
        queryFn: () => GraphService.getGraphById(graphId),
        enabled: isOpen
    });

    if (!isOpen) return null;
    if (isLoading) return <SpinnerLoader />;
    if (error) return <div className={styles.error}>Ошибка при загрузке информации о графе</div>;
    if (!graphInfo) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{graphInfo.name}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.info}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>ID:</span>
                        <span className={styles.value}>{graphInfo._id}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Владелец:</span>
                        <span className={styles.value}>{graphInfo.ownerUserId}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Подписчики:</span>
                        <span className={styles.value}>{graphInfo.subsNum}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Дочерние графы:</span>
                        <span className={styles.value}>{graphInfo.childGraphNum}</span>
                    </div>
                    {graphInfo.imgPath && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Изображение:</span>
                            <span className={styles.value}>{graphInfo.imgPath}</span>
                        </div>
                    )}
                </div>

                
{/* 
                <SchedulePopUp
                    graphId={graphId}
                    isSchedulePopupOpen={true}
                    closeSchedulePopup={onClose}
                /> */}
            </div>
        </div>
    );
}; 
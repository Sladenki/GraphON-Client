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


    if(isPending) {
        <SpinnerLoader/>
    }

    const fullImageUrl = useMemo(() => 
        data?.imgPath ? `${BASE_S3_URL}/${data.imgPath}` : "", 
    [data]
    );

    console.log('data', data)


  return (
    <PopUpWrapper isOpen={isInfoGraphPopupOpen} onClose={closeInfoGraphPopup} width={900} height="auto">
        {data && (
            <div className={styles.card}>
                <Image
                    className={styles.image}
                    src={fullImageUrl}
                    alt={data.name}
                    width={300}                
                    height={300}
                />
                <div className={styles.content}>
                    <h2 className={styles.title}>{data.name}</h2>
                    <div className={styles.director}>
                        Руководитель:&nbsp;
                        {data?.directorVkLink ? (
                            <a href={data?.directorVkLink} target="_blank" rel="noopener noreferrer">
                                {data?.directorName}
                            </a>
                        ) : (
                            <span>{data?.directorName}</span>
                        )}
                    </div>
                    <p className={styles.about}>{data.about}</p>
                    <div className={styles.badges}>
                        <span className={styles.badge}>👥 {data.subsNum} подписчик(ов)</span>
                        <span className={styles.badge}>📚 {data.parentGraphId?.name}</span>
                    </div>
                    <a className={styles.vkLink} href={data.vkLink} target="_blank" rel="noopener noreferrer">
                        Перейти в VK сообщество →
                    </a>
                </div>
            </div>
        )}

    </PopUpWrapper>
  )
}

export default InfoGraphPopUp

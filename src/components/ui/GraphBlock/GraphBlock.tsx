import React, { memo, useMemo, useCallback } from "react";
import styles from "./GraphBlock.module.scss";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useAuth } from "@/providers/AuthProvider";
import { useSchedulePopup } from "./useSchedulePopUp";
import dynamic from "next/dynamic";
import Image from "next/image";
import { PlusSquare, MinusSquare } from "lucide-react";

const SchedulePopUp = dynamic(() => import("../SchedulePopUp/SchedulePopUp"), { ssr: false });

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface GraphBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
}

const GraphBlock: React.FC<GraphBlockProps> = ({ id, name, isSubToGraph, imgPath }) => {
  const fullImageUrl = useMemo(() => `${BASE_S3_URL}/${imgPath}`, [imgPath]);

  const { isLoggedIn } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);

  const { isSchedulePopupOpen, handleScheduleButtonClick, closeSchedulePopup } = useSchedulePopup();

  const handleSubscription = useCallback(() => toggleSubscription(), [toggleSubscription]);

  return (
    <div className={styles.graphBlock}>
      {/* Фото графа */}
      {imgPath && (
        <div className={styles.imageContainer}>
          <div className={styles.nameTag}>{name}</div>
          <Image
            src={fullImageUrl}
            alt="Graph Image"
            layout="responsive"
            width={400}
            height={250}
            className={styles.postImage}
          />

          {isLoggedIn && (
            <button
              onClick={handleSubscription}
              disabled={isLoading}
              className={`${styles.subscriptionButton} ${
                isSubscribed ? styles.subscribed : styles.unsubscribed
              }`}
            >
              {isLoading ? "..." : isSubscribed ? <MinusSquare size={20} /> : <PlusSquare size={20} />}
            </button>
          )}
        </div>
      )}

      {/* Кнопка расписания */}
      <button className={styles.scheduleButton} onClick={handleScheduleButtonClick}>
        📅 Расписание
      </button>


      {/* Модальное окно расписания */}
      {isSchedulePopupOpen && (
        <SchedulePopUp graphId={id} isSchedulePopupOpen={isSchedulePopupOpen} closeSchedulePopup={closeSchedulePopup} />
      )}
    </div>
  );
};

export default memo(GraphBlock);

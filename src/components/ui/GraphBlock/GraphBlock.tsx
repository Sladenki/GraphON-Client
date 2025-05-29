import React, { memo, useMemo, useCallback } from "react";
import styles from "./GraphBlock.module.scss";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { PlusSquare, MinusSquare } from "lucide-react";

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface GraphBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  handleScheduleButtonClick: any
  setSelectedGraphId: any
}

const GraphBlock: React.FC<GraphBlockProps> = ({ id, name, isSubToGraph, imgPath, handleScheduleButtonClick, setSelectedGraphId }) => {
  const fullImageUrl = useMemo(() => imgPath ? `${BASE_S3_URL}/${imgPath}` : "", [imgPath]);

  const { isLoggedIn } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);

  const handleSubscription = useCallback(() => toggleSubscription(), [toggleSubscription]);

  // Нажали на кнопку расписания графа
  const clickSchedule = (id: string) => {
    handleScheduleButtonClick()
    setSelectedGraphId(id)
  }

  return (
    <div className={styles.graphBlock}>
      <div className={styles.contentWrapper}>
        {/* Контейнер с изображением */}
        {imgPath ? (
          <div className={styles.imageContainer}>
            <Image
              src={fullImageUrl}
              alt="Graph Image"
              width={400}
              height={300}
              className={styles.postImage}
            />
          </div>
        ) : (
          <div className={styles.placeholderContainer} />
        )}

        {/* Название объединения (всегда видимое) */}
        <div className={styles.nameOverlay}>
          <span className={styles.nameText}>{name}</span>
        </div>

        {/* Кнопка подписки */}
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

      {/* Кнопка расписания */}
      <button className={styles.scheduleButton} onClick={() => clickSchedule(id)}>
        📅 Расписание
      </button>
    </div>
  );
};

export default memo(GraphBlock);

import React, { memo, useMemo, useCallback } from "react";
import styles from "./GraphBlock.module.scss";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { Calendar, Info } from "lucide-react";
import { notifyInfo, notifySuccess } from "@/lib/notifications";
import { Card, Button } from "@heroui/react";
import { useSetSelectedGraphId } from "@/stores/useUIStore";

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface GraphBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  about?: string;
  handleScheduleButtonClick: () => void;
  handleInfoGraphButtonClick: () => void;
}

const GraphBlock: React.FC<GraphBlockProps> = ({ 
  id, 
  name, 
  isSubToGraph, 
  imgPath, 
  about,
  handleScheduleButtonClick, 
  handleInfoGraphButtonClick,
}) => {
  const fullImageUrl = useMemo(() => 
    imgPath ? `${BASE_S3_URL}/${imgPath}` : "", 
    [imgPath]
  );

  const { isLoggedIn } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);
  const setSelectedGraphId = useSetSelectedGraphId(); // Используем Zustand store

  const handleSubscription = useCallback(() => {
    toggleSubscription();

    if (!isSubscribed) {
      notifySuccess(
        "Вы подписались на граф",
        "Расписание этого графа будет отображаться в вашем расписании"
      );
    } else {
      notifyInfo("Вы отписались от графа");
    }
  }, [toggleSubscription, isSubscribed]);

  const handleScheduleClick = useCallback(() => {
    handleScheduleButtonClick();
    setSelectedGraphId(id);
  }, [handleScheduleButtonClick, setSelectedGraphId, id]);

  const handleInfoClick = useCallback(() => {
    handleInfoGraphButtonClick();
    setSelectedGraphId(id);
  }, [handleInfoGraphButtonClick, setSelectedGraphId, id]);

  return (
    <Card className={styles.graphBlock}>
      <div className={styles.contentWrapper}>
        <div className={styles.imageContainer}>
          {imgPath ? (
            <Image
              src={fullImageUrl}
              alt={`Фотография ${name}`}
              width={400}
              height={300}
              className={styles.graphImage}
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+hxZLjN8pbGkT7z8D2ElwSjL1eX5/lLn8YQFaRGhTK0j6/u0Vj/9k="
            />
          ) : (
            <div className={styles.placeholderImage}>
              <div className={styles.placeholderIcon}>📷</div>
            </div>
          )}
          <div className={styles.overlay}>
            <h3 className={styles.title}>{name}</h3>
            {isLoggedIn && (
              <button
                onClick={handleSubscription}
                disabled={isLoading}
                className={`${styles.subscriptionButton} ${isSubscribed ? styles.unsubscribe : styles.subscribe}`}
                aria-label={isSubscribed ? "Отписаться" : "Подписаться"}
                title={isSubscribed ? "Отписаться" : "Подписаться"}
              >
                {isLoading ? (
                  <div className={styles.loader} />
                ) : isSubscribed ? (
                  "Отписаться"
                ) : (
                  "Подписаться"
                )}
              </button>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <p className={styles.about}>{about || "Описание отсутствует"}</p>
        </div>

        <footer className={styles.footer}>
          <button 
            onClick={handleScheduleClick}
            className={`${styles.actionButton} ${styles.scheduleButton}`}
            aria-label="Открыть расписание"
          >
            <Calendar size={16} />
            <span>Расписание</span>
          </button>
          
          <button 
            onClick={handleInfoClick}
            className={`${styles.actionButton} ${styles.infoButton}`}
            aria-label="Показать информацию"
          >
            <Info size={16} />
            <span>Инфо</span>
          </button>
        </footer>
      </div>
    </Card>
  );
};

export default memo(GraphBlock);
import React, { memo, useMemo, useCallback } from "react";
import styles from "./GraphBlock.module.scss";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { PlusSquare, MinusSquare, Calendar, Info } from "lucide-react";
import { notifyInfo, notifySuccess } from "@/lib/notifications";

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface GraphBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  handleScheduleButtonClick: () => void;
  handleInfoGraphButtonClick: () => void;
  setSelectedGraphId: (id: string) => void;
}

const GraphBlock: React.FC<GraphBlockProps> = ({ 
  id, 
  name, 
  isSubToGraph, 
  imgPath, 
  handleScheduleButtonClick, 
  handleInfoGraphButtonClick,
  setSelectedGraphId,
}) => {
  const fullImageUrl = useMemo(() => 
    imgPath ? `${BASE_S3_URL}/${imgPath}` : "", 
    [imgPath]
  );

  const { isLoggedIn } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);

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

  // Расписание
  const handleScheduleClick = useCallback(() => {
    handleScheduleButtonClick();
    setSelectedGraphId(id);
  }, [handleScheduleButtonClick, setSelectedGraphId, id]);

  // Информация
  const handleInfoClick = useCallback(() => {
    handleInfoGraphButtonClick();
    setSelectedGraphId(id);
  }, [handleInfoGraphButtonClick, setSelectedGraphId, id]);

  return (
    <article className={styles.graphBlock}>
      {/* Основной контент блока */}
      <div className={styles.contentWrapper}>
        {/* Заголовок и кнопка подписки */}
        <header className={styles.header}>
          <h3 className={styles.title}>{name}</h3>
          {isLoggedIn && (
            <button
              onClick={handleSubscription}
              disabled={isLoading}
              className={`${styles.subscriptionButton} ${
                isSubscribed ? styles.subscribed : styles.unsubscribed
              }`}
              aria-label={isSubscribed ? "Отписаться" : "Подписаться"}
              title={isSubscribed ? "Отписаться" : "Подписаться"}
            >
              {isLoading ? (
                <div className={styles.loader} />
              ) : isSubscribed ? (
                <MinusSquare size={18} />
              ) : (
                <PlusSquare size={18} />
              )}
            </button>
          )}
        </header>

        {/* Фотография графа */}
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
        </div>

        {/* Нижние кнопки */}
        <footer className={styles.footer}>
          <button 
            className={styles.actionButton}
            onClick={handleScheduleClick}
            aria-label="Открыть расписание"
          >
            <Calendar size={16} />
            <span>Расписание</span>
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={handleInfoClick}
            aria-label="Показать информацию"
          >
            <Info size={16} />
            <span>Инфо</span>
          </button>
        </footer>
      </div>
    </article>
  );
};

export default memo(GraphBlock);
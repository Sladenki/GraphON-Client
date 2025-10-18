import React, { memo } from "react";
import Image from "next/image";
import { Heart, HeartCrack, Calendar, Info } from "lucide-react";
import { notifySuccess, notifyInfo } from "@/lib/notifications";
import styles from './GroupBlock.module.scss';
import { useAuth } from "@/providers/AuthProvider";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useRouter } from "next/navigation";
import ActionButton from "@/components/ui/ActionButton/ActionButton";

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface GroupBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  about?: string;
  handleScheduleButtonClick: () => void;
}

const GroupBlock: React.FC<GroupBlockProps> = memo(({ 
  id, 
  name, 
  isSubToGraph, 
  imgPath, 
  about,
  handleScheduleButtonClick,
}) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);

  const fullImageUrl = imgPath ? `${BASE_S3_URL}/${imgPath}` : "";
  const displayName = name || "Без названия";

  const handleSubscription = () => {
    toggleSubscription();
    if (!isSubscribed) {
      notifySuccess("Вы подписались на граф");
    } else {
      notifyInfo("Вы отписались от графа");
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/groups/${id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.contentWrapper}>
        <div className={styles.imageContainer}>
          {fullImageUrl ? (
            <Image
              src={fullImageUrl}
              alt={displayName}
              width={400}
              height={240}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📷</span>
            </div>
          )}
          
          {/* Кнопка подписки */}
          {isLoggedIn && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSubscription(); }}
              disabled={isLoading}
              className={`${styles.subscribeBtn} ${isSubscribed ? styles.active : ''}`}
              title={isSubscribed ? "Отписаться" : "Подписаться"}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                isSubscribed ? <HeartCrack size={16} /> : <Heart size={16} />
              )}
            </button>
          )}
          
          {/* Оверлей с заголовком */}
          <div className={styles.overlay}>
            <h3 className={styles.title}>{displayName}</h3>
          </div>
        </div>

        {/* Описание */}
        <div className={styles.content}>
          <p className={styles.description}>
            {about || "Описание отсутствует"}
          </p>
        </div>

        {/* Кнопки */}
        <div className={styles.actions}>
          <ActionButton
            onClick={handleScheduleButtonClick}
            variant="primary"
            icon={<Calendar size={16} />}
            label="Расписание"
          />
          <ActionButton
            onClick={handleInfoClick}
            variant="info"
            icon={<Info size={16} />}
            label="Подробнее"
          />
        </div>
      </div>
    </div>
  );
});

GroupBlock.displayName = 'GroupBlock';

export default GroupBlock;

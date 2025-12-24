import React, { memo } from "react";
import Image from "next/image";
import { Heart, HeartCrack, Calendar } from "lucide-react";
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
  layout?: 'vertical' | 'horizontal';
}

const GroupBlock: React.FC<GroupBlockProps> = memo(({ 
  id, 
  name, 
  isSubToGraph, 
  imgPath, 
  about,
  handleScheduleButtonClick,
  layout = 'vertical',
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

  const handleCardClick = () => {
    router.push(`/groups/${id}`);
  };

  return (
    <div
      className={`${styles.card} ${layout === 'horizontal' ? styles.horizontal : styles.vertical}`}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
      aria-label={`Открыть группу: ${displayName}`}
    >
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
          {layout === 'vertical' && (
            <div className={styles.overlay}>
              <h3 className={styles.title}>{displayName}</h3>
            </div>
          )}
        </div>

        <div className={styles.body}>
          {layout === 'horizontal' && (
            <div className={styles.headerRow}>
              <h3 className={styles.titleInline}>{displayName}</h3>
            </div>
          )}

          {/* Описание */}
          <div className={styles.content}>
            <p className={styles.description}>
              {about || "Описание отсутствует"}
            </p>
          </div>

          {/* Кнопки */}
          <div className={styles.actions}>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                handleScheduleButtonClick();
              }}
              variant="primary"
              icon={<Calendar size={16} />}
              label="Расписание"
              className={styles.actionButtonCompact}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

GroupBlock.displayName = 'GroupBlock';

export default GroupBlock;

import React, { memo, useMemo, useCallback, useRef } from "react";
import styles from "./GraphBlock.module.scss";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { Calendar, Info, Heart, HeartCrack } from "lucide-react";
import { notifyInfo, notifySuccess } from "@/lib/notifications";
import { Card, Button } from "@heroui/react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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

  const handleScheduleClick = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleScheduleButtonClick();
  }, [handleScheduleButtonClick]);

  const handleInfoClick = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleInfoGraphButtonClick();
  }, [handleInfoGraphButtonClick]);

  const handleNavigate = useCallback(() => {
    router.push(`/graph/${id}`);
  }, [router, id]);

  const tiltRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width; // 0..1
    const py = y / rect.height; // 0..1
    const rotateY = (px - 0.5) * 12; // deg
    const rotateX = (0.5 - py) * 8; // deg
    el.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  }, []);

  return (
    <div className={styles.tiltWrap} ref={tiltRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
    <Card className={styles.graphBlock} isPressable onPress={handleNavigate}>
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
              sizes="(max-width: 480px) 100vw, 380px"
              loading="lazy"
              decoding="async"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+hxZLjN8pbGkT7z8D2ElwSjL1eX5/lLn8YQFaRGhTK0j6/u0Vj/9k="
            />
          ) : (
            <div className={styles.placeholderImage}>
              <div className={styles.placeholderIcon}>📷</div>
            </div>
          )}
          {isLoggedIn && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSubscription(); }}
              disabled={isLoading}
              className={`${styles.fabSubscribe} ${isSubscribed ? styles.fabActive : ''}`}
              aria-label={isSubscribed ? "Отписаться" : "Подписаться"}
              title={isSubscribed ? "Отписаться" : "Подписаться"}
            >
              {isLoading ? (
                <div className={styles.loader} />
              ) : (
                isSubscribed ? <HeartCrack size={16} /> : <Heart size={16} />
              )}
            </button>
          )}
          <div className={styles.overlay}>
            <h3 className={styles.title}>{name}</h3>
          </div>
        </div>

        <div className={styles.infoSection}>
          <p className={styles.about}>{about || "Описание отсутствует"}</p>
        </div>

        <footer className={styles.footer}>
          <button 
            onClick={(e) => handleScheduleClick(e)}
            className={`${styles.actionButton} ${styles.scheduleButton}`}
            aria-label="Открыть расписание"
          >
            <Calendar size={16} />
            <span>Расписание</span>
          </button>
          
          <button 
            onClick={(e) => handleInfoClick(e)}
            className={`${styles.actionButton} ${styles.infoButton}`}
            aria-label="Показать информацию"
          >
            <Info size={16} />
            <span>Инфо</span>
          </button>

        </footer>

      </div>
    </Card>
    </div>
  );
};

export default memo(GraphBlock);
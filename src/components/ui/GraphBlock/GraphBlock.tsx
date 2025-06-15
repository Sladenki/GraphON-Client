import React, { memo } from "react";
import styles from "./GraphBlock.module.scss";
import Image from "next/image";
import { Calendar, Info } from "lucide-react";
import { Card } from "@heroui/react";
import { useGraphBlockOptimization } from "./useGraphBlockOptimization";

interface GraphBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  about?: string;
  handleScheduleButtonClick: () => void;
  handleInfoGraphButtonClick: () => void;
  setSelectedGraphId: (id: string) => void;
}

// Мемоизированный компонент изображения
const GraphImage = memo<{
  hasImage: boolean;
  fullImageUrl: string;
  alt: string;
  name: string;
}>(({ hasImage, fullImageUrl, alt, name }) => {
  if (hasImage) {
    return (
      <Image
        src={fullImageUrl}
        alt={alt}
        width={400}
        height={300}
        className={styles.graphImage}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+hxZLjN8pbGkT7z8D2ElwSjL1eX5/lLn8YQFaRGhTK0j6/u0Vj/9k="
      />
    );
  }

  return (
    <div className={styles.placeholderImage}>
      <div className={styles.placeholderIcon}>📷</div>
    </div>
  );
});
GraphImage.displayName = 'GraphImage';

// Мемоизированный компонент кнопки подписки
const SubscriptionButton = memo<{
  isLoggedIn: boolean;
  subscriptionState: {
    isLoading: boolean;
    buttonText: string | null;
    buttonClass: string;
    ariaLabel: string;
  };
  onSubscription: () => void;
}>(({ isLoggedIn, subscriptionState, onSubscription }) => {
  if (!isLoggedIn) return null;

  return (
    <button
      onClick={onSubscription}
      disabled={subscriptionState.isLoading}
      className={`${styles.subscriptionButton} ${styles[subscriptionState.buttonClass]}`}
      aria-label={subscriptionState.ariaLabel}
      title={subscriptionState.ariaLabel}
    >
      {subscriptionState.isLoading ? (
        <div className={styles.loader} />
      ) : (
        subscriptionState.buttonText
      )}
    </button>
  );
});
SubscriptionButton.displayName = 'SubscriptionButton';

// Мемоизированный компонент overlay
const ImageOverlay = memo<{
  name: string;
  isLoggedIn: boolean;
  subscriptionState: any;
  onSubscription: () => void;
}>(({ name, isLoggedIn, subscriptionState, onSubscription }) => (
  <div className={styles.overlay}>
    <h3 className={styles.title}>{name}</h3>
    <SubscriptionButton
      isLoggedIn={isLoggedIn}
      subscriptionState={subscriptionState}
      onSubscription={onSubscription}
    />
  </div>
));
ImageOverlay.displayName = 'ImageOverlay';

// Мемоизированный компонент контейнера изображения
const ImageContainer = memo<{
  imageState: {
    hasImage: boolean;
    fullImageUrl: string;
    alt: string;
  };
  name: string;
  isLoggedIn: boolean;
  subscriptionState: any;
  onSubscription: () => void;
}>(({ imageState, name, isLoggedIn, subscriptionState, onSubscription }) => (
  <div className={styles.imageContainer}>
    <GraphImage
      hasImage={imageState.hasImage}
      fullImageUrl={imageState.fullImageUrl}
      alt={imageState.alt}
      name={name}
    />
    <ImageOverlay
      name={name}
      isLoggedIn={isLoggedIn}
      subscriptionState={subscriptionState}
      onSubscription={onSubscription}
    />
  </div>
));
ImageContainer.displayName = 'ImageContainer';

// Мемоизированный компонент секции информации
const InfoSection = memo<{ about: string }>(({ about }) => (
  <div className={styles.infoSection}>
    <p className={styles.about}>{about}</p>
  </div>
));
InfoSection.displayName = 'InfoSection';

// Мемоизированные кнопки действий
const ScheduleButton = memo<{ onClick: () => void }>(({ onClick }) => (
  <button 
    onClick={onClick}
    className={`${styles.actionButton} ${styles.scheduleButton}`}
    aria-label="Открыть расписание"
  >
    <Calendar size={16} />
    <span>Расписание</span>
  </button>
));
ScheduleButton.displayName = 'ScheduleButton';

const InfoButton = memo<{ onClick: () => void }>(({ onClick }) => (
  <button 
    onClick={onClick}
    className={`${styles.actionButton} ${styles.infoButton}`}
    aria-label="Показать информацию"
  >
    <Info size={16} />
    <span>Инфо</span>
  </button>
));
InfoButton.displayName = 'InfoButton';

// Мемоизированный компонент футера
const Footer = memo<{
  onScheduleClick: () => void;
  onInfoClick: () => void;
}>(({ onScheduleClick, onInfoClick }) => (
  <footer className={styles.footer}>
    <ScheduleButton onClick={onScheduleClick} />
    <InfoButton onClick={onInfoClick} />
  </footer>
));
Footer.displayName = 'Footer';

// Основной компонент GraphBlock
const GraphBlock: React.FC<GraphBlockProps> = memo(({ 
  id, 
  name, 
  isSubToGraph, 
  imgPath, 
  about,
  handleScheduleButtonClick, 
  handleInfoGraphButtonClick,
  setSelectedGraphId,
}) => {
  const {
    isLoggedIn,
    displayAbout,
    subscriptionState,
    imageState,
    handleSubscription,
    handleScheduleClick,
    handleInfoClick,
  } = useGraphBlockOptimization({
    id,
    name,
    isSubToGraph,
    imgPath,
    about,
    handleScheduleButtonClick,
    handleInfoGraphButtonClick,
    setSelectedGraphId,
  });

  return (
    <Card className={styles.graphBlock}>
      <div className={styles.contentWrapper}>
        <ImageContainer
          imageState={imageState}
          name={name}
          isLoggedIn={isLoggedIn}
          subscriptionState={subscriptionState}
          onSubscription={handleSubscription}
        />
        
        <InfoSection about={displayAbout} />
        
        <Footer
          onScheduleClick={handleScheduleClick}
          onInfoClick={handleInfoClick}
        />
      </div>
    </Card>
  );
});

GraphBlock.displayName = 'GraphBlock';

export default GraphBlock;
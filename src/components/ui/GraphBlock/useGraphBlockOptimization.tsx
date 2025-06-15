import { useMemo, useCallback } from 'react';
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useAuth } from "@/providers/AuthProvider";
import { notifyInfo, notifySuccess } from "@/lib/notifications";

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface UseGraphBlockOptimizationProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  about?: string;
  handleScheduleButtonClick: () => void;
  handleInfoGraphButtonClick: () => void;
  setSelectedGraphId: (id: string) => void;
}

export const useGraphBlockOptimization = ({
  id,
  name,
  isSubToGraph,
  imgPath,
  about,
  handleScheduleButtonClick,
  handleInfoGraphButtonClick,
  setSelectedGraphId,
}: UseGraphBlockOptimizationProps) => {
  const { isLoggedIn } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);

  // Мемоизированный URL изображения
  const fullImageUrl = useMemo(() => 
    imgPath ? `${BASE_S3_URL}/${imgPath}` : "", 
    [imgPath]
  );

  // Мемоизированный текст описания
  const displayAbout = useMemo(() => 
    about || "Описание отсутствует", 
    [about]
  );

  // Мемоизированные обработчики
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

  // Мемоизированные состояния
  const subscriptionState = useMemo(() => ({
    isSubscribed,
    isLoading,
    buttonText: isLoading ? null : (isSubscribed ? "Отписаться" : "Подписаться"),
    buttonClass: isSubscribed ? "unsubscribe" : "subscribe",
    ariaLabel: isSubscribed ? "Отписаться" : "Подписаться"
  }), [isSubscribed, isLoading]);

  const imageState = useMemo(() => ({
    hasImage: !!imgPath,
    fullImageUrl,
    alt: `Фотография ${name}`
  }), [imgPath, fullImageUrl, name]);

  return {
    isLoggedIn,
    displayAbout,
    subscriptionState,
    imageState,
    handleSubscription,
    handleScheduleClick,
    handleInfoClick,
  };
}; 
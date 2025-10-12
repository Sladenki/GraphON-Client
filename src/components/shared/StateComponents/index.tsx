import React from 'react';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';

// Общие компоненты состояний для переиспользования

export const LoadingComponent = React.memo(() => <SpinnerLoader />);
LoadingComponent.displayName = 'LoadingComponent';

export const LoadingWithWrapper = React.memo<{ className?: string }>(({ className }) => (
  <div className={className}>
    <SpinnerLoader />
  </div>
));
LoadingWithWrapper.displayName = 'LoadingWithWrapper';

export const NoSearchResultsComponent = React.memo<{ 
  entityName?: string 
}>(({ entityName = 'результатов' }) => (
  <EmptyState
    message="Ничего не найдено"
    subMessage={`Попробуйте изменить параметры поиска или посмотреть все доступные ${entityName}`}
    emoji="🔍"
  />
));
NoSearchResultsComponent.displayName = 'NoSearchResultsComponent';

export const EmptyEventsComponent = React.memo(() => (
  <EmptyState
    message="Пока что мероприятий нет"
    subMessage="Но скоро здесь появится что-то интересное! Загляните позже, чтобы не пропустить крутые события"
    emoji="🎉"
  />
));
EmptyEventsComponent.displayName = 'EmptyEventsComponent';

export const EmptyGraphsComponent = React.memo(() => (
  <EmptyState
    message="Пока что групп нет"
    subMessage="Здесь скоро появятся интересные группы для изучения. Загляните позже!"
    emoji="📚"
  />
));
EmptyGraphsComponent.displayName = 'EmptyGraphsComponent';

export const ErrorComponent = React.memo<{ 
  onRetry: () => void;
  message?: string;
  className?: string;
}>(({ onRetry, message = "Ошибка загрузки данных", className }) => (
  <div className={className}>
    <div>⚠️</div>
    <div>{message}</div>
    <button onClick={onRetry}>
      Повторить
    </button>
  </div>
));
ErrorComponent.displayName = 'ErrorComponent'; 
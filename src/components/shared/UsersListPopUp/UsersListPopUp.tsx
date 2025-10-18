import React from 'react';
import PopUpWrapper from '../../global/PopUpWrapper/PopUpWrapper';
import { Spinner } from '@heroui/react';
import { Users, AlertCircle } from 'lucide-react';
import AttendeeItem, { AttendeeUser } from './AttendeeItem';

export interface UsersListItem {
  _id: string;
  name?: string;
  avatarUrl?: string;
  telegramId?: string;
  avaPath?: string;
  firstName?: string;
  username?: string;
  lastName?: string;
}

interface UsersListPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  isLoading: boolean;
  isError: boolean;
  users: UsersListItem[] | undefined;
  renderItem?: (user: UsersListItem) => React.ReactNode;
  emptyTitle: string;
  emptyHint?: string;
  loadingText?: string;
  errorText?: string;
  errorHint?: string;
  width?: number;
  height?: number;
  classNames?: {
    container?: string;
    header?: string;
    headerIcon?: string;
    headerContent?: string;
    titleRow?: string;
    title?: string;
    subtitle?: string;
    badge?: string;
    center?: string;
    loadingText?: string;
    errorState?: string;
    errorIcon?: string;
    errorText?: string;
    errorHint?: string;
    emptyState?: string;
    emptyIcon?: string;
    emptyText?: string;
    emptyHint?: string;
    list?: string;
  };
}

const UsersListPopUp: React.FC<UsersListPopUpProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  isLoading,
  isError,
  users,
  renderItem,
  emptyTitle,
  emptyHint,
  loadingText = 'Загрузка...',
  errorText = 'Не удалось загрузить данные',
  errorHint = 'Попробуйте обновить страницу',
  width = 540,
  height = 620,
  classNames = {},
}) => {
  const count = users?.length || 0;

  // Дефолтный рендерер использует AttendeeItem
  const defaultRenderItem = (user: UsersListItem) => (
    <AttendeeItem user={user as AttendeeUser} />
  );

  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <PopUpWrapper isOpen={isOpen} onClose={onClose} width={width} height={height}>
      <div className={classNames.container}>
        <div className={classNames.header}>
          <div className={classNames.headerIcon}>
            <Users size={24} />
          </div>
          <div className={classNames.headerContent}>
            <div className={classNames.titleRow}>
              <h3 className={classNames.title}>{title}</h3>
              {count > 0 && !isLoading && (
                <div className={classNames.badge}>{count}</div>
              )}
            </div>
            {subtitle && <p className={classNames.subtitle}>{subtitle}</p>}
          </div>
        </div>

        {isLoading && (
          <div className={classNames.center}>
            <Spinner size="lg" color="primary" />
            <p className={classNames.loadingText}>{loadingText}</p>
          </div>
        )}

        {isError && (
          <div className={classNames.center}>
            <div className={classNames.errorState}>
              <AlertCircle size={48} className={classNames.errorIcon} />
              <p className={classNames.errorText}>{errorText}</p>
              <p className={classNames.errorHint}>{errorHint}</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {count === 0 ? (
              <div className={classNames.center}>
                <div className={classNames.emptyState}>
                  <Users size={48} className={classNames.emptyIcon} />
                  <p className={classNames.emptyText}>{emptyTitle}</p>
                  {emptyHint && <p className={classNames.emptyHint}>{emptyHint}</p>}
                </div>
              </div>
            ) : (
              <div className={classNames.list}>
                {users?.map((user) => (
                  <React.Fragment key={user._id}>{itemRenderer(user)}</React.Fragment>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PopUpWrapper>
  );
};

export default UsersListPopUp;



'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService, WebSocketEvent } from '@/services/websocket.service';
import { useAuth } from './AuthProvider';
import { FriendRequestNotification } from '@/components/global/FriendRequestNotification/FriendRequestNotification';

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();
  const listenerRef = useRef<(() => void) | null>(null);
  const currentUserId = user?._id;
  
  // Состояние для popup уведомления о заявке в друзья
  const [friendRequestNotification, setFriendRequestNotification] = useState<{
    isOpen: boolean;
    fromUserId: string;
  }>({
    isOpen: false,
    fromUserId: '',
  });

  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    const { type, data } = event;

    console.log('[WebSocket] Received event:', type, data);
    console.log('[WebSocket] Current user ID:', currentUserId);
    console.log('[WebSocket] Event data - fromUserId:', data.fromUserId, 'toUserId:', data.toUserId);

    // Проверяем, относится ли событие к текущему пользователю
    if (!currentUserId) {
      console.log('[WebSocket] No current user ID, ignoring event');
      return;
    }

    if (data.toUserId !== currentUserId && data.fromUserId !== currentUserId) {
      console.log('[WebSocket] Event not for current user, ignoring');
      console.log('[WebSocket] Expected toUserId or fromUserId to be:', currentUserId);
      return; // Событие не для текущего пользователя
    }

    switch (type) {
      case 'friend_request_sent': {
        // fromUserId отправил заявку toUserId
        // Для получателя (toUserId) - это входящая заявка
        if (currentUserId === data.toUserId) {
          console.log('[WebSocket] Friend request received! Showing popup for user:', data.fromUserId);
          console.log('[WebSocket] Adding to followers:', data.fromUserId);
          
          // Показываем popup уведомление
          setFriendRequestNotification({
            isOpen: true,
            fromUserId: data.fromUserId,
          });
          
          queryClient.setQueryData(['social', 'followers'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          if (pages.length === 0) {
            return {
              ...old,
              pages: [{ items: [data.fromUserId], nextCursor: undefined }],
            };
          }
          const firstPage = pages[0];
          const existingItems = firstPage.items || [];
          if (existingItems.includes(data.fromUserId)) return old;
          return {
            ...old,
            pages: [
              { ...firstPage, items: [data.fromUserId, ...existingItems] },
              ...pages.slice(1),
            ],
          };
        });
        } else if (currentUserId === data.fromUserId) {
          // Для отправителя (fromUserId) - это исходящая заявка
          console.log('[WebSocket] Adding to following:', data.toUserId);
          queryClient.setQueryData(['social', 'following'], (old: any) => {
            if (!old) return old;
            const pages = old.pages || [];
            if (pages.length === 0) {
              return {
                ...old,
                pages: [{ items: [data.toUserId], nextCursor: undefined }],
              };
            }
            const firstPage = pages[0];
            const existingItems = firstPage.items || [];
            if (existingItems.includes(data.toUserId)) return old;
            return {
              ...old,
              pages: [
                { ...firstPage, items: [data.toUserId, ...existingItems] },
                ...pages.slice(1),
              ],
            };
          });
        }
        break;
      }

      case 'friend_request_accepted': {
        // fromUserId принял заявку от toUserId
        // Если текущий пользователь получил это событие, значит он участник
        // Определяем ID другого пользователя
        const otherUserId = currentUserId === data.fromUserId ? data.toUserId : data.fromUserId;
        
        // Удаляем другого пользователя из входящих заявок (если был там)
        queryClient.setQueryData(['social', 'followers'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          return {
            ...old,
            pages: pages.map((page: any) => ({
              ...page,
              items: (page.items || []).filter((id: string) => id !== otherUserId),
            })),
          };
        });

        // Удаляем другого пользователя из исходящих заявок (если был там)
        queryClient.setQueryData(['social', 'following'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          return {
            ...old,
            pages: pages.map((page: any) => ({
              ...page,
              items: (page.items || []).filter((id: string) => id !== otherUserId),
            })),
          };
        });

        // Добавляем в друзья
        queryClient.setQueryData(['social', 'friends'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          if (pages.length === 0) {
            return {
              ...old,
              pages: [{ items: [otherUserId], nextCursor: undefined }],
            };
          }
          const firstPage = pages[0];
          const existingItems = firstPage.items || [];
          if (existingItems.includes(otherUserId)) return old;
          return {
            ...old,
            pages: [
              { ...firstPage, items: [otherUserId, ...existingItems] },
              ...pages.slice(1),
            ],
          };
        });
        break;
      }

      case 'friend_request_declined': {
        // fromUserId отклонил заявку от toUserId
        const requesterUserId = data.fromUserId;
        
        // Удаляем из входящих заявок
        queryClient.setQueryData(['social', 'followers'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          return {
            ...old,
            pages: pages.map((page: any) => ({
              ...page,
              items: (page.items || []).filter((id: string) => id !== requesterUserId),
            })),
          };
        });

        // Удаляем из исходящих заявок (для отправителя)
        queryClient.setQueryData(['social', 'following'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          return {
            ...old,
            pages: pages.map((page: any) => ({
              ...page,
              items: (page.items || []).filter((id: string) => id !== data.toUserId),
            })),
          };
        });
        break;
      }

      case 'friend_removed': {
        // Удаляем друга (может быть fromUserId или toUserId, в зависимости от того, кто удалил)
        const friendId = data.fromUserId || data.toUserId;
        
        queryClient.setQueryData(['social', 'friends'], (old: any) => {
          if (!old) return old;
          const pages = old.pages || [];
          return {
            ...old,
            pages: pages.map((page: any) => ({
              ...page,
              items: (page.items || []).filter((id: string) => id !== friendId),
            })),
          };
        });
        break;
      }

      default:
        console.warn('[WebSocket] Unknown event type:', type);
    }
  }, [currentUserId, queryClient]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('[WebSocketProvider] User not logged in, disconnecting WebSocket');
      websocketService.disconnect();
      return;
    }

    console.log('[WebSocketProvider] User logged in, connecting WebSocket. Current userId:', currentUserId);

    // Подключаемся при авторизации (не критично, если не подключится - приложение будет работать)
    try {
      websocketService.connect();
    } catch (error) {
      console.warn('[WebSocketProvider] Failed to connect WebSocket:', error);
      // Приложение продолжит работу без WebSocket
    }

    // Подписываемся на события
    listenerRef.current = websocketService.subscribe((event: WebSocketEvent) => {
      handleWebSocketEvent(event);
    });
    console.log('[WebSocketProvider] WebSocket event listener registered');

    return () => {
      if (listenerRef.current) {
        console.log('[WebSocketProvider] Unsubscribing WebSocket listener');
        listenerRef.current();
      }
    };
  }, [isLoggedIn, handleWebSocketEvent, currentUserId]);

  const handleCloseNotification = () => {
    setFriendRequestNotification({
      isOpen: false,
      fromUserId: '',
    });
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected: websocketService.isConnected(),
      }}
    >
      {children}
      
      {/* Popup уведомление о заявке в друзья */}
      <FriendRequestNotification
        isOpen={friendRequestNotification.isOpen}
        onClose={handleCloseNotification}
        fromUserId={friendRequestNotification.fromUserId}
      />
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);


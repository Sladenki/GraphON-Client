'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService, WebSocketEvent } from '@/services/websocket.service';
import { useAuth } from './AuthProvider';

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

  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    const { type, data } = event;

    console.log('[WebSocket] Received event:', type, data);

    // Проверяем, относится ли событие к текущему пользователю
    if (currentUserId && data.toUserId !== currentUserId && data.fromUserId !== currentUserId) {
      console.log('[WebSocket] Event not for current user, ignoring');
      return; // Событие не для текущего пользователя
    }

    switch (type) {
      case 'friend_request_sent': {
        // fromUserId отправил заявку toUserId
        // Для получателя (toUserId) - это входящая заявка
        if (currentUserId === data.toUserId) {
          console.log('[WebSocket] Adding to followers:', data.fromUserId);
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
      websocketService.disconnect();
      return;
    }

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

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, [isLoggedIn, handleWebSocketEvent]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected: websocketService.isConnected(),
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);


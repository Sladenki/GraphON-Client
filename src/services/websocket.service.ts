'use client';

import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/api/interceptors';

export type WebSocketEventType = 
  | 'friend_request_sent'
  | 'friend_request_accepted'
  | 'friend_request_declined'
  | 'friend_removed';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: {
    fromUserId: string;
    toUserId: string;
    timestamp?: string;
  };
}

type WebSocketEventListener = (event: WebSocketEvent) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Set<WebSocketEventListener> = new Set();
  private isConnecting = false;

  private getSocketUrl(): string {
    if (!API_URL) {
      throw new Error('API_URL is not defined');
    }

    // Преобразуем HTTP URL в базовый URL для Socket.IO
    const url = new URL(API_URL);
    // Socket.IO использует тот же хост и порт, но с путем /ws
    return `${url.protocol}//${url.host}/ws`;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const socketUrl = this.getSocketUrl();
      const token = this.getToken();

      if (!token) {
        console.warn('[WebSocket] No token found, cannot connect');
        this.isConnecting = false;
        return;
      }

      console.log('[WebSocket] Connecting to Socket.IO:', socketUrl);

      this.socket = io(socketUrl, {
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] ✅ Connected successfully to Socket.IO');
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] 🔌 Disconnected. Reason:', reason);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.warn('[WebSocket] ⚠️ Connection error:', error.message);
        console.warn('[WebSocket] App will continue to work without real-time updates.');
        this.isConnecting = false;
      });

      // Слушаем событие relationship_event от сервера
      this.socket.on('relationship_event', (event: WebSocketEvent) => {
        console.log('[WebSocket] 📨 Received relationship_event:', JSON.stringify(event, null, 2));
        this.notifyListeners(event);
      });

    } catch (error) {
      console.warn('[WebSocket] Failed to create Socket.IO connection:', error);
      console.warn('App will continue to work without real-time updates.');
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting Socket.IO');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  subscribe(listener: WebSocketEventListener): () => void {
    this.listeners.add(listener);
    
    // Возвращаем функцию для отписки
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: WebSocketEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[WebSocket] Error in listener:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Экспортируем singleton экземпляр
export const websocketService = new WebSocketService();

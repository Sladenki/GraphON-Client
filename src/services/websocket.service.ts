'use client';

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
  private socket: WebSocket | null = null;
  private listeners: Set<WebSocketEventListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;
  private shouldReconnect = true;

  private getWebSocketUrl(): string {
    if (!API_URL) {
      throw new Error('API_URL is not defined');
    }

    // Преобразуем HTTP URL в WebSocket URL
    const url = new URL(API_URL);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Получаем токен из localStorage для авторизации
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    
    // WebSocket эндпоинт обычно на том же домене, но по пути /ws
    return `${protocol}//${url.host}/ws${tokenParam}`;
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const wsUrl = this.getWebSocketUrl();
      console.log('[WebSocket] Connecting to:', wsUrl.replace(/\?token=.*$/, '?token=***'));
      this.socket = new WebSocket(wsUrl);

      // Устанавливаем таймаут для подключения (5 секунд)
      const connectionTimeout = setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          console.warn('[WebSocket] Connection timeout, closing socket');
          this.shouldReconnect = false;
          if (this.socket) {
            this.socket.close();
          }
        }
      }, 5000);

      this.socket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('[WebSocket] Connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error, event.data);
        }
      };

      this.socket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.warn('[WebSocket] Connection error - WebSocket server may not be available. App will continue to work without real-time updates.');
        // Не логируем полную ошибку, так как это нормально, если сервер не поддерживает WebSocket
        this.isConnecting = false;
        this.shouldReconnect = false; // Не пытаемся переподключаться при ошибке подключения
      };

      this.socket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('[WebSocket] Disconnected', event.code, event.reason);
        this.isConnecting = false;
        this.socket = null;

        // Переподключаемся только если это не была ошибка подключения
        // Код 1006 означает, что соединение было закрыто ненормально (ошибка подключения)
        if (this.shouldReconnect && event.code !== 1006 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[WebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        } else if (event.code === 1006) {
          console.warn('[WebSocket] Connection failed - WebSocket server is not available. App will continue to work without real-time updates.');
        }
      };
    } catch (error) {
      console.warn('[WebSocket] Failed to create WebSocket connection:', error);
      console.warn('App will continue to work without real-time updates.');
      this.isConnecting = false;
      this.shouldReconnect = false;
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(event: WebSocketEvent): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      console.warn('[WebSocket] Cannot send message: socket is not open');
    }
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
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Экспортируем singleton экземпляр
export const websocketService = new WebSocketService();


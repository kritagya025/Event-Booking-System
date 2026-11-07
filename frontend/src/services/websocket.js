import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isLocalhostHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const WS_ENDPOINT = import.meta.env.VITE_WS_URL || (isLocalhostHost ? 'http://localhost:8080/ws' : '/ws');

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
  }

  connect(onConnectCallback) {
    if (this.client && this.client.active) {
      if (onConnectCallback) onConnectCallback();
      return;
    }

    // Skip connecting to local dead endpoint on remote production hosts
    if (isHttps && !isLocalhostHost && !import.meta.env.VITE_WS_URL && WS_ENDPOINT.includes('localhost')) {
      return;
    }

    try {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_ENDPOINT),
        reconnectDelay: 10000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Connected to EventHub STOMP WebSocket Server');
          if (onConnectCallback) onConnectCallback();
        },
        onStompError: (frame) => {
          console.warn('STOMP error:', frame?.headers?.['message']);
        },
      });

      this.client.activate();
    } catch (e) {
      console.warn('WebSocket connection not available:', e.message);
    }
  }

  subscribeToSeatUpdates(eventId, callback) {
    const topic = `/topic/events/${eventId}/seats`;

    if (!this.client || !this.client.active) {
      this.connect(() => {
        this.doSubscribe(topic, callback);
      });
    } else {
      this.doSubscribe(topic, callback);
    }
  }

  doSubscribe(topic, callback) {
    if (!this.client || !this.client.active) return;
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
    }

    const sub = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  unsubscribe(eventId) {
    const topic = `/topic/events/${eventId}/seats`;
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export const wsService = new WebSocketService();

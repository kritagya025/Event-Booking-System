import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to EventHub STOMP WebSocket Server');
        if (onConnectCallback) onConnectCallback();
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame.headers['message']);
      },
    });

    this.client.activate();
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

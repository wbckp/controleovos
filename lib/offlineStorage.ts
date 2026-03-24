import { OfflineQueueItem, OfflineAction, OfflinePayload } from '../types';

const QUEUE_KEY = 'ovocontrol_offline_queue';

export const getOfflineQueue = (): OfflineQueueItem[] => {
  const queue = localStorage.getItem(QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
};

export const addToOfflineQueue = (action: OfflineAction, payload: OfflinePayload, description: string) => {
  const queue = getOfflineQueue();
  const newItem: OfflineQueueItem = {
    id: Math.random().toString(36).substr(2, 9),
    action,
    payload,
    description,
    timestamp: Date.now()
  };
  queue.push(newItem);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const removeFromOfflineQueue = (id: string) => {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

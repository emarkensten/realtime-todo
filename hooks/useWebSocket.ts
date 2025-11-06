"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Todo, TodoList, MessageType } from '@/types/todo';

export function useWebSocket(listId: string) {
  const [list, setList] = useState<TodoList>({
    id: listId,
    name: '',
    todos: [],
    createdAt: Date.now()
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messageQueueRef = useRef<MessageType[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`list-${listId}`);
    if (stored) {
      try {
        setList(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    }
  }, [listId]);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(`list-${listId}`, JSON.stringify(list));
  }, [list, listId]);

  // Apply message to local state (optimistic update)
  const applyMessage = useCallback((data: MessageType) => {
    switch (data.type) {
      case 'init':
        setList(data.list);
        break;
      case 'update-name':
        setList(prev => ({ ...prev, name: data.name }));
        break;
      case 'add':
        setList(prev => {
          if (prev.todos.some(t => t.id === data.todo.id)) {
            return prev;
          }
          return { ...prev, todos: [...prev.todos, data.todo] };
        });
        break;
      case 'update':
        setList(prev => ({
          ...prev,
          todos: prev.todos.map(todo => (todo.id === data.todo.id ? data.todo : todo))
        }));
        break;
      case 'delete':
        setList(prev => ({
          ...prev,
          todos: prev.todos.filter(todo => todo.id !== data.id)
        }));
        break;
      case 'delete-completed':
        setList(prev => ({
          ...prev,
          todos: prev.todos.filter(todo => !todo.completed)
        }));
        break;
      case 'text-update':
        setList(prev => ({
          ...prev,
          todos: prev.todos.map(todo =>
            todo.id === data.id ? { ...todo, text: data.text } : todo
          )
        }));
        break;
    }
  }, []);

  // Flush message queue
  const flushQueue = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) {
          wsRef.current.send(JSON.stringify(message));
        }
      }
    }
  }, []);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws?listId=${listId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Flush any queued messages
      flushQueue();
    };

    ws.onmessage = (event) => {
      const data: MessageType = JSON.parse(event.data);
      applyMessage(data);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [listId, flushQueue, applyMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: MessageType) => {
    // Apply optimistically to local state
    applyMessage(message);

    // Send to server or queue if offline
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue for later when we reconnect
      messageQueueRef.current.push(message);
    }
  }, [applyMessage]);

  const updateListName = useCallback((name: string) => {
    sendMessage({ type: 'update-name', name });
  }, [sendMessage]);

  const addTodo = useCallback((todo: Todo) => {
    sendMessage({ type: 'add', todo });
  }, [sendMessage]);

  const updateTodo = useCallback((todo: Todo) => {
    sendMessage({ type: 'update', todo });
  }, [sendMessage]);

  const deleteTodo = useCallback((id: string) => {
    sendMessage({ type: 'delete', id });
  }, [sendMessage]);

  const deleteCompleted = useCallback(() => {
    sendMessage({ type: 'delete-completed' });
  }, [sendMessage]);

  const updateTodoText = useCallback((id: string, text: string) => {
    sendMessage({ type: 'text-update', id, text });
  }, [sendMessage]);

  return {
    list,
    isConnected,
    updateListName,
    addTodo,
    updateTodo,
    deleteTodo,
    deleteCompleted,
    updateTodoText,
  };
}

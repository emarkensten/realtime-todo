"use client"

import { useEffect, useRef, useState } from 'react';
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

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws?listId=${listId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data: MessageType = JSON.parse(event.data);

      switch (data.type) {
        case 'init':
          setList(data.list);
          break;
        case 'update-name':
          setList(prev => ({ ...prev, name: data.name }));
          break;
        case 'add':
          setList(prev => {
            // Check if todo already exists to prevent duplicates
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
        case 'text-update':
          setList(prev => ({
            ...prev,
            todos: prev.todos.map(todo =>
              todo.id === data.id ? { ...todo, text: data.text } : todo
            )
          }));
          break;
      }
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
  };

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
  }, [listId]);

  const sendMessage = (message: MessageType) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const updateListName = (name: string) => {
    sendMessage({ type: 'update-name', name });
  };

  const addTodo = (todo: Todo) => {
    sendMessage({ type: 'add', todo });
  };

  const updateTodo = (todo: Todo) => {
    sendMessage({ type: 'update', todo });
  };

  const deleteTodo = (id: string) => {
    sendMessage({ type: 'delete', id });
  };

  const updateTodoText = (id: string, text: string) => {
    sendMessage({ type: 'text-update', id, text });
  };

  return {
    list,
    isConnected,
    updateListName,
    addTodo,
    updateTodo,
    deleteTodo,
    updateTodoText,
  };
}

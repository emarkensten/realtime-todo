"use client"

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Wifi, WifiOff } from 'lucide-react';
import type { Todo } from '@/types/todo';

export function TodoApp() {
  const { todos, isConnected, addTodo, updateTodo, deleteTodo, updateTodoText } = useWebSocket();
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: uuidv4(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      addTodo(newTodo);
      setNewTodoText('');
    }
  };

  const handleToggleTodo = (todo: Todo) => {
    updateTodo({
      ...todo,
      completed: !todo.completed,
    });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  const handleTextChange = (id: string, text: string) => {
    updateTodoText(id, text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Realtime Todo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Dela todos i realtid mellan flera webbläsare
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Ansluten
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Ansluter...
                </span>
              </>
            )}
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Mina uppgifter</CardTitle>
            <CardDescription>
              Ändringar syns omedelbart i alla anslutna webbläsare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input
                type="text"
                placeholder="Lägg till en ny uppgift..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!isConnected || !newTodoText.trim()}>
                Lägg till
              </Button>
            </form>

            <div className="space-y-2">
              {todos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Inga uppgifter än. Lägg till din första uppgift!</p>
                </div>
              ) : (
                todos
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo)}
                        disabled={!isConnected}
                      />
                      <Input
                        type="text"
                        value={todo.text}
                        onChange={(e) => handleTextChange(todo.id, e.target.value)}
                        disabled={!isConnected}
                        className={`flex-1 border-0 bg-transparent focus-visible:ring-0 ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTodo(todo.id)}
                        disabled={!isConnected}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
              )}
            </div>

            {todos.length > 0 && (
              <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                {todos.filter(t => t.completed).length} av {todos.length} uppgifter klara
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>💡 Öppna denna sida i flera flikar eller webbläsare för att se realtidssynkronisering</p>
        </div>
      </div>
    </div>
  );
}

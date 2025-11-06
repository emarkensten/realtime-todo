"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Wifi, WifiOff, Copy, Check, Home, Share2 } from 'lucide-react';
import type { Todo } from '@/types/todo';

interface TodoAppProps {
  listId: string;
  initialName?: string;
}

export function TodoApp({ listId, initialName = '' }: TodoAppProps) {
  const { list, isConnected, updateListName, addTodo, updateTodo, deleteTodo, updateTodoText } = useWebSocket(listId);
  const [newTodoText, setNewTodoText] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const router = useRouter();

  // Set initial name if provided
  useEffect(() => {
    if (initialName && !list.name && isConnected) {
      updateListName(initialName);
    }
  }, [initialName, list.name, isConnected, updateListName]);

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

  const handleCopyLink = async () => {
    const url = window.location.href.split('?')[0]; // Remove query params
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStartEditName = () => {
    setTempName(list.name);
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateListName(tempName.trim());
    }
    setEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setTempName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Hem
          </Button>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Ansluten
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Ansluter...
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          {editingName ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEditName();
                }}
                className="max-w-md text-center text-2xl font-bold"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveName}>
                Spara
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEditName}>
                Avbryt
              </Button>
            </div>
          ) : (
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-primary transition-colors"
              onClick={handleStartEditName}
              title="Klicka för att redigera"
            >
              {list.name || 'Namnlös lista'}
            </h1>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Dela listan med andra genom att skicka länken
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Kopierad!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Dela lista
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Uppgifter</CardTitle>
            <CardDescription>
              Ändringar syns omedelbart för alla med denna länk
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
              {list.todos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Inga uppgifter än. Lägg till din första uppgift!</p>
                </div>
              ) : (
                list.todos
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

            {list.todos.length > 0 && (
              <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                {list.todos.filter(t => t.completed).length} av {list.todos.length} uppgifter klara
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Dela denna lista
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                Kopiera länken och dela med andra. Alla med länken kan se och redigera listan i realtid.
              </p>
              <code className="block text-xs bg-white dark:bg-gray-800 p-2 rounded border break-all">
                {typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

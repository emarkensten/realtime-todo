"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ChevronDown, ChevronUp, Plus, ArrowLeft, Share2, WifiOff } from 'lucide-react';
import type { Todo } from '@/types/todo';

interface TodoAppProps {
  listId: string;
  initialName?: string;
}

export function TodoApp({ listId, initialName = '' }: TodoAppProps) {
  const { list, isConnected, updateListName, addTodo, updateTodo, deleteTodo, deleteCompleted, updateTodoText } = useWebSocket(listId);
  const [newTodoText, setNewTodoText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const router = useRouter();

  // Set initial name if provided
  useEffect(() => {
    if (initialName && !list.name && isConnected) {
      updateListName(initialName);
    }
  }, [initialName, list.name, isConnected, updateListName]);

  const activeTodos = list.todos.filter(t => !t.completed);
  const completedTodos = list.todos.filter(t => t.completed);

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

  const handleShare = async () => {
    const url = window.location.href.split('?')[0];
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.name || 'Min lista',
          url: url
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          alert('Länk kopierad!');
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Länk kopierad!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {editingName ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="h-9 text-lg font-semibold"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>OK</Button>
              </div>
            ) : (
              <h1
                className="flex-1 text-xl font-bold cursor-pointer truncate"
                onClick={handleStartEditName}
              >
                {list.name || 'Min lista'}
              </h1>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Offline indicator - only shown when disconnected */}
          {!isConnected && (
            <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline - ändringar synkas när du är online igen</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Lägg till uppgift..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              className="flex-1 h-12 text-base"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!newTodoText.trim()}
              className="h-12 px-6"
              size="lg"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </form>

        {/* Active Todos */}
        <div className="space-y-2">
          {activeTodos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-gray-500">
                <p>Inga uppgifter än</p>
                <p className="text-sm mt-1">Lägg till din första uppgift ovan</p>
              </CardContent>
            </Card>
          ) : (
            activeTodos
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((todo) => (
                <Card key={todo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo)}
                        className="mt-1.5 h-5 w-5"
                      />
                      <Input
                        type="text"
                        value={todo.text}
                        onChange={(e) => updateTodoText(todo.id, e.target.value)}
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0 h-auto py-1 text-base"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-600 p-2 -mr-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Completed Section */}
        {completedTodos.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span>Klara uppgifter ({completedTodos.length})</span>
              {showCompleted ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showCompleted && (
              <div className="mt-2 space-y-2">
                {completedTodos
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((todo) => (
                    <Card key={todo.id} className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleTodo(todo)}
                            className="mt-1.5 h-5 w-5"
                          />
                          <span className="flex-1 text-gray-500 line-through py-1">
                            {todo.text}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-600 p-2 -mr-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                <Button
                  variant="outline"
                  onClick={deleteCompleted}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Radera alla klara uppgifter
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

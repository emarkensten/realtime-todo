"use client"

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ChevronDown, ChevronUp, Plus, ArrowLeft, Share2, WifiOff } from 'lucide-react';
import { parseShoppingItem } from '@/lib/shoppingParser';
import { searchGroceries } from '@/lib/groceryData';
import { GroceryAutocomplete } from '@/components/GroceryAutocomplete';
import type { Todo } from '@/types/todo';

interface TodoAppProps {
  listId: string;
  initialName?: string;
}

const CATEGORY_ORDER = [
  'Frukt',
  'Grönsaker',
  'Mejeri',
  'Kött',
  'Fisk',
  'Bröd',
  'Frukost',
  'Skafferi',
  'Pasta & Ris',
  'Konserver',
  'Kryddor',
  'Bakning',
  'Frys',
  'Dryck',
  'Snacks',
  'Växtbaserat',
  'Hygien',
  'Baby',
  'Djur',
  'Övrigt',
];

function findCategoryForText(text: string): string {
  const results = searchGroceries(text, 1);
  return results.length > 0 ? results[0].category : 'Övrigt';
}

function formatTodoDisplay(todo: Todo): string {
  const parts: string[] = [];
  if (todo.amount) parts.push(todo.amount);
  if (todo.unit) parts.push(todo.unit);
  parts.push(todo.text);
  return parts.join(' ');
}

export function TodoApp({ listId, initialName = '' }: TodoAppProps) {
  const { list, isConnected, updateListName, addTodo, updateTodo, deleteTodo, deleteCompleted, updateTodoText } = useWebSocket(listId);
  const [newTodoText, setNewTodoText] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [pendingCategory, setPendingCategory] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    if (initialName && !list.name && isConnected) {
      updateListName(initialName);
    }
  }, [initialName, list.name, isConnected, updateListName]);

  const activeTodos = list.todos.filter(t => !t.completed);
  const completedTodos = list.todos.filter(t => t.completed);

  // Group active todos by category
  const groupedTodos = useMemo(() => {
    const groups: Record<string, Todo[]> = {};
    for (const todo of activeTodos) {
      const cat = todo.category || 'Övrigt';
      // Map unknown categories to Övrigt so nothing gets lost
      const resolvedCat = CATEGORY_ORDER.includes(cat) ? cat : 'Övrigt';
      if (!groups[resolvedCat]) groups[resolvedCat] = [];
      groups[resolvedCat].push(todo);
    }
    for (const cat of Object.keys(groups)) {
      groups[cat].sort((a, b) => b.createdAt - a.createdAt);
    }
    return CATEGORY_ORDER
      .filter(cat => groups[cat]?.length > 0)
      .map(cat => ({ category: cat, todos: groups[cat] }));
  }, [activeTodos]);

  const submitTodo = (text: string, category?: string) => {
    if (!text.trim()) return;

    const parsedItems = parseShoppingItem(text);
    parsedItems.forEach(item => {
      const resolvedCategory = category || findCategoryForText(item.text);
      const newTodo: Todo = {
        id: uuidv4(),
        text: item.text,
        amount: item.amount,
        unit: item.unit,
        category: resolvedCategory,
        completed: false,
        createdAt: Date.now(),
      };
      addTodo(newTodo);
    });

    setNewTodoText('');
    setPendingCategory(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    submitTodo(newTodoText, pendingCategory);
  };

  const handleSelectSuggestion = (suggestion: string, category?: string) => {
    submitTodo(suggestion, category);
  };

  const handleToggleTodo = (todo: Todo) => {
    updateTodo({ ...todo, completed: !todo.completed });
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
        await navigator.share({ title: list.name || 'Min lista', url });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="p-2 -ml-2"
              aria-label="Tillbaka till startsidan"
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
                  aria-label="Listnamn"
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
              aria-label="Dela lista"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {!isConnected && (
            <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400" role="status">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline – ändringar synkas när du är online igen</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Item count live region */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {activeTodos.length} aktiva varor, {completedTodos.length} klara
        </div>

        {/* Active Todos — grouped by category */}
        {activeTodos.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg">Inga varor än</p>
            <p className="text-sm mt-1">Lägg till din första vara nedan</p>
          </div>
        ) : (
          <div role="list" aria-label="Inköpslista">
            {groupedTodos.map(({ category, todos }) => (
              <section key={category} className="mb-6" aria-label={category}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-2">
                  {category}
                </h2>
                <div className="space-y-0.5">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      role="listitem"
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo)}
                        className="h-5 w-5 flex-shrink-0"
                        aria-label={`Markera ${formatTodoDisplay(todo)} som klar`}
                      />
                      <div className="flex-1 flex items-baseline gap-2 min-w-0">
                        {todo.amount && (
                          <span className="font-semibold text-primary text-base tabular-nums">
                            {todo.amount}
                          </span>
                        )}
                        {todo.unit && (
                          <span className="text-sm text-gray-500 font-medium">
                            {todo.unit}
                          </span>
                        )}
                        <span className="text-base truncate">
                          {todo.text}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-gray-300 hover:text-red-600 p-1.5 -mr-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Ta bort ${formatTodoDisplay(todo)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Completed Section */}
        {completedTodos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-between px-1 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-expanded={showCompleted}
              aria-controls="completed-section"
            >
              <span className="flex items-center gap-2">
                Klart
                <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold tabular-nums">
                  {completedTodos.length}
                </span>
              </span>
              {showCompleted ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showCompleted && (
              <div id="completed-section" role="list" aria-label="Klara varor" className="mt-1">
                <div className="space-y-0.5">
                  {completedTodos
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((todo) => (
                      <div
                        key={todo.id}
                        role="listitem"
                        className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo)}
                          className="h-5 w-5 flex-shrink-0"
                          aria-label={`Markera ${formatTodoDisplay(todo)} som ej klar`}
                        />
                        <span className="flex-1 text-sm text-gray-400 line-through truncate">
                          {formatTodoDisplay(todo)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-gray-300 hover:text-red-600 p-1.5 -mr-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Ta bort ${formatTodoDisplay(todo)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={deleteCompleted}
                  className="mt-3 w-full text-center text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 py-2 transition-colors"
                  aria-label="Rensa alla klara varor"
                >
                  Rensa alla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <form onSubmit={handleAddTodo}>
            <div className="flex gap-2">
              <GroceryAutocomplete
                value={newTodoText}
                onChange={(val) => {
                  setNewTodoText(val);
                  setPendingCategory(undefined);
                }}
                onSelectSuggestion={handleSelectSuggestion}
                placeholder="mjölk, 4 apelsiner..."
              />
              <Button
                type="submit"
                disabled={!newTodoText.trim()}
                className="h-14 px-6 text-base"
                size="lg"
                aria-label="Lägg till vara"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

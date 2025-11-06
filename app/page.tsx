"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListTodo, Plus, ArrowRight } from 'lucide-react';

export default function Home() {
  const [listName, setListName] = useState('');
  const [existingListId, setExistingListId] = useState('');
  const router = useRouter();

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      const listId = uuidv4();
      router.push(`/list/${listId}?name=${encodeURIComponent(listName.trim())}`);
    }
  };

  const handleJoinList = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingListId.trim()) {
      router.push(`/list/${existingListId.trim()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <ListTodo className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Realtime Todo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Skapa delade todo-listor som synkroniseras i realtid mellan alla användare
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create new list */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Skapa ny lista
              </CardTitle>
              <CardDescription>
                Starta en ny todo-lista och dela länken med andra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateList} className="space-y-4">
                <div>
                  <label htmlFor="listName" className="text-sm font-medium mb-2 block">
                    Listnamn
                  </label>
                  <Input
                    id="listName"
                    type="text"
                    placeholder="t.ex. Handlingslista, Projekt X..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!listName.trim()}
                  className="w-full"
                  size="lg"
                >
                  Skapa lista
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join existing list */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Gå med i befintlig lista
              </CardTitle>
              <CardDescription>
                Har du en länk? Klistra in list-ID:t här
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinList} className="space-y-4">
                <div>
                  <label htmlFor="listId" className="text-sm font-medium mb-2 block">
                    List-ID
                  </label>
                  <Input
                    id="listId"
                    type="text"
                    placeholder="Klistra in list-ID här..."
                    value={existingListId}
                    onChange={(e) => setExistingListId(e.target.value)}
                    className="w-full font-mono text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!existingListId.trim()}
                  className="w-full"
                  size="lg"
                >
                  Öppna lista
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Realtidssynkronisering</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alla ändringar syns omedelbart för alla användare
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="font-semibold mb-2">Dela enkelt</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Varje lista får en unik URL som du kan dela
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="font-semibold mb-2">Automatisk sparning</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Allt sparas automatiskt och finns kvar mellan sessioner
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

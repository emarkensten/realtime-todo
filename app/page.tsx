"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';

export default function Home() {
  const [listName, setListName] = useState('');
  const router = useRouter();

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    const listId = uuidv4();
    const name = listName.trim() || 'Min lista';
    router.push(`/list/${listId}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Todo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Skapa en ny lista och kom igång
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label htmlFor="listName" className="block text-sm font-medium mb-2">
                  Listnamn (valfritt)
                </label>
                <Input
                  id="listName"
                  type="text"
                  placeholder="t.ex. Inköpslista, Projekt..."
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Skapa lista
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>Din lista sparas automatiskt</p>
          <p>Fungerar även offline</p>
        </div>
      </div>
    </div>
  );
}

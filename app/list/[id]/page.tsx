"use client"

import { use, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TodoApp } from '@/components/TodoApp';

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name') || '';

  return <TodoApp listId={id} initialName={initialName} />;
}

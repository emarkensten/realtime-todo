export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type MessageType =
  | { type: 'init'; todos: Todo[] }
  | { type: 'add'; todo: Todo }
  | { type: 'update'; todo: Todo }
  | { type: 'delete'; id: string }
  | { type: 'text-update'; id: string; text: string };

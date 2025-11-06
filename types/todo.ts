export interface Todo {
  id: string;
  text: string;
  amount?: string;  // "4", "2-3", "fem"
  unit?: string;    // "st", "kg", "g", "dl", "l", "ml"
  completed: boolean;
  createdAt: number;
}

export interface TodoList {
  id: string;
  name: string;
  todos: Todo[];
  createdAt: number;
}

export type MessageType =
  | { type: 'init'; list: TodoList }
  | { type: 'update-name'; name: string }
  | { type: 'add'; todo: Todo }
  | { type: 'update'; todo: Todo }
  | { type: 'delete'; id: string }
  | { type: 'delete-completed' }
  | { type: 'text-update'; id: string; text: string };

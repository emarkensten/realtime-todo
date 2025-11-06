export interface Todo {
  id: string;
  text: string;
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
  | { type: 'text-update'; id: string; text: string };

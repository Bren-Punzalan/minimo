export type Todo = {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  date: string;
  scheduled_days?: string[];
  parent_todo_id?: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: Todo;
        Insert: Omit<Todo, "id" | "created_at">;
        Update: Partial<Omit<Todo, "id" | "created_at">>;
      };
    };
  };
};

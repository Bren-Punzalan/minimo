import { createClient } from "@/app/utils/supabase/client";
import { NextApiRequest, NextApiResponse } from "next";

// In your pages/api/cron/create-scheduled-todos.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("Cron job started at:", new Date().toISOString());

  const supabase = createClient();

  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dayOfWeek = today
      .toLocaleString("en-US", { weekday: "short" })
      .slice(0, 3);

    console.log("Checking for patterns on:", dayOfWeek);

    const { data: patterns, error: patternsError } = await supabase
      .from("recurring_patterns")
      .select("*, todos!todos_id_fkey(*)")
      .eq("active", true);

    if (patternsError) {
      console.error("Error fetching patterns:", patternsError);
      return res.status(500).json({ error: patternsError.message });
    }

    console.log("Found patterns:", patterns);

    if (!patterns?.length) {
      return res.status(200).json({ message: "No todos to create" });
    }

    const createdTodos = [];

    for (const pattern of patterns) {
      if (pattern.days.includes(dayOfWeek)) {
        const parentTodo = pattern.todos;
        console.log("Creating todo from pattern:", pattern);

        const { data: newTodo, error: createError } = await supabase
          .from("todos")
          .insert({
            text: parentTodo.text,
            date: todayStr,
            completed: false,
            user_id: parentTodo.user_id,
            parent_todo_id: pattern.parent_id,
          })
          .select();

        if (createError) {
          console.error("Error creating todo:", createError);
          continue;
        }

        createdTodos.push(newTodo);

        await supabase
          .from("recurring_patterns")
          .update({ last_created_date: todayStr })
          .eq("id", pattern.id);
      }
    }

    console.log("Created todos:", createdTodos);

    res.status(200).json({
      message: "Successfully created scheduled todos",
      created: createdTodos.length,
      todos: createdTodos,
    });
  } catch (error) {
    console.error("Error creating scheduled todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

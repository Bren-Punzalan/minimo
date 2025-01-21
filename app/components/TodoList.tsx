"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Edit, Trash, Calendar, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "../utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useToast } from "@/hooks/use-toast";

type Todo = {
  id: number;
  text: string;
  date: string;
  completed: boolean;
  scheduled_days?: string[];
  parent_todo_id?: number | null;
  user_id: string;
};

type OptimisticUpdate = {
  type: "add" | "update" | "delete" | "toggle" | "schedule";
  todoId?: number;
  data?: Partial<Todo>;
  originalState?: Todo[];
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SortableTodoItem = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onSchedule,
  disabled = false,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onSchedule: (id: number, days: string[]) => void;
  disabled?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isLocalScheduleDialogOpen, setIsLocalScheduleDialogOpen] =
    useState(false);
  const [tempSelectedDays, setTempSelectedDays] = useState<string[]>(
    todo.scheduled_days || []
  );
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg shadow-sm p-3 mb-2 ${
        disabled ? "opacity-50" : "cursor-move"
      } touch-none break-words`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between group">
        <div className="flex items-center space-x-2 flex-grow min-w-0">
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggle(todo.id)}
              disabled={disabled}
            />
          </div>
          <div
            className={`${
              todo.completed ? "line-through text-gray-500" : ""
            } flex-grow min-w-0`}
          >
            <p className="break-words line-clamp-3">{todo.text}</p>
            {todo.scheduled_days && todo.scheduled_days.length > 0 && (
              <p className="text-sm text-gray-400 break-words">
                (Scheduled: {todo.scheduled_days.join(", ")})
              </p>
            )}
          </div>
        </div>
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              disabled={disabled}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onSelect={() => {
                onEdit(todo);
                setShowDropdown(false);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                onDelete(todo.id);
                setShowDropdown(false);
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
            {/* <Dialog
              open={isLocalScheduleDialogOpen}
              onOpenChange={setIsLocalScheduleDialogOpen}
            >
              <DialogTrigger asChild>
                <DropdownMenuItem
                  disabled={true}
                  
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsLocalScheduleDialogOpen(true);
                    setShowDropdown(false);
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Schedule</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>When do you want to repeat this task?</p>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <Button
                        key={day}
                        variant={
                          tempSelectedDays.includes(day) ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() => {
                          setTempSelectedDays((prev) =>
                            prev.includes(day)
                              ? prev.filter((d) => d !== day)
                              : [...prev, day]
                          );
                        }}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setTempSelectedDays(daysOfWeek)}
                  >
                    Every day
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      onSchedule(todo.id, tempSelectedDays);
                      setIsLocalScheduleDialogOpen(false);
                    }}
                  >
                    Save Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [activeTab, setActiveTab] = useState("today");
  const [isLoading, setIsLoading] = useState(true);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    OptimisticUpdate[]
  >([]);

  const { toast } = useToast();

  const MAX_TODOS = 100000000;
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [lastAddedText, setLastAddedText] = useState("");

  // Current date information
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const currentWeek = Math.ceil(
    (currentDate.getDate() + firstDayOfMonth.getDay() - 1) / 7
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.user.id);

    if (error) {
      toast({
        title: "Error fetching todos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTodos(data || []);
    }
    setIsLoading(false);
  };

  // Replace the existing addTodo function with this new version
  const addTodo = async () => {
    const trimmedText = newTodoText.trim();

    // Check for empty text
    if (!trimmedText) return;

    // Prevent duplicate rapid submissions
    if (isAddingTodo || trimmedText === lastAddedText) return;

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Check for todo limit
    if (todos.length >= MAX_TODOS) {
      toast({
        title: "Todo limit reached",
        description: `You can only have up to ${MAX_TODOS} todos. Please complete or delete some todos first.`,
        variant: "destructive",
      });
      return;
    }

    // Set flags to prevent duplicate submissions
    setIsAddingTodo(true);
    setLastAddedText(trimmedText);

    const date = new Date();
    if (activeTab === "tomorrow") {
      date.setDate(date.getDate() + 1);
    }

    // Create optimistic todo
    const optimisticTodo: Todo = {
      id: Date.now(),
      text: trimmedText,
      date: date.toISOString().split("T")[0],
      completed: false,
      user_id: user.user.id,
    };

    // Update UI optimistically
    setTodos((prev) => [...prev, optimisticTodo]);
    setNewTodoText("");

    // Add to optimistic updates
    setOptimisticUpdates((prev) => [
      ...prev,
      {
        type: "add",
        todoId: optimisticTodo.id,
        data: optimisticTodo,
        originalState: todos,
      },
    ]);

    try {
      // Perform actual update
      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            text: trimmedText,
            date: date.toISOString().split("T")[0],
            completed: false,
            user_id: user.user.id,
          },
        ])
        .select();

      if (error) {
        toast({
          title: "Error adding todo",
          description: error.message,
          variant: "destructive",
        });
        // Rollback optimistic update
        setTodos(todos);
      } else if (data) {
        // Update with actual server data
        setTodos((prev) =>
          prev.map((todo) => (todo.id === optimisticTodo.id ? data[0] : todo))
        );
      }
    } catch (error) {
      // Handle any unexpected errors
      toast({
        title: "Error adding todo",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      // Rollback optimistic update
      setTodos(todos);
    } finally {
      // Reset flags after operation completes
      setIsAddingTodo(false);
      // Clear lastAddedText after a short delay to allow for natural duplicate prevention
      setTimeout(() => setLastAddedText(""), 1000);

      // Remove optimistic update
      setOptimisticUpdates((prev) =>
        prev.filter((update) => update.todoId !== optimisticTodo.id)
      );
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Optimistic update
    const originalState = [...todos];
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    // Add to optimistic updates
    setOptimisticUpdates((prev) => [
      ...prev,
      {
        type: "toggle",
        todoId: id,
        data: { completed: !todo.completed },
        originalState,
      },
    ]);

    // Perform actual update
    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
      // Rollback optimistic update
      setTodos(originalState);
    }

    // Remove optimistic update
    setOptimisticUpdates((prev) =>
      prev.filter((update) => update.todoId !== id)
    );
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setIsEditDialogOpen(true);
  };

  const updateTodo = async () => {
    if (!editingTodo) return;

    // Optimistic update
    const originalState = [...todos];
    setTodos((prev) =>
      prev.map((t) => (t.id === editingTodo.id ? { ...t, text: editText } : t))
    );

    // Add to optimistic updates
    setOptimisticUpdates((prev) => [
      ...prev,
      {
        type: "update",
        todoId: editingTodo.id,
        data: { text: editText },
        originalState,
      },
    ]);

    // Perform actual update
    const { error } = await supabase
      .from("todos")
      .update({ text: editText })
      .eq("id", editingTodo.id);

    if (error) {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
      // Rollback optimistic update
      setTodos(originalState);
    }

    // Remove optimistic update
    setOptimisticUpdates((prev) =>
      prev.filter((update) => update.todoId !== editingTodo.id)
    );

    setEditingTodo(null);
    setIsEditDialogOpen(false);
  };

  const deleteTodo = async (id: number) => {
    // Optimistic update
    const originalState = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    // Add to optimistic updates
    setOptimisticUpdates((prev) => [
      ...prev,
      {
        type: "delete",
        todoId: id,
        originalState,
      },
    ]);

    // Perform actual update
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting todo",
        description: error.message,
        variant: "destructive",
      });
      // Rollback optimistic update
      setTodos(originalState);
    }

    // Remove optimistic update
    setOptimisticUpdates((prev) =>
      prev.filter((update) => update.todoId !== id)
    );
  };

  const scheduleTodo = async (id: number, scheduledDays: string[]) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Optimistic update
    const originalState = [...todos];
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, scheduled_days: scheduledDays } : t
      )
    );

    // Add to optimistic updates
    setOptimisticUpdates((prev) => [
      ...prev,
      {
        type: "schedule",
        todoId: id,
        data: { scheduled_days: scheduledDays },
        originalState,
      },
    ]);

    try {
      const { data: existingPattern } = await supabase
        .from("recurring_patterns")
        .select("*")
        .eq("parent_id", id)
        .single();

      if (existingPattern) {
        await supabase
          .from("recurring_patterns")
          .update({
            days: scheduledDays,
            active: true,
            last_created_date: new Date().toISOString().split("T")[0],
          })
          .eq("id", existingPattern.id);
      } else {
        await supabase.from("recurring_patterns").insert({
          parent_id: id,
          days: scheduledDays,
          last_created_date: new Date().toISOString().split("T")[0],
          active: true,
        });
      }

      await supabase
        .from("todos")
        .update({ scheduled_days: scheduledDays })
        .eq("id", id);
    } catch (error) {
      toast({
        title: "Error scheduling todo",
        description: "Failed to update schedule",
        variant: "destructive",
      });
      // Rollback optimistic update
      setTodos(originalState);
    }

    // Remove optimistic update
    setOptimisticUpdates((prev) =>
      prev.filter((update) => update.todoId !== id)
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);

    const newTodos = [...todos];
    const [movedItem] = newTodos.splice(oldIndex, 1);
    newTodos.splice(newIndex, 0, movedItem);

    setTodos(newTodos);
  };

  const filteredTodos = (date: Date) =>
    todos.filter((todo) => {
      const todoDate = new Date(todo.date);
      return todoDate.toDateString() === date.toDateString();
    });

  const getWeekDates = (year: number, month: number, weekNumber: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = new Date(firstDayOfMonth);
    firstDayOfWeek.setDate(
      firstDayOfWeek.getDate() +
        (weekNumber - 1) * 7 -
        firstDayOfMonth.getDay() +
        1
    );

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedYear, selectedMonth, selectedWeek);

  return (
    <Card className="mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Todo List</CardTitle>
        <Dialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <History className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Todo History and Weekly Summary</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedWeek.toString()}
                  onValueChange={(value) => setSelectedWeek(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {weekDates.map((date) => {
                    const dayTodos = filteredTodos(date);
                    const completedTodos = dayTodos.filter((t) => t.completed);
                    const pendingTodos = dayTodos.filter((t) => !t.completed);

                    return (
                      <div
                        key={date.toISOString()}
                        className="border rounded-lg p-4"
                      >
                        <h3 className="text-lg font-semibold mb-2">
                          {date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </h3>
                        <div className="space-y-4">
                          {completedTodos.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-green-600 mb-2">
                                Completed ({completedTodos.length})
                              </h4>
                              <ul className="space-y-2">
                                {completedTodos.map((todo) => (
                                  <li
                                    key={todo.id}
                                    className="flex items-center space-x-2 group  rounded-lg p-2"
                                  >
                                    <Checkbox
                                      checked={true}
                                      onCheckedChange={() =>
                                        toggleTodo(todo.id)
                                      }
                                      disabled={optimisticUpdates.some(
                                        (update) => update.todoId === todo.id
                                      )}
                                    />
                                    <span className="line-through text-gray-500 break-words flex-grow">
                                      {todo.text}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditTodo(todo)}
                                        disabled={optimisticUpdates.some(
                                          (update) => update.todoId === todo.id
                                        )}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTodo(todo.id)}
                                        disabled={optimisticUpdates.some(
                                          (update) => update.todoId === todo.id
                                        )}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {pendingTodos.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-red-600 mb-2">
                                Pending ({pendingTodos.length})
                              </h4>
                              <ul className="space-y-2">
                                {pendingTodos.map((todo) => (
                                  <li
                                    key={todo.id}
                                    className="flex items-center space-x-2 group  rounded-lg p-2"
                                  >
                                    <Checkbox
                                      checked={false}
                                      onCheckedChange={() =>
                                        toggleTodo(todo.id)
                                      }
                                      disabled={optimisticUpdates.some(
                                        (update) => update.todoId === todo.id
                                      )}
                                    />
                                    <span className="break-words flex-grow">
                                      {todo.text}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditTodo(todo)}
                                        disabled={optimisticUpdates.some(
                                          (update) => update.todoId === todo.id
                                        )}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTodo(todo.id)}
                                        disabled={optimisticUpdates.some(
                                          (update) => update.todoId === todo.id
                                        )}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {dayTodos.length === 0 && (
                            <p className="text-sm text-gray-500">
                              No todos for this day
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          </TabsList>

          {["today", "tomorrow"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={filteredTodos(
                    tab === "today"
                      ? new Date()
                      : new Date(Date.now() + 86400000)
                  ).map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 mb-2"
                        >
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-6 flex-grow rounded" />
                        </div>
                      ))
                    : filteredTodos(
                        tab === "today"
                          ? new Date()
                          : new Date(Date.now() + 86400000)
                      ).map((todo) => (
                        <SortableTodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleTodo}
                          onEdit={handleEditTodo}
                          onDelete={deleteTodo}
                          onSchedule={scheduleTodo}
                          disabled={optimisticUpdates.some(
                            (update) => update.todoId === todo.id
                          )}
                        />
                      ))}
                </SortableContext>
              </DndContext>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex space-x-2 mt-4">
          <Input
            placeholder={
              todos.length >= MAX_TODOS
                ? "Todo limit reached"
                : "Add a new todo"
            }
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            disabled={todos.length >= MAX_TODOS || isAddingTodo}
          />
          <Button
            onClick={addTodo}
            disabled={todos.length >= MAX_TODOS || isAddingTodo}
          >
            Add
          </Button>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Todo</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your todo"
                className="w-full"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={updateTodo}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { useOptimistic, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Task } from "@/lib/db/schema";
import { createTask, deleteTask, toggleTask } from "./actions";

type OptTask = Task & { pending?: boolean };

type TaskAction =
  | { type: "add"; task: Task }
  | { type: "toggle"; id: string }
  | { type: "delete"; id: string };

function reducer(state: OptTask[], action: TaskAction): OptTask[] {
  if (action.type === "add") return [...state, { ...action.task, pending: true }];
  if (action.type === "toggle")
    return state.map((t) =>
      t.id === action.id ? { ...t, completed: !t.completed, pending: true } : t,
    );
  if (action.type === "delete") return state.filter((t) => t.id !== action.id);
  return state;
}

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [optimisticTasks, dispatch] = useOptimistic(initialTasks as OptTask[], reducer);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    formRef.current?.reset();
    const tempTask: Task = {
      id: crypto.randomUUID(),
      userId: "",
      title,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    startTransition(async () => {
      dispatch({ type: "add", task: tempTask });
      await createTask(formData);
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      dispatch({ type: "toggle", id });
      await toggleTask(id);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      dispatch({ type: "delete", id });
      await deleteTask(id);
    });
  }

  const done = optimisticTasks.filter((t) => t.completed).length;

  return (
    <div className="mt-6 space-y-4">
      <form ref={formRef} action={handleAdd} className="flex gap-2">
        <Input name="title" placeholder="Add a task…" required className="flex-1" />
        <Button type="submit">Add</Button>
      </form>

      {optimisticTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet. Add one above.</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {done} / {optimisticTasks.length} done
          </p>
          <ul className="space-y-2">
            {optimisticTasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-opacity ${task.pending ? "opacity-60" : ""}`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggle(task.id)}
                  disabled={!!task.pending}
                />
                <span
                  className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(task.id)}
                  disabled={!!task.pending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

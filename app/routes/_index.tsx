import type { MetaFunction } from "react-router";
import { api } from "convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { useState, Suspense, type FormEvent } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Convex Tasks" },
    { name: "description", content: "Interactive task list with Convex" },
  ];
};

function TaskList() {
  const { data: tasks } = useSuspenseQuery(convexQuery(api.tasks.get, {}));
  const toggleTask = useMutation(api.tasks.toggle);

  if (!tasks || tasks.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No tasks yet. Add one above!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map(({ _id, text, isCompleted }) => (
        <label
          key={_id}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => toggleTask({ id: _id })}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <span
            className={`flex-1 ${
              isCompleted
                ? "line-through text-gray-500 dark:text-gray-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {text}
          </span>
        </label>
      ))}
    </div>
  );
}

export default function Index() {
  const addTask = useMutation(api.tasks.add);
  const [newTaskText, setNewTaskText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask({ text: newTaskText });
      setNewTaskText("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🚀 Task Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Built with React Router + Convex + React Query with Suspense!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Add Task
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                Loading tasks...
              </div>
            </div>
          }
        >
          <TaskList />
        </Suspense>
      </div>
    </div>
  );
}

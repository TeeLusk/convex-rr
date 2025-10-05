import type { MetaFunction } from "react-router";
import { api } from "convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, type FormEvent } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Convex Tasks" },
    { name: "description", content: "Interactive task list with Convex" },
  ];
};

export default function Index() {
  const tasks = useQuery(api.tasks.get);
  const toggleTask = useMutation(api.tasks.toggle);
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
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <h1>🚀 My Awesome Task Manager</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Built with React Router + Convex - Real-time updates across all clients!
      </p>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="What needs to be done?"
          style={{ padding: "0.5rem", width: "300px", marginRight: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          ➕ Add Task
        </button>
      </form>

      <div>
        {tasks === undefined ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Add one above!</p>
        ) : (
          tasks.map(({ _id, text, isCompleted }) => (
            <div key={_id} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleTask({ id: _id })}
                style={{ marginRight: "0.5rem" }}
              />
              <span style={{ textDecoration: isCompleted ? "line-through" : "none" }}>
                {text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

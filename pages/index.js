import { useState } from "react";

// In-memory store (reset on redeploy)
let tasks = [];

export default function Home() {
  const [role, setRole] = useState("client"); // toggle role: client/partner
  const [taskName, setTaskName] = useState("");
  const [tasksList, setTasksList] = useState(tasks);

  // Submit a new task (client only)
  async function createTask(e) {
    e.preventDefault();
    if (!taskName) return alert("Enter task name");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: taskName }),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasksList([...tasksList, newTask]);
      setTaskName("");
    }
  }

  // Partner accepts a task
  async function acceptTask(index) {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
    if (res.ok) {
      const updatedTasks = await res.json();
      setTasksList(updatedTasks);
    }
  }

  // Filter tasks by status for display
  const openTasks = tasksList.filter((t) => t.status === "open");
  const acceptedTasks = tasksList.filter((t) => t.status === "accepted");

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial" }}>
      <h1>Data Labeling MVP Prototype</h1>

      {/* Role toggle */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            checked={role === "client"}
            onChange={() => setRole("client")}
          />{" "}
          Client
        </label>{" "}
        <label>
          <input
            type="radio"
            checked={role === "partner"}
            onChange={() => setRole("partner")}
          />{" "}
          Partner
        </label>
      </div>

      {role === "client" && (
        <form onSubmit={createTask} style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <button type="submit" style={{ marginTop: "0.5rem" }}>
            Create Task
          </button>
        </form>
      )}

      {role === "client" && (
        <>
          <h2>Your Tasks</h2>
          <ul>
            {tasksList.map((task, i) => (
              <li key={i}>
                {task.name} — <b>{task.status}</b>
              </li>
            ))}
          </ul>
        </>
      )}

      {role === "partner" && (
        <>
          <h2>Open Tasks</h2>
          {openTasks.length === 0 && <p>No tasks available right now.</p>}
          <ul>
            {openTasks.map((task, i) => (
              <li key={i} style={{ marginBottom: "0.5rem" }}>
                {task.name}{" "}
                <button onClick={() => acceptTask(tasksList.indexOf(task))}>
                  Accept
                </button>
              </li>
            ))}
          </ul>

          <h2>Accepted Tasks</h2>
          <ul>
            {acceptedTasks.length === 0 && <p>No accepted tasks.</p>}
            {acceptedTasks.map((task, i) => (
              <li key={i}>{task.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// API handler for tasks
export async function api(req, res) {
  if (req.method === "POST") {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing task name" });

    const newTask = { name, status: "open" };
    tasks.push(newTask);
    return res.status(201).json(newTask);
  } else if (req.method === "PUT") {
    const { index } = req.body;
    if (index === undefined || !tasks[index]) {
      return res.status(400).json({ error: "Invalid task index" });
    }

    tasks[index].status = "accepted";
    return res.status(200).json(tasks);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
Add Next.js entry point


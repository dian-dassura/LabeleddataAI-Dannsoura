import { useState } from "react";

export default function Home() {
  const [role, setRole] = useState("client"); // toggle role: client/partner
  const [taskName, setTaskName] = useState("");
  const [tasksList, setTasksList] = useState([]);

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

  const openTasks = tasksList.filter((t) => t.status === "open");
  const acceptedTasks = tasksList.filter((t) => t.status === "accepted");

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial" }}>
      <h1>Data Labeling MVP Prototype</h1>

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

// pages/api/tasks.js

let tasks = []; // in-memory store (reset on redeploy)

export default function handler(req, res) {
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


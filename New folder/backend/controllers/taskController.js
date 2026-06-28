const Task = require("../models/Task");
const Board = require("../models/Board");

// GET /api/tasks?boardId=xxx — get tasks for a board
const getTasks = async (req, res) => {
  const { boardId } = req.query;

  if (!boardId) {
    return res.status(400).json({ message: "boardId is required" });
  }

  try {
    const tasks = await Task.find({ board: boardId, user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/tasks — create a task
const createTask = async (req, res) => {
  const { title, description, priority, dueDate, estimatedEffort, boardId } = req.body;

  if (!title || !boardId) {
    return res.status(400).json({ message: "Title and boardId are required" });
  }

  try {
    // Make sure the board belongs to the user
    const board = await Board.findOne({ _id: boardId, user: req.user._id });
    if (!board) return res.status(404).json({ message: "Board not found" });

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      estimatedEffort,
      board: boardId,
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/:id — update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, description, priority, dueDate, estimatedEffort, status } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;
    task.estimatedEffort = estimatedEffort ?? task.estimatedEffort;
    task.status = status ?? task.status;

    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id — delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/tasks/:id/status — cycle through statuses
const updateStatus = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const { status } = req.body;
    task.status = status;
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, updateStatus };

const Board = require("../models/Board");
const Task = require("../models/Task");

// GET /api/boards — get all boards for logged-in user
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/boards — create a new board
const createBoard = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const board = await Board.create({ title, description, user: req.user._id });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/boards/:id — update a board
const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) return res.status(404).json({ message: "Board not found" });
    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    board.title = req.body.title || board.title;
    board.description = req.body.description ?? board.description;

    const updated = await board.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/boards/:id — delete a board and its tasks
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) return res.status(404).json({ message: "Board not found" });
    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete all tasks belonging to this board
    await Task.deleteMany({ board: board._id });
    await board.deleteOne();

    res.json({ message: "Board deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getBoards, createBoard, updateBoard, deleteBoard };

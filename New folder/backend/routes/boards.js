const express = require("express");
const router = express.Router();
const { getBoards, createBoard, updateBoard, deleteBoard } = require("../controllers/boardController");
const { protect } = require("../middleware/auth");

router.use(protect); // All board routes require auth

router.get("/", getBoards);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

module.exports = router;

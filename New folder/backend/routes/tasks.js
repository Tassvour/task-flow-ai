const express = require("express");
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, updateStatus } = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

router.use(protect); // All task routes require auth

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/status", updateStatus);

module.exports = router;

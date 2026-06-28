const express = require("express");
const router = express.Router();
const { suggestEstimate } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

router.post("/suggest-estimate", protect, suggestEstimate);

module.exports = router;

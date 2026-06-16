const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
    generateAnalysis,
    getAnalysisHistory,
    analyzeResume,
    updateAnalysisProgress,
    rewriteBulletPoint
} = require("../controllers/analysisController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateAnalysis);
router.get("/history", protect, getAnalysisHistory);
router.post("/resume", protect, upload.single("resume"), analyzeResume);
router.put("/:id/progress", protect, updateAnalysisProgress);
router.post("/rewrite-bullet", protect, rewriteBulletPoint);

module.exports = router;
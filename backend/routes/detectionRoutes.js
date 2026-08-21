const express = require("express");

const {
  createDetectionResult,
  getDetectionByComplaint
} = require("../controllers/detectionController");

const protect =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");

const router =
  express.Router();


// =====================================================
// CREATE AI DETECTION RESULT
// =====================================================

router.post(
  "/",
  protect,
  adminOnly,
  createDetectionResult
);


// =====================================================
// GET DETECTION FOR COMPLAINT
// =====================================================

router.get(
  "/complaint/:complaintId",
  protect,
  getDetectionByComplaint
);


module.exports = router;
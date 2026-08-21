const express = require("express");

const {
  getStatistics
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

router.get(
  "/statistics",
  protect,
  adminOnly,
  getStatistics
);


module.exports = router;
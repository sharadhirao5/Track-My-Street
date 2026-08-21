const express = require("express");

const {
  getNotifications,
  markAsRead,
  markAllAsRead
} =
  require("../controllers/notificationController");

const protect =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// =====================================================
// GET USER NOTIFICATIONS
// =====================================================

router.get(
  "/",
  protect,
  getNotifications
);


// =====================================================
// MARK ALL AS READ
// =====================================================

router.put(
  "/read-all",
  protect,
  markAllAsRead
);


// =====================================================
// MARK ONE AS READ
// =====================================================

router.put(
  "/:id/read",
  protect,
  markAsRead
);


module.exports = router;
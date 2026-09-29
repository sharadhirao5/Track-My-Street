const express = require("express");

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  getAdminComplaints,
  updateComplaintStatus,
  getComplaintHistory
} = require("../controllers/complaintController");

const protect =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const {
  validateComplaint
} =
  require("../middleware/validationMiddleware");

const {
  validateObjectId
} =
  require("../middleware/idValidationMiddleware");


const router =
  express.Router();


// =====================================================
// CREATE COMPLAINT
// =====================================================

router.post(
  "/",
  protect,
  upload.single("image"),
  validateComplaint,
  createComplaint
);


// =====================================================
// GET COMPLAINTS
// =====================================================

router.get(
  "/",
  protect,
  getComplaints
);


// =====================================================
// ADMIN - FILTER / SEARCH
// =====================================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminComplaints
);


// =====================================================
// GET COMPLAINT HISTORY
// =====================================================

router.get(
  "/:id/history",
  protect,
  validateObjectId("id"),
  getComplaintHistory
);


// =====================================================
// GET SINGLE COMPLAINT
// =====================================================

router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getComplaintById
);


// =====================================================
// ADMIN - UPDATE STATUS
// =====================================================

router.put(
  "/:id/status",
  protect,
  adminOnly,
  validateObjectId("id"),
  updateComplaintStatus
);


module.exports =
  router;
const express = require("express");

const {
  createAuthority,
  getAuthorities,
  getAuthorityById,
  assignComplaint,
  getAssignedComplaints
} = require("../controllers/authorityController");

const protect =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");

const {
  validateObjectId
} =
  require("../middleware/idValidationMiddleware");


const router =
  express.Router();


// =====================================================
// CREATE AUTHORITY PROFILE
// ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  adminOnly,
  createAuthority
);


// =====================================================
// GET ALL AUTHORITIES
// ADMIN ONLY
// =====================================================

router.get(
  "/",
  protect,
  adminOnly,
  getAuthorities
);


// =====================================================
// GET CURRENT AUTHORITY'S ASSIGNED COMPLAINTS
// =====================================================

router.get(
  "/my-complaints",
  protect,
  getAssignedComplaints
);


// =====================================================
// GET AUTHORITY BY ID
// ADMIN ONLY
// =====================================================

router.get(
  "/:id",
  protect,
  adminOnly,
  validateObjectId("id"),
  getAuthorityById
);


// =====================================================
// ASSIGN COMPLAINT TO AUTHORITY
// ADMIN ONLY
// =====================================================

router.put(
  "/assign",
  protect,
  adminOnly,
  assignComplaint
);


module.exports =
  router;
const express = require("express");

const {
  getMapComplaints
} = require("../controllers/mapController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET COMPLAINTS FOR MAP
// =====================================================

router.get(
  "/complaints",
  protect,
  getMapComplaints
);


module.exports = router;
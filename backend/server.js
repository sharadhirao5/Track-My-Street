const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

// =====================================================
// ERROR MIDDLEWARE
// =====================================================

const {
  notFound,
  errorHandler
} = require("./middleware/errorMiddleware");

// =====================================================
// ROUTES
// =====================================================

const authRoutes =
  require("./routes/authRoutes");

const complaintRoutes =
  require("./routes/complaintRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");

const mapRoutes =
  require("./routes/mapRoutes");

const detectionRoutes =
  require("./routes/detectionRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const authorityRoutes =
  require("./routes/authorityRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "http://localhost:5500",
  "http://127.0.0.1:5500",

  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(
  cors({
    origin: (origin, callback) => {

      // Allow requests without an origin.
      // Useful for Postman and server-to-server requests.

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "CORS policy: Origin not allowed."
        )
      );
    },

    credentials: true
  })
);

// =====================================================
// BODY PARSING
// =====================================================

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

// =====================================================
// STATIC UPLOADED IMAGES
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// =====================================================
// ROOT / HEALTH CHECK
// =====================================================

app.get(
  "/",
  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "Track My Street Backend API is running",

      status:
        "healthy"

    });
  }
);

// =====================================================
// API HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "Backend is healthy",

      timestamp:
        new Date().toISOString()

    });
  }
);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// COMPLAINT ROUTES
// =====================================================

app.use(
  "/api/complaints",
  complaintRoutes
);

// =====================================================
// DASHBOARD ROUTES
// =====================================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// =====================================================
// MAP ROUTES
// =====================================================

app.use(
  "/api/map",
  mapRoutes
);

// =====================================================
// AI DETECTION ROUTES
// =====================================================

app.use(
  "/api/detection",
  detectionRoutes
);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// AUTHORITY ROUTES
// =====================================================

app.use(
  "/api/authority",
  authorityRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  notFound
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  errorHandler
);

// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

connectDB()

  .then(() => {

    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on port ${PORT}`
        );

      }
    );

  })

  .catch((error) => {

    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);

  });
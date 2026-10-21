// =====================================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// TRACK MY STREET
// =====================================================

const mongoose = require("mongoose");


// =====================================================
// 404 - ROUTE NOT FOUND
// =====================================================

const notFound = (req, res, next) => {

  const error =
    new Error(
      `Route not found: ${req.originalUrl}`
    );

  error.statusCode = 404;

  next(error);

};


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

const errorHandler = (
  err,
  req,
  res,
  next
) => {

  console.error(
    "ERROR:",
    err
  );


  let statusCode =
    err.statusCode || 500;


  let message =
    err.message ||
    "Internal Server Error";


  // ---------------------------------------------------
  // MONGOOSE INVALID OBJECT ID
  // ---------------------------------------------------

  if (
    err instanceof mongoose.Error.CastError
  ) {

    statusCode = 400;

    message =
      "Invalid resource ID.";

  }


  // ---------------------------------------------------
  // MONGOOSE VALIDATION ERROR
  // ---------------------------------------------------

  if (
    err instanceof mongoose.Error.ValidationError
  ) {

    statusCode = 400;

    const errors =
      Object.values(
        err.errors
      ).map(
        (item) => item.message
      );


    return res.status(statusCode).json({

      success: false,

      message:
        "Validation failed.",

      errors

    });

  }


  // ---------------------------------------------------
  // MONGODB DUPLICATE KEY
  // ---------------------------------------------------

  if (
    err.code === 11000
  ) {

    statusCode = 400;

    const duplicateFields =
      Object.keys(
        err.keyPattern || {}
      );


    message =
      `Duplicate value for: ${
        duplicateFields.join(", ")
      }`;

  }


  // ---------------------------------------------------
  // MULTER FILE SIZE ERROR
  // ---------------------------------------------------

  if (
    err.code === "LIMIT_FILE_SIZE"
  ) {

    statusCode = 400;

    message =
      "Image size cannot exceed 5 MB.";

  }


  // ---------------------------------------------------
  // MULTER FILE COUNT ERROR
  // ---------------------------------------------------

  if (
    err.code === "LIMIT_FILE_COUNT"
  ) {

    statusCode = 400;

    message =
      "Only one image can be uploaded.";

  }


  // ---------------------------------------------------
  // MULTER UNEXPECTED FILE
  // ---------------------------------------------------

  if (
    err.code === "LIMIT_UNEXPECTED_FILE"
  ) {

    statusCode = 400;

    message =
      "Unexpected file uploaded.";

  }


  // ---------------------------------------------------
  // RESPONSE
  // ---------------------------------------------------

  return res.status(statusCode).json({

    success: false,

    message,

    ...(process.env.NODE_ENV ===
      "development" && {

        error:
          err.name || "Error"

      })

  });

};


module.exports = {

  notFound,

  errorHandler

};
// =====================================================
// VALIDATION MIDDLEWARE
// TRACK MY STREET
// =====================================================


// =====================================================
// VALIDATE COMPLAINT DATA
// =====================================================

const validateComplaint = (req, res, next) => {

  const {
    title,
    description,
    latitude,
    longitude,
    damageType,
    severity
  } = req.body;


  // ---------------------------------------------------
  // TITLE
  // ---------------------------------------------------

  if (
    !title ||
    typeof title !== "string" ||
    title.trim().length < 3
  ) {

    return res.status(400).json({

      message:
        "Title must contain at least 3 characters."

    });

  }


  if (title.trim().length > 150) {

    return res.status(400).json({

      message:
        "Title cannot exceed 150 characters."

    });

  }


  // ---------------------------------------------------
  // DESCRIPTION
  // ---------------------------------------------------

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 5
  ) {

    return res.status(400).json({

      message:
        "Description must contain at least 5 characters."

    });

  }


  if (description.trim().length > 2000) {

    return res.status(400).json({

      message:
        "Description cannot exceed 2000 characters."

    });

  }


  // ---------------------------------------------------
  // LATITUDE
  // ---------------------------------------------------

  const latitudeNumber =
    Number(latitude);


  if (
    !Number.isFinite(latitudeNumber) ||
    latitudeNumber < -90 ||
    latitudeNumber > 90
  ) {

    return res.status(400).json({

      message:
        "Latitude must be a valid number between -90 and 90."

    });

  }


  // ---------------------------------------------------
  // LONGITUDE
  // ---------------------------------------------------

  const longitudeNumber =
    Number(longitude);


  if (
    !Number.isFinite(longitudeNumber) ||
    longitudeNumber < -180 ||
    longitudeNumber > 180
  ) {

    return res.status(400).json({

      message:
        "Longitude must be a valid number between -180 and 180."

    });

  }


  // ---------------------------------------------------
  // DAMAGE TYPE
  // ---------------------------------------------------

  const allowedDamageTypes = [

    "pothole",

    "crack",

    "waterlogging",

    "broken_marking",

    "road_erosion",

    "surface_damage",

    "other"

  ];


  const normalizedDamageType =
    damageType
      ? damageType
          .toString()
          .trim()
          .toLowerCase()
      : "pothole";


  if (
    !allowedDamageTypes.includes(
      normalizedDamageType
    )
  ) {

    return res.status(400).json({

      message:
        "Invalid damage type.",

      allowedDamageTypes

    });

  }


  // ---------------------------------------------------
  // SEVERITY
  // ---------------------------------------------------

  const allowedSeverities = [

    "Low",

    "Medium",

    "High",

    "Critical"

  ];


  if (
    severity &&
    !allowedSeverities.includes(
      severity
    )
  ) {

    return res.status(400).json({

      message:
        "Invalid severity.",

      allowedSeverities

    });

  }


  // ---------------------------------------------------
  // NORMALIZE VALUES
  // ---------------------------------------------------

  req.body.title =
    title.trim();

  req.body.description =
    description.trim();

  req.body.latitude =
    latitudeNumber;

  req.body.longitude =
    longitudeNumber;

  req.body.damageType =
    normalizedDamageType;

  req.body.severity =
    severity || "Medium";


  // ---------------------------------------------------
  // CONTINUE
  // ---------------------------------------------------

  next();

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  validateComplaint

};
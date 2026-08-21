const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Save decoded user info
      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No Token Provided",
    });
  }
};

module.exports = protect;
const jwt = require("jsonwebtoken");

/**
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches decoded payload to req.user = { id, role: 'staff' | 'student' }
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Restricts route to staff only
 */
const staffOnly = (req, res, next) => {
  if (req.user?.role !== "staff") {
    return res.status(403).json({ error: "Staff access required" });
  }
  next();
};

/**
 * Restricts route to student only
 */
const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ error: "Student access required" });
  }
  next();
};

module.exports = { authenticate, staffOnly, studentOnly };

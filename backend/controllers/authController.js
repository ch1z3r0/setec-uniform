const pool    = require("../config/db");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });

// ── POST /api/auth/staff/login ────────────────────────────────
// Accepts: email OR username + password
exports.staffLogin = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ error: "identifier and password are required" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM staffs
       WHERE (email = ? OR username = ?) AND is_active = 1`,
      [identifier, identifier]
    );

    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const staff = rows[0];
    const valid = await bcrypt.compare(password, staff.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(staff.id, "staff");
    res.json({
      token,
      user: {
        id:           staff.id,
        username:     staff.username,
        display_name: staff.display_name,
        email:        staff.email,
        role:         "staff",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ── POST /api/auth/student/login ──────────────────────────────
// Accepts: email OR student_id + password
exports.studentLogin = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ error: "identifier and password are required" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM students
       WHERE (email = ? OR student_id = ?) AND is_active = 1`,
      [identifier, identifier]
    );

    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const student = rows[0];
    const valid = await bcrypt.compare(password, student.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(student.id, "student");
    res.json({
      token,
      user: {
        id:         student.id,
        student_id: student.student_id,
        name_en:    student.name_en,
        name_kh:    student.name_kh,
        email:      student.email,
        role:       "student",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
// Returns current logged-in user info from token
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === "staff") {
      const [rows] = await pool.query(
        "SELECT id, username, display_name, email, phone, is_active FROM staffs WHERE id = ?",
        [id]
      );
      if (!rows.length) return res.status(404).json({ error: "User not found" });
      return res.json({ ...rows[0], role: "staff" });
    } else {
      const [rows] = await pool.query(
        "SELECT id, student_id, name_en, name_kh, email, phone, group, promotion, is_active FROM students WHERE id = ?",
        [id]
      );
      if (!rows.length) return res.status(404).json({ error: "User not found" });
      return res.json({ ...rows[0], role: "student" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

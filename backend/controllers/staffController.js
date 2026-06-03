const pool   = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/staffs
exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, display_name, email, phone, is_active, created_at FROM staffs ORDER BY display_name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
};

// GET /api/staffs/active  — lightweight list for dropdowns
exports.getActive = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, display_name, username FROM staffs WHERE is_active = 1 ORDER BY display_name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active staff" });
  }
};

// GET /api/staffs/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, display_name, email, phone, is_active, created_at FROM staffs WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Staff not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
};

// POST /api/staffs
exports.create = async (req, res) => {
  const { username, display_name, email, password, phone, is_active } = req.body;
  if (!username || !display_name || !email || !password)
    return res.status(400).json({
      error: "username, display_name, email and password are required",
    });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO staffs (username, display_name, email, password, phone, is_active) VALUES (?,?,?,?,?,?)",
      [username, display_name, email, hashed, phone || null, is_active ?? 1]
    );
    res.status(201).json({ id: result.insertId, message: "Staff created" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Username or email already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to create staff" });
  }
};

// PUT /api/staffs/:id
exports.update = async (req, res) => {
  const { username, display_name, email, password, phone, is_active } = req.body;
  try {
    let query, params;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query  = "UPDATE staffs SET username=?, display_name=?, email=?, password=?, phone=?, is_active=? WHERE id=?";
      params = [username, display_name, email, hashed, phone || null, is_active ?? 1, req.params.id];
    } else {
      query  = "UPDATE staffs SET username=?, display_name=?, email=?, phone=?, is_active=? WHERE id=?";
      params = [username, display_name, email, phone || null, is_active ?? 1, req.params.id];
    }
    const [result] = await pool.query(query, params);
    if (!result.affectedRows) return res.status(404).json({ error: "Staff not found" });
    res.json({ message: "Staff updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Username or email already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to update staff" });
  }
};

// DELETE /api/staffs/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM staffs WHERE id=?", [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Staff not found" });
    res.json({ message: "Staff deleted" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Cannot delete: staff has borrow records" });
    console.error(err);
    res.status(500).json({ error: "Failed to delete staff" });
  }
};

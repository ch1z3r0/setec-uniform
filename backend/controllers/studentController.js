const pool   = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/students
exports.getAll = async (req, res) => {
  try {
    const { search, group, promotion, is_active } = req.query;
    let query = `
      SELECT s.id, s.student_id, s.name_en, s.name_kh, s.phone,
             s.date_of_birth, s.group, s.promotion, s.is_active, s.email,
             s.created_at,
             b.status        AS borrow_status,
             b.borrowed_date,
             b.returned_date,
             i.name          AS item_name
      FROM students s
      LEFT JOIN borrows b ON b.student_id = s.id
        AND b.status IN ('borrowed','overdue')
      LEFT JOIN items i ON i.id = b.item_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += " AND (s.name_en LIKE ? OR s.name_kh LIKE ? OR s.student_id LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (group) { query += " AND s.group = ?"; params.push(group); }
    if (promotion) { query += " AND s.promotion = ?"; params.push(promotion); }
    if (is_active !== undefined) { query += " AND s.is_active = ?"; params.push(is_active); }

    query += " ORDER BY s.name_en ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// GET /api/students/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_id, s.name_en, s.name_kh, s.phone,
              s.date_of_birth, s.group, s.promotion, s.is_active,
              s.email, s.created_at
       FROM students s WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

// GET /api/students/:id/borrows  — borrow history for one student
exports.getBorrowHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, i.name AS item_name, st.display_name AS staff_name
       FROM borrows b
       JOIN items  i  ON i.id  = b.item_id
       JOIN staffs st ON st.id = b.staff_id
       WHERE b.student_id = ?
       ORDER BY b.borrowed_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch borrow history" });
  }
};

// POST /api/students
exports.create = async (req, res) => {
  const { student_id, name_en, name_kh, phone, date_of_birth,
          group, promotion, is_active, email, password } = req.body;

  if (!student_id || !name_en || !name_kh || !email || !password)
    return res.status(400).json({
      error: "student_id, name_en, name_kh, email and password are required",
    });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO students
         (student_id, name_en, name_kh, phone, date_of_birth,
          \`group\`, promotion, is_active, email, password)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [student_id, name_en, name_kh, phone || null,
       date_of_birth || null, group || null, promotion || null,
       is_active ?? 1, email, hashed]
    );
    res.status(201).json({ id: result.insertId, message: "Student created" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Student ID or email already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
};

// PUT /api/students/:id
exports.update = async (req, res) => {
  const { student_id, name_en, name_kh, phone, date_of_birth,
          group, promotion, is_active, email, password } = req.body;
  try {
    let query, params;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query = `UPDATE students SET student_id=?, name_en=?, name_kh=?, phone=?,
               date_of_birth=?, \`group\`=?, promotion=?, is_active=?, email=?, password=?
               WHERE id=?`;
      params = [student_id, name_en, name_kh, phone || null,
                date_of_birth || null, group || null, promotion || null,
                is_active ?? 1, email, hashed, req.params.id];
    } else {
      query = `UPDATE students SET student_id=?, name_en=?, name_kh=?, phone=?,
               date_of_birth=?, \`group\`=?, promotion=?, is_active=?, email=?
               WHERE id=?`;
      params = [student_id, name_en, name_kh, phone || null,
                date_of_birth || null, group || null, promotion || null,
                is_active ?? 1, email, req.params.id];
    }
    const [result] = await pool.query(query, params);
    if (!result.affectedRows) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Student ID or email already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// DELETE /api/students/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM students WHERE id=?", [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Cannot delete: student has borrow records" });
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

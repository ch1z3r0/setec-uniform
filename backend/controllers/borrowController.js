const pool = require("../config/db");

// GET /api/borrows
exports.getAll = async (req, res) => {
  try {
    const { status, student_id, staff_id, search } = req.query;
    let query = `
      SELECT b.*,
             s.student_id   AS student_code,
             s.name_en      AS student_name_en,
             s.name_kh      AS student_name_kh,
             s.group        AS student_group,
             s.promotion,
             st.display_name AS staff_name,
             i.name          AS item_name
      FROM borrows b
      JOIN students s  ON s.id  = b.student_id
      JOIN staffs   st ON st.id = b.staff_id
      JOIN items    i  ON i.id  = b.item_id
      WHERE 1=1
    `;
    const params = [];

    if (status)     { query += " AND b.status = ?";     params.push(status); }
    if (student_id) { query += " AND b.student_id = ?"; params.push(student_id); }
    if (staff_id)   { query += " AND b.staff_id = ?";   params.push(staff_id); }
    if (search) {
      query += " AND (s.name_en LIKE ? OR s.name_kh LIKE ? OR s.student_id LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY b.borrowed_date DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch borrows" });
  }
};

// GET /api/borrows/stats  — dashboard numbers
exports.getStats = async (_req, res) => {
  try {
    const [[counts]] = await pool.query(`
      SELECT
        COUNT(*)                          AS total_borrows,
        SUM(status = 'borrowed')          AS total_borrowed,
        SUM(status = 'returned')          AS total_returned,
        SUM(status = 'overdue')           AS total_overdue,
        SUM(status IN ('borrowed','overdue')) AS total_active
      FROM borrows
    `);
    const [[students]] = await pool.query(
      "SELECT COUNT(*) AS total_students FROM students WHERE is_active = 1"
    );
    const [[items]] = await pool.query(
      "SELECT SUM(available_quantity) AS total_available FROM items"
    );
    res.json({ ...counts, ...students, ...items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// GET /api/borrows/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*,
              s.student_id   AS student_code,
              s.name_en      AS student_name_en,
              s.name_kh      AS student_name_kh,
              st.display_name AS staff_name,
              i.name          AS item_name
       FROM borrows b
       JOIN students s  ON s.id  = b.student_id
       JOIN staffs   st ON st.id = b.staff_id
       JOIN items    i  ON i.id  = b.item_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Borrow record not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch borrow record" });
  }
};

// POST /api/borrows  — issue a uniform
exports.create = async (req, res) => {
  const { student_id, staff_id, item_id, notes } = req.body;
  if (!student_id || !staff_id || !item_id)
    return res.status(400).json({ error: "student_id, staff_id and item_id are required" });

  try {
    // Check item availability
    const [[item]] = await pool.query(
      "SELECT available_quantity FROM items WHERE id = ?", [item_id]
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.available_quantity < 1)
      return res.status(409).json({ error: "Item is out of stock" });

    const [result] = await pool.query(
      `INSERT INTO borrows (student_id, staff_id, item_id, status, notes)
       VALUES (?, ?, ?, 'borrowed', ?)`,
      [student_id, staff_id, item_id, notes || null]
    );
    res.status(201).json({ id: result.insertId, message: "Borrow record created" });
  } catch (err) {
    // Trigger fires here if student already has active borrow
    if (err.sqlState === "45000")
      return res.status(409).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Failed to create borrow record" });
  }
};

// PATCH /api/borrows/:id/return  — process a return
exports.processReturn = async (req, res) => {
  const { notes } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE borrows
       SET status = 'returned',
           returned_date = NOW(),
           notes = COALESCE(?, notes)
       WHERE id = ? AND status != 'returned'`,
      [notes || null, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(400).json({ error: "Record not found or already returned" });
    res.json({ message: "Uniform returned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process return" });
  }
};

// PATCH /api/borrows/:id/overdue  — mark as overdue
exports.markOverdue = async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE borrows SET status = 'overdue' WHERE id = ? AND status = 'borrowed'",
      [req.params.id]
    );
    if (!result.affectedRows)
      return res.status(400).json({ error: "Record not found or not in borrowed state" });
    res.json({ message: "Marked as overdue" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark overdue" });
  }
};

// DELETE /api/borrows/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM borrows WHERE id=?", [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Borrow record deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete borrow record" });
  }
};

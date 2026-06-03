const pool = require("../config/db");

// GET /api/items
exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM items ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// GET /api/items/available  — only items with stock > 0
exports.getAvailable = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, available_quantity FROM items WHERE available_quantity > 0 ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available items" });
  }
};

// GET /api/items/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM items WHERE id = ?", [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// POST /api/items
exports.create = async (req, res) => {
  const { name, quantity } = req.body;
  if (!name || quantity === undefined)
    return res.status(400).json({ error: "name and quantity are required" });

  try {
    const [result] = await pool.query(
      "INSERT INTO items (name, quantity, available_quantity) VALUES (?,?,?)",
      [name, quantity, quantity]   // available starts equal to total
    );
    res.status(201).json({ id: result.insertId, message: "Item created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

// PUT /api/items/:id
exports.update = async (req, res) => {
  const { name, quantity, available_quantity } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE items SET name=?, quantity=?, available_quantity=? WHERE id=?",
      [name, quantity, available_quantity, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
};

// DELETE /api/items/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM items WHERE id=?", [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Cannot delete: item has borrow records" });
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// Railway auto inject PORT
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ===== MySQL Railway Connection =====
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test DB connection
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL Railway");
    conn.release();
  }
});

// ===== ROUTES =====

// GET all books
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// POST new book
app.post("/books", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name & price required" });
  }

  db.query(
    "INSERT INTO books (name, price) VALUES (?, ?)",
    [name, price],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Insert failed" });
      }

      res.status(201).json({
        id: result.insertId,
        name,
        price,
      });
    }
  );
});

// PUT update book
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  db.query(
    "UPDATE books SET name=?, price=? WHERE id=?",
    [name, price, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Update failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json({ id: Number(id), name, price });
    }
  );
});

// DELETE book
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM books WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Delete failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Deleted" });
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});

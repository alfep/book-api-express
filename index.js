const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config(); // <-- ini penting

const app = express();

// PORT dari env, default 3000
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi MySQL pakai env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// === ROUTES ===
// GET all books
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST add new book
app.post("/books", (req, res) => {
  const { name, price } = req.body;
  db.query(
    "INSERT INTO books (name, price) VALUES (?, ?)",
    [name, parseFloat(price)],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ id: results.insertId, name, price: parseFloat(price) });
    }
  );
});

// PUT update book
app.put("/books/:id", (req, res) => {
  const id = req.params.id;
  const { name, price } = req.body;

  db.query(
    "UPDATE books SET name=?, price=? WHERE id=?",
    [name, parseFloat(price), id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "Book not found" });
      res.json({ id: parseInt(id), name, price: parseFloat(price) });
    }
  );
});

// DELETE book
app.delete("/books/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM books WHERE id=?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Deleted successfully" });
  });
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

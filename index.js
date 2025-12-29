const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");
});

app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.post("/books", (req, res) => {
  const { name, price } = req.body;
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
      res.json({ id, name, price });
    }
  );
});

app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM books WHERE id=?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Delete failed" });
    }
    res.json({ message: "Deleted" });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

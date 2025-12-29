const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");
});

app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/books", (req, res) => {
  const { name, price } = req.body;
  db.query(
    "INSERT INTO books (name, price) VALUES (?, ?)",
    [name, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, price });
    }
  );
});

app.put("/books/:id", (req, res) => {
  const { name, price } = req.body;
  const { id } = req.params;

  db.query(
    "UPDATE books SET name=?, price=? WHERE id=?",
    [name, price, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, price });
    }
  );
});

app.delete("/books/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM books WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

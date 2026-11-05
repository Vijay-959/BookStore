const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Replace YOUR_MYSQL_PASSWORD with your actual MySQL password.
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "nikhil0624",
    database: "bookstore"
});

db.connect((err) => {
    if (err) { console.error("MySQL connection failed:", err.message); return; }
    console.log("Connected to MySQL - Bookstore database");
});

app.get("/books", (req, res) => {
    db.query("SELECT * FROM books ORDER BY book_id", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.get("/books/:id", (req, res) => {
    db.query("SELECT * FROM books WHERE book_id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ error: "Book not found" });
        res.json(rows[0]);
    });
});
app.post("/books", (req, res) => {
    const { book_id, title, author, category, price, stock } = req.body;
    db.query("INSERT INTO books (book_id, title, author, category, price, stock) VALUES (?, ?, ?, ?, ?, ?)",
        [book_id, title, author, category, price, stock], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Book added successfully", book_id });
        });
});
app.put("/books/:id", (req, res) => {
    const { title, author, category, price, stock } = req.body;
    db.query("UPDATE books SET title = ?, author = ?, category = ?, price = ?, stock = ? WHERE book_id = ?",
        [title, author, category, price, stock, req.params.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!result.affectedRows) return res.status(404).json({ error: "Book not found" });
            res.json({ message: "Book updated successfully" });
        });
});
app.delete("/books/:id", (req, res) => {
    db.query("DELETE FROM books WHERE book_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.affectedRows) return res.status(404).json({ error: "Book not found" });
        res.json({ message: "Book deleted successfully" });
    });
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

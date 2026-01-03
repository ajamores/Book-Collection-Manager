/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// GET all books with filtering
app.get('/books', (req, res) => {

// URL was: http://localhost:4000/books?genre=fiction
//Then: req.query = { genre: 'fiction' }
  const { genre, year, minRating, search } = req.query;
  let query = 'SELECT * FROM books';
  const params = [];
  const conditions = [];

  // Build query based on filters
  if (genre && genre !== 'all') {
    conditions.push('genre = ?'); // Add genre condition
    params.push(genre); // add genre to parameters which 
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single book by ID
app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(row);
  });
});

// POST create new book 
app.post('/books', (req, res) => {
  const { title, author, genre, year, pages, description } = req.body;
  console.log("CREATING NEW BOOK WITH TITLE: ", title, "AUTHOR: ", author, "GENRE: ", genre, "YEAR: ", year, "PAGES: ", pages, "DESCRIPTION: ", description);
  // Basic validation
  if (!title || !author || !genre) {
    return res.status(400).json({ error: 'Title, author, and genre are required' });
  }

  const rating = 0; // Default rating for new books
  
  db.run(
    `INSERT INTO books (title, author, genre, year, rating, pages, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, author, genre, year, rating, pages, description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id: this.lastID, 
        title, 
        author, 
        genre, 
        year, 
        rating, 
        pages, 
        description 
      });
    }
  );
});

// PUT update book rating 
app.put('/books/:id/rating', (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  console.log("UPDATING BOOK RATING FOR BOOK ID: ", id + " WITH RATING: ", rating);
  if (rating === undefined || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  }

  db.run(
    'UPDATE books SET rating = ? WHERE id = ?',
    [rating, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }
      res.json({ id, rating, message: 'Rating updated successfully' });
    }
  );
});

// 5. DELETE a book
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  console.log("DELETING BOOK WITH ID: ", id);
  db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json({ message: 'Book deleted successfully' });
  });
});

// Start server, list available endpoints, used for testing
app.listen(PORT, () => {
    console.log("SERVER RUNNING")
    console.log(`Book API running on http://localhost:${PORT}`);
    console.log(`   Endpoints:`);
    console.log(`   GET    /books          - Get all books (with filters)`);
    console.log(`   GET    /books/:id      - Get single book`);
    console.log(`   POST   /books          - Create new book`);
    console.log(`   PUT    /books/:id/rating - Update book rating`);
    console.log(`   DELETE /books/:id      - Delete book`);
});
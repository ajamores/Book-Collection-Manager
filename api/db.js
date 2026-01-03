/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Initialize database with books table
db.serialize(() => {
  // Create books table
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      year INTEGER,
      rating REAL DEFAULT 0,
      pages INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data if table is empty
  db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
    if (row && row.count === 0) {
      console.log("Inserting sample books...");
      const books = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          genre: "fiction",
          year: 1925,
          rating: 4,
          pages: 218,
          description: "A classic novel of the Jazz Age"
        },
        {
          title: "Noli Me Tangere",
          author: "Jose Rizal",
          genre: "fiction",
          year: 1887,
          rating: 5,
          pages: 387,
          description: "Noli Me Tángere is a novel by Filipino writer and activist José Rizal and was published during the Spanish colonial period of the Philippines. It explores inequities in law and practice in terms of the treatment by the ruling government and the Spanish Catholic friars of the resident peoples in the late 19th century."
        },
        {
          title: "1984",
          author: "George Orwell",
          genre: "sci-fi",
          year: 1949,
          rating: 4,
          pages: 328,
          description: "A dystopian social science fiction novel"
        },
        {
          title: "The Count of Monte Cristo",
          author: "Alexandre Dumas",
          genre: "fiction",
          year: 1844,
          rating: 5,
          pages: 1000,
          description: "A young man, falsely imprisoned by his jealous friend, escapes and uses a hidden treasure to exact his revenge."
        },
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          genre: "fantasy",
          year: 1937,
          rating: 4,
          pages: 310,
          description: "A fantasy novel about Bilbo Baggins"
        },
        {
          title: "The Martian",
          author: "Andy Weir",
          genre: "sci-fi",
          year: 2011,
          rating: 3,
          pages: 369,
          description: "A science fiction novel about an astronaut stranded on Mars"
        },
        {
          title: "A Brief History of Time",
          author: "Stephen Hawking",
          genre: "non-fiction",
          year: 1988,
          rating: 4,
          pages: 256,
          description: "A popular-science book on cosmology"
        },
        {
          title: "The Da Vinci Code",
          author: "Dan Brown",
          genre: "mystery",
          year: 2003,
          rating: 2,
          pages: 454,
          description: "A mystery thriller novel"
        }
      ];

      const insertStatement = db.prepare(`
        INSERT INTO books (title, author, genre, year, rating, pages, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      books.forEach(book => {
        insertStatement.run(
          book.title,
          book.author,
          book.genre,
          book.year,
          book.rating,
          book.pages,
          book.description
        );
      });

      insertStatement.finalize();
      console.log(`Inserted ${books.length} sample books`);
    } else {
      console.log(`Database already has ${row.count} books`);
    }
  });
});

module.exports = db;
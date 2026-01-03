/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/
import { BookForm } from '../components/BookForm';
import { BookItem } from '../components/BookItem';
import styles from './styles.module.css';
import { Book } from './types';

/**
 * Home page component displays client side components and fetches books from the API.
 * Form to add new book available and total collection of books displayed
 * @returns - Home page
 */
export default async function HomePage() {
  // Fetch all books from API
  let books: Book[] = [];
  
  //response from API
  try {
    const response = await fetch('http://localhost:4000/books', {
      cache: 'no-store' // Get fresh data on every request
    });
    
    if (response.ok) {
      books = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch books:', error);
  }

  //get all genres
  const genres = ['fiction', 'sci-fi', 'fantasy', 'mystery', 'non-fiction'];

  return (
    <>
      <div className={styles.homeHeader}>
        <h1 className={styles.homeTitle}>Book Collection</h1>
        <p className={styles.homeSubtitle}>
          Manage your personal library. Add new books, remove them, rate them, and filter by genre.
        </p>
      </div>
      {/* Form to add new book */}
      <div className={styles.form_container}>
        <h2>Add New Book</h2>
        {/* Client component - Form to add new book */}
        <BookForm />
      </div>
      
      {/* Display all books */}
      <div className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <h2>All Books ({books.length})</h2>
        </div>
        
        {/* If no books found, display empty state */}
        {books.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateMessage}>
              No books in your collection yet.
            </p>
            <p className={styles.emptyStateSubtext}>
              Use the form above to add your first book!
            </p>
          </div>
        ) : (
          <div className={styles.booksList}>
            {books.map((book) => (
              <BookItem key={book.id} book={book} showFullInfo={true} />
            ))}
          </div>
        )}
      </div>
      
    </>
  );
}
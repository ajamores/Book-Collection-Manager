/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/
import { Book } from '../types';
import styles from './search.module.css';

/**
 * Provides a search page that displays a list of genres and allows users to filter books by genre.
 * @returns - The SearchPage component
 */
export default async function SearchPage() {
  // Fetch all books for the search page
  let books: Book[] = [];
  
  try {
    const response = await fetch('http://localhost:4000/books', {
      cache: 'no-store'
    });
    
    if (response.ok) {
      books = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch books:', error);
  }

  const genres = ['fiction', 'sci-fi', 'fantasy', 'mystery', 'non-fiction'];

  return (
    <div className={styles.container}>
      <h1>Filter Books</h1>
      
      <div className={styles.searchSection}>
        <h2>Filter by Genre</h2>
        <p>Click a genre to view books in that category:</p>
        
        <div className={styles.genreGrid}>
          {genres.map((genre) => (
            <a
              key={genre}
              href={`/search/filter/${genre}`}
              className={styles.genreCard}
            >
              <h3>
                {genre === 'sci-fi' ? 'Sci-Fi' : 
                 genre === 'non-fiction' ? 'Non-Fiction' :
                 genre.charAt(0).toUpperCase() + genre.slice(1)}
              </h3>
              <p>
                {books.filter(b => b.genre === genre).length} books
              </p>
            </a>
          ))}
        </div>
      </div>
      
    </div>
  );
}
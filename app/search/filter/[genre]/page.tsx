/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/

import Link from 'next/link';
import { BookItem } from '../../../../components/BookItem';
import { Book } from '../../../types';
import styles from './genre.module.css';

/**
 * Typescript interface for the FilterPage component props.
 * Makes params a Promise of an object with a genre property
 */
interface FilterPageProps {
  params: Promise<{genre: string;}>;
}

// search/filter/[genre]/page.tsx

export async function generateStaticParams() {
  // Example genres; you should replace these with your actual genres or fetch from data.
  const genres = ['fiction', 'sci-fi', 'fantasy', 'mystery', 'non-fiction'];
  return genres.map((genre) => ({ genre }));
}

/**
 * Dynamic route page that displays the books filtered by genre.
 * Fetches books filtered by genre from the API and displays them.
 * @param param - The genre to filter by
 * @returns - 
 */
export default async function FilterPage({ params }: FilterPageProps) {
  // Await the params promise 
  const { genre } = await params;
  
  // genres list
  const genres = ['fiction', 'sci-fi', 'fantasy', 'mystery', 'non-fiction'];
  
  // Check if genre is valid
  if (!genres.includes(genre)) {
    return (
      <div className={styles.errorContainer}>
        <h2>Genre not found: &quot;{genre}&quot;</h2>
        <p>Available genres: {genres.join(', ')}</p>
        {/* <a href="/">Go back to home</a> */}
        <Link href="/">Go back to home</Link>
      </div>
    );
  }
  
  // Fetch books filtered by genre
  let books: Book[] = [];
  
  try {
    const response = await fetch(`http://localhost:4000/books?genre=${genre}`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      books = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch filtered books:', error);
  }

  // Format genre for display
  const displayGenre = genre === 'sci-fi' ? 'Sci-Fi' : 
                      genre === 'non-fiction' ? 'Non-Fiction' :
                      genre.charAt(0).toUpperCase() + genre.slice(1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{displayGenre} Books</h1>
        <p>Filtered view showing only {genre} books</p>
      </div>
      
      {/* If no books found in genre, display empty state */}
      {books.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No books found in the &quot;{displayGenre}&quot; genre.</p>
          <p>Try adding a {genre} book using the form on the home page!</p>
          {/* <a href="/">Go to Home Page</a> */}
          <Link href="/">Go back to home</Link>
        </div>
      ) : (
        <>
          <div className={styles.statsBar}>
            <p className={styles.bookCount}>
              Found <span>{books.length}</span> book{books.length !== 1 ? 's' : ''} in this genre
            </p>
          </div>
          
          <div className={styles.bookList}>
            {books.map((book) => (
              <BookItem key={book.id} book={book} showFullInfo={false} />
            ))}
          </div>
        </>
      )}
      

    </div>
  );
}
/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/
import { BookActions } from './BookActions';
import styles from './bookitem.module.css';
import { Book } from '../app/types';

/**
 * Typescript interface for the BookItem component props.
 *  Defines the props needed for the BookItem component
 */
interface BookItemProps {
  book: Book;
  showFullInfo?: boolean;
}

/**
 * Component that displays a book item.
 * Displays the book title, author, genre, year, pages, description, and rating.
 * Also contains the client component for book actions on the side panel.
 * @param book - The book to display
 * @param param - The showFullInfo prop 
 * @returns  - The BookItem component
 */
export function BookItem({ book, showFullInfo = true }: BookItemProps) {
  return (
    <div className={styles.bookCard}>
      <div className={styles.contentWrapper}>
        <div className={styles.bookInfo}>
          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.author}>
            <strong>By:</strong> {book.author}
          </p>
          <p className={styles.genre}>
            <strong>Genre:</strong> 
            <span className={styles.genreTag}>
              {book.genre}
            </span>
          </p>
          
          {showFullInfo && (
            <>
              <div className={styles.detailsRow}>
                <p className={styles.detail}>
                  <strong>Year:</strong> {book.year}
                </p>
                <p className={styles.detail}>
                  <strong>Pages:</strong> {book.pages}
                </p>
              </div>
              <p className={styles.description}>
                {book.description}
              </p>
            </>
          )}
        </div>
        
        <div className={styles.sidePanel}>
          {/* Single client component for ALL book actions */}
          <BookActions 
            bookId={book.id} 
            bookTitle={book.title}
            initialRating={book.rating} 
          />
          
          <div className={styles.metaInfo}>
            <div className={styles.bookId}>ID: {book.id}</div>
            {book.created_at && (
              <div className={styles.dateAdded}>
                Added: {new Date(book.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
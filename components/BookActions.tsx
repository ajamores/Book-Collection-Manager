/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/
'use client'

import { useState } from 'react';
import { updateBookRating, deleteBook } from './actions';
import styles from './bookactions.module.css';

/**
 * Typescript interface for the BookActions component props.
 * Defines the props needed for the BookActions component
 */
interface BookActionsProps {
  bookId: number;
  bookTitle: string;
  initialRating: number;
}
/**
 * Client component that handles interactions with a book, such as rating, deleting.
 * Users can rate a book from 1 to 5 stars and delete a book.
*  @param props - The component props containing book information
 * @param props.bookId - The unique ID of the book
 * @param props.bookTitle - The title of the book for display
 * @param props.initialRating - The current rating of the book
 * @returns The BookActions component with rating and delete functionality
 */
export function BookActions({ bookId, bookTitle, initialRating }: BookActionsProps) {
  const [rating, setRating] = useState(initialRating);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Rating handler
   * @param newRating - The new rating 
   */
  async function handleRate(newRating: number) {
    //validate rating
    if (newRating < 0 || newRating > 5 || newRating === rating) return;
    
    setIsUpdating(true);
    try {
      // Update the rating in the database
      await updateBookRating(bookId, newRating);
      setRating(newRating);
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
    setIsUpdating(false);
  }

  /**
   * Delete handler
   */
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBook(bookId);
      // Page will revalidate automatically via server action
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }
  /**
   * Displays the stars for rating
   * @returns - The stars
   */
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={styles.ratingButton}
          onClick={() => handleRate(i)}
          disabled={isUpdating || isDeleting}
          style={{
            backgroundColor: i <= rating ? '#f39c12' : '#ecf0f1',
            color: i <= rating ? 'white' : '#333',
          }}
        >
          {i} ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className={styles.actionsContainer}>
      {/* Rating Section */}
      <div className={styles.ratingSection}>
        <div className={styles.ratingDisplay}>
          <span className={styles.ratingLabel}>Rating:</span>
          <span className={styles.ratingValue}>{rating.toFixed(1)}/5</span>
        </div>
        <div className={styles.starsContainer}>
          {renderStars()}
        </div>
        {isUpdating && (
          <span className={styles.updatingText}>Updating...</span>
        )}
      </div>

      {/* Delete Section */}
      <div className={styles.deleteSection}>
        {showDeleteConfirm ? (
          <div className={styles.confirmDialog}>
            <p className={styles.confirmText}>
              Delete &quot;{bookTitle}&quot;?
            </p>
            <div className={styles.confirmButtons}>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={styles.confirmButton}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isUpdating || isDeleting}
            className={styles.deleteButton}
            title={`Delete "${bookTitle}"`}
          >
             Delete Book
          </button>
        )}
      </div>
    </div>
  );
}
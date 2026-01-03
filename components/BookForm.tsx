/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/
'use client'

import { useState } from 'react';
import { createBook } from './actions';
import styles from './bookform.module.css';

/**
 * Client component that displays a form for adding a new book
 * @returns - BookForm component
 */
export function BookForm() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'fiction',
    year: '',
    pages: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genres = ['fiction', 'sci-fi', 'fantasy', 'mystery', 'non-fiction'];

  /**
   * Handles changes to form data
   * @param e - The event object, which contains information about the change
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }


/**
 * Handles form submission
 * @param e - The event object
 */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formErrors: string[] = [];

    // VALIDATION  Title required and length
    if (!formData.title.trim()) {
      formErrors.push("Title is required.");
    } else if (formData.title.length < 2) {
      formErrors.push("Title must be at least 2 characters long.");
    } else if (formData.title.length > 100) {
      formErrors.push("Title cannot exceed 100 characters.");
    }

    // VALIDATION  Author required and no digits
    if (!formData.author.trim()) {
      formErrors.push("Author is required.");
    } else if (/\d/.test(formData.author)) {
      formErrors.push("Author name cannot contain digits.");
    } else if (formData.author.length > 50) {
      formErrors.push("Author name cannot exceed 50 characters.");
    }

    // VALIDATION Year validation, must be between 1000 and current year
    if (formData.year) {
      const yearNum = parseInt(formData.year);
      if (isNaN(yearNum)) {
        formErrors.push("Year must be a valid number.");
      } else if (yearNum < 1000 || yearNum > new Date().getFullYear()) {
        formErrors.push(`Year must be between 1000 and ${new Date().getFullYear()}.`);
      }
    }


    // VALIDATION  Pages validation
    if (formData.pages) {
      const pagesNum = parseInt(formData.pages);
      if (isNaN(pagesNum)) {
        formErrors.push("Pages must be a valid number.");
      } else if (pagesNum <= 0) {
        formErrors.push("Pages must be a positive number.");
      } else if (pagesNum > 10000) {
        formErrors.push("Pages cannot exceed 10,000.");
      }
    }

    // VALIDATION Description length
    if (formData.description.length > 500) {
      formErrors.push("Description cannot exceed 500 characters.");
    }

    // VALIDATION  Genre must be valid
    if (!genres.includes(formData.genre)) {
      formErrors.push("Please select a valid genre.");
    }

    if (formErrors.length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    // Create FormData object for server action
    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('author', formData.author);
    formDataObj.append('genre', formData.genre);
    formDataObj.append('year', formData.year);
    formDataObj.append('pages', formData.pages);
    formDataObj.append('description', formData.description);

    try {
      await createBook(formDataObj);
      // Reset form on success
      setFormData({
        title: '',
        author: '',
        genre: 'fiction',
        year: '',
        pages: '',
        description: ''
      });
      setErrors([]);
    } catch (error) {
      setErrors(['Failed to create book. Please try again.']);
    }
    
    setIsSubmitting(false);
  }

  return (
    <div className={styles.formContainer}>
      <h2>Book Information</h2>
      
      {errors.length > 0 && (
        <div className={styles.errorList}>
          <h4>Please fix the following errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.requiredField}>
            Title:
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter book title"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="author" className={styles.requiredField}>
            Author:
          </label>
          <input
            id="author"
            name="author"
            type="text"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="genre" className={styles.requiredField}>
            Genre:
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="year">
            Year:
          </label>
          <input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g., 2023"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pages">
            Pages:
          </label>
          <input
            id="pages"
            name="pages"
            type="number"
            value={formData.pages}
            onChange={handleChange}
            placeholder="e.g., 320"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter book description"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <button 
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Book..." : "Add Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
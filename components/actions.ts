/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/

'use server'
import { revalidatePath } from 'next/cache';


/**
 * Creates a book in the database
 * @param formData - The form data
 */
export async function createBook(formData: FormData) {
  const book = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    genre: formData.get('genre') as string,
    year: formData.get('year') as string,
    pages: formData.get('pages') as string,
    description: formData.get('description') as string,
  };

  await fetch('http://localhost:4000/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: book.title,
      author: book.author,
      genre: book.genre,
      year: book.year ? parseInt(book.year) : null,
      pages: book.pages ? parseInt(book.pages) : null,
      description: book.description,
    }),
  });

  revalidatePath('/');
  revalidatePath('/filter/[genre]', 'page');
}


/**
 * Gives a book a rating
 * @param bookId - The id of the book
 * @param rating - The rating to give
 */
export async function updateBookRating(bookId: number, rating: number) {
  await fetch(`http://localhost:4000/books/${bookId}/rating`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating }),
  });

  revalidatePath('/');
  revalidatePath('/filter/[genre]', 'page');
}


/**
 * Removes a book from the database collection
 * @param bookId - The id of the book to remove
 */
export async function deleteBook(bookId: number) {
  await fetch(`http://localhost:4000/books/${bookId}`, {
    method: 'DELETE',
  });

  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/search/filter/[genre]', 'page');
}
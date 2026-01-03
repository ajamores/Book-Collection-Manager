/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/

/**
 * Typescript interface for the Book object.
 * Represents a book with properties such as id, title, author, 
 * genre, year, rating, pages, description, and created_at.
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  rating: number;
  pages: number;
  description: string;
  created_at?: string;
}

export type GenreFilter = 'all' | 'fiction' | 'sci-fi' | 'fantasy' | 'mystery' | 'non-fiction';
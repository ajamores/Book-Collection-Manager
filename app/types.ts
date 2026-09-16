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
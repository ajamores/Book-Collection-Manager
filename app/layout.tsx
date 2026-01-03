/**StAuth10222: I Armand Amores, 000315902 certify that this material is my original work. No other person's work has been used without
due acknowledgement. I have not made my work available to anyone else.*/

import type { Metadata } from 'next';
import './globals.css';
import { HeaderNav } from '../components/HeaderNav';

export const metadata: Metadata = {
  title: 'Book Collection App',
  description: 'Next.js assignment - Book Collection Management',
};

/**
 * Root layout component
 * @param param0  - Children
 * @returns - Root layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
       
        <HeaderNav />
        
        <main style={{ 
          padding: '2rem 1rem', 
          maxWidth: '1200px', 
          margin: '0 auto',
          minHeight: '70vh'
        }}>
          {children}
        </main>
        
        <footer style={{ 
          textAlign: 'center', 
          padding: '1.5rem', 
          backgroundColor: '#2c3e50', 
          color: 'white',
          marginTop: '2rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <em>Book Collection App - By Armand Amores</em>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#bdc3c7' }}>
              Node.js API on port 4000 | Next.js on port 3000 | SQLite Database
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
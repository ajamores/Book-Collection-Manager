import styles from './headernav.module.css';

/**
 * Displays the header navigation for the application.
 * @returns - The HeaderNav component
 */
export function HeaderNav() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Book Collection Manager
        </h1>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>
            Home
          </a>
          <a href="/search" className={styles.navLink}>
            Search Books 
          </a>
        </nav>
      </div>
    </header>
  );
}
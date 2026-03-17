import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Welcome to Your React App</h1>
        <p>Built with kubit-forge</p>
      </header>
      <main className={styles.main}>
        <p>
          Start building your application by editing <code>src/app/App.tsx</code>
        </p>
      </main>
    </div>
  );
}

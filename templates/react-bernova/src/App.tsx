import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <header className="app-header">
        <h1>Welcome to {{ projectName }}</h1>
        <p>Built with Bernova - CSS-in-JS</p>
      </header>

      <main className="app-content">
        <h2>Get Started</h2>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>

        <div className="button-group">
          <button className="btn-primary btn-medium" onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <button className="btn-secondary btn-medium">Secondary Button</button>
        </div>

        <div className="card mt-md">
          <h3>Bernova Features</h3>
          <ul>
            <li>CSS-in-JS with JavaScript syntax</li>
            <li>Type-safe with TypeScript</li>
            <li>CSS Variables support</li>
            <li>Media queries</li>
            <li>Pseudo-classes and elements</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Learn more about{' '}
          <a href="https://github.com/kubit-ui/bernova" target="_blank" rel="noopener noreferrer">
            Bernova
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

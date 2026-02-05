import { useState } from 'react';
import ComponentsShowcase from './components/ComponentsShowcase';
import ChartsShowcase from './charts/ChartsShowcase';
import './App.css';

type Tab = 'components' | 'charts';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('components');

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="app-title">Kubit Ecosystem</h1>
              <p className="app-subtitle">Full-stack design system showcase</p>
            </div>
            <nav className="tabs">
              <button
                className={`tab ${activeTab === 'components' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('components')}
              >
                Components
              </button>
              <button
                className={`tab ${activeTab === 'charts' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('charts')}
              >
                Charts
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {activeTab === 'components' && <ComponentsShowcase />}
          {activeTab === 'charts' && <ChartsShowcase />}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p className="footer-text">
            Built with ❤️ using the Kubit ecosystem:{' '}
            <a
              href="https://github.com/kubit-ui/kubit-react-components"
              target="_blank"
              rel="noopener noreferrer"
            >
              React Components
            </a>
            ,{' '}
            <a
              href="https://github.com/kubit-ui/kubit-react-charts"
              target="_blank"
              rel="noopener noreferrer"
            >
              Charts
            </a>
            , and{' '}
            <a href="https://github.com/kubit-ui/bernova" target="_blank" rel="noopener noreferrer">
              Bernova
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

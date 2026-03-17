import { Provider, KUBIT_VARIANTS } from '@kubit-ui-web/design-system';
import { StylesProvider, Button, Text } from '@kubit-ui-web/react-components';
import { ExampleComponent } from './components/ExampleComponent';
import './styles/App.css';

function App() {
  const { ButtonSizeType, ButtonVariantType, TextVariantType } = KUBIT_VARIANTS;

  return (
    <StylesProvider bernovaProvider={Provider as any}>
      <div className="app">
        <header className="app-header">
          <Text variant={TextVariantType.HEADING_H1_EXPANDED} component="h1">
            Welcome to {{ projectName }}
          </Text>
          <Text variant={TextVariantType.PARAGRAPH_CAPTION_EXPANDED}>
            Built with Kubit UI Components
          </Text>
        </header>

        <main className="app-main">
          <section className="hero">
            <Text variant={TextVariantType.HEADING_H2_EXPANDED} as="h2">
              Get Started
            </Text>
            <Text variant={TextVariantType.PARAGRAPH_CAPTION_EXPANDED}>
              Edit <code>src/App.tsx</code> and save to reload.
            </Text>

            <div className="button-group">
              <Button
                variant={ButtonVariantType.PRIMARY}
                size={ButtonSizeType.LARGE}
                onClick={() => alert('Primary button clicked!')}
              >
                Primary Button
              </Button>
              <Button
                variant={ButtonVariantType.SECONDARY}
                size={ButtonSizeType.LARGE}
                onClick={() => alert('Secondary button clicked!')}
              >
                Secondary Button
              </Button>
            </div>
          </section>

          <ExampleComponent title="Kubit UI Example" />

          <section className="links">
            <Text variant={TextVariantType.HEADING_H3_EXPANDED} component="h3">
              Learn More
            </Text>
            <ul>
              <li>
                <a href="https://www.kubit-ui.com/" target="_blank" rel="noopener noreferrer">
                  Kubit UI Documentation
                </a>
              </li>
              <li>
                <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                  React Documentation
                </a>
              </li>
              <li>
                <a href="https://vite.dev/" target="_blank" rel="noopener noreferrer">
                  Vite Documentation
                </a>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </StylesProvider>
  );
}

export default App;

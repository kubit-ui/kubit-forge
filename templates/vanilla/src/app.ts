import styles from './app.module.css';

export function createApp(): HTMLElement {
  const app = document.createElement('div');
  app.className = styles.app;

  const header = document.createElement('header');
  header.className = styles.header;

  const title = document.createElement('h1');
  title.textContent = 'Welcome to Your Vanilla App';

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Built with kubit-forge';

  header.appendChild(title);
  header.appendChild(subtitle);

  const main = document.createElement('main');
  main.className = styles.main;

  const description = document.createElement('p');
  description.innerHTML = 'Start building your application by editing <code>src/app.ts</code>';

  main.appendChild(description);

  app.appendChild(header);
  app.appendChild(main);

  return app;
}

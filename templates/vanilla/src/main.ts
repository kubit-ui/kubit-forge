import './styles/main.css';
import { createApp } from './app';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement) {
  const app = createApp();
  appElement.appendChild(app);
}

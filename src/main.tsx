
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Immediately set the HTML class based on the saved theme to prevent flash
const setInitialTheme = () => {
  const storageTheme = localStorage.getItem('cyberpunk-ui-theme');
  const systemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const root = document.documentElement;
  
  if (storageTheme === 'dark' || (storageTheme === 'system' && systemThemeDark) || (!storageTheme && systemThemeDark)) {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
};

// Apply theme immediately
setInitialTheme();

createRoot(document.getElementById("root")!).render(<App />);

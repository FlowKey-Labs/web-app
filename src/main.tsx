import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';
import './index.css';
import App from './App.tsx';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
  </StrictMode>
);

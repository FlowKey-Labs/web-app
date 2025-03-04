import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/home/Home';

function App() {
  return (
    <MantineProvider
      theme={{
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;

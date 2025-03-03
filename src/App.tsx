import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider
      theme={{
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div className='flex justify-center items-center h-screen'>
        <header className='flex flex-col justify-center items-center space-y-4'></header>
      </div>
    </MantineProvider>
  );
}

export default App;

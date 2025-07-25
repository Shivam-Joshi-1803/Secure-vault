import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import FileEncryptor from './components/FileEncryptor';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <FileEncryptor />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-100">
        <header className="p-4 bg-brand-primary text-white">
          <h1 className="text-2xl font-bold">Vision 2030 Platform</h1>
        </header>
        <main>
          {/* Main content will go here */}
          <div className="container mx-auto p-4">
            <h2 className="text-xl">Welcome to Vision 2030</h2>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
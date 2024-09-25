import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import NavigationBar from './components/NavigationBar';
import AddAbaya from './pages/AddAbaya';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-abaya" element={<AddAbaya />} />
        </Routes>
        <NavigationBar />
      </div>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import Admin from './Pages/Admin';
import Score from './Pages/Score';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/scores" element={<Score />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

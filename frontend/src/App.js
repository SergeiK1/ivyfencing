import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import ProtectedAdmin from './Pages/ProtectedAdmin';
import Score from './Pages/Score';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="/scores" element={<Score />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

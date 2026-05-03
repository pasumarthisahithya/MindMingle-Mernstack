import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MindfulnessExercises from './pages/MindfulnessExercises';
import ExerciseDetails from './pages/ExerciseDetails';
import MoodTracker from './pages/MoodTracker';
import MoodHistory from './pages/MoodHistory';
import PeerSupport from './pages/PeerSupport';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import ProfessionalHelp from './pages/ProfessionalHelp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <Login setIsAuthenticated={setIsAuthenticated} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/signup" 
            element={
              !isAuthenticated ? 
              <Signup setIsAuthenticated={setIsAuthenticated} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/exercises" 
            element={
              isAuthenticated ? 
              <MindfulnessExercises /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/exercises/:id" 
            element={
              isAuthenticated ? 
              <ExerciseDetails /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/mood-tracker" 
            element={
              isAuthenticated ? 
              <MoodTracker /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/mood-history" 
            element={
              isAuthenticated ? 
              <MoodHistory /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/peer-support" 
            element={
              isAuthenticated ? 
              <PeerSupport /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/reminders" 
            element={
              isAuthenticated ? 
              <Reminders /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
              <Profile /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/professional-help" 
            element={
              isAuthenticated ? 
              <ProfessionalHelp /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/professional-help/:chatId" 
            element={
              isAuthenticated ? 
              <ProfessionalHelp /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mindfulnessService } from '../services/api';

function MindfulnessExercises() {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredExercises(exercises);
    } else {
      setFilteredExercises(exercises.filter(ex => ex.category === filter));
    }
  }, [filter, exercises]);

  const fetchExercises = async () => {
    try {
      const data = await mindfulnessService.getExercises();
      setExercises(data.mindfulnessExercises);
      setFilteredExercises(data.mindfulnessExercises);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'breathing': '🌬️',
      'meditation': '🧘',
      'visualization': '🌈',
      'body-scan': '🧍',
      'mindful-movement': '🚶'
    };
    return icons[category] || '✨';
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      'beginner': 'success',
      'intermediate': 'warning',
      'advanced': 'danger'
    };
    return badges[difficulty] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold">Mindfulness Exercises</h1>
          <p className="text-muted">Discover exercises to reduce stress and improve your well-being</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="row mb-4">
        <div className="col">
          <div className="btn-group flex-wrap" role="group" aria-label="Exercise category filter">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn ${filter === 'breathing' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('breathing')}
            >
              Breathing
            </button>
            <button 
              className={`btn ${filter === 'meditation' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('meditation')}
            >
              Meditation
            </button>
            <button 
              className={`btn ${filter === 'visualization' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('visualization')}
            >
              Visualization
            </button>
            <button 
              className={`btn ${filter === 'body-scan' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('body-scan')}
            >
              Body Scan
            </button>
            <button 
              className={`btn ${filter === 'mindful-movement' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('mindful-movement')}
            >
              Movement
            </button>
          </div>
        </div>
      </div>

      {/* Exercises grid */}
      <div className="row g-4">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <div key={exercise._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="display-4">{getCategoryIcon(exercise.category)}</div>
                    <span className={`badge bg-${getDifficultyBadge(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  <h3 className="h5 fw-bold mb-2">{exercise.title}</h3>
                  <p className="text-muted mb-3">{exercise.description}</p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                      <strong>Duration:</strong> {exercise.duration} min
                    </small>
                    <small className="text-muted text-capitalize">
                      {exercise.category.replace('-', ' ')}
                    </small>
                  </div>
                  <Link 
                    to={`/exercises/${exercise._id}`} 
                    className="btn btn-primary w-100"
                    aria-label={`Start ${exercise.title} exercise`}
                  >
                    Start Exercise
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No exercises found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MindfulnessExercises;

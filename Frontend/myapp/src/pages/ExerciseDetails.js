import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mindfulnessService } from '../services/api';

function ExerciseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExercise();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  const fetchExercise = async () => {
    try {
      const data = await mindfulnessService.getExercise(id);
      setExercise(data.exercise);
      const durationInSeconds = data.exercise.duration * 60;
      setTotalTime(durationInSeconds);
      setTimeLeft(durationInSeconds);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      setLoading(false);
    }
  };

  const handleStartExercise = () => {
    setIsStarted(true);
    setCurrentStep(0);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = () => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const handleComplete = () => {
    alert('Great job! You completed the exercise. 🎉');
    navigate('/exercises');
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

  if (!exercise) {
    return (
      <div className="container py-5 text-center">
        <h2>Exercise not found</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/exercises')}>
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {!isStarted ? (
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <button 
                  className="btn btn-outline-secondary mb-3"
                  onClick={() => navigate('/exercises')}
                  aria-label="Go back to exercises list"
                >
                  ← Back
                </button>
                
                <h1 className="fw-bold mb-3">{exercise.title}</h1>
                <p className="lead text-muted mb-4">{exercise.description}</p>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <small className="text-muted d-block">Duration</small>
                        <strong>{exercise.duration} minutes</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <small className="text-muted d-block">Category</small>
                        <strong className="text-capitalize">{exercise.category.replace('-', ' ')}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <small className="text-muted d-block">Difficulty</small>
                        <strong className="text-capitalize">{exercise.difficulty}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="h5 fw-bold mb-3">Benefits</h2>
                <ul className="list-group list-group-flush mb-4">
                  {exercise.benefits.map((benefit, index) => (
                    <li key={index} className="list-group-item px-0">
                      <span className="text-success me-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <h2 className="h5 fw-bold mb-3">Instructions</h2>
                <div className="mb-4">
                  {exercise.instructions.map((instruction, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex">
                        <span className="badge bg-primary rounded-circle me-3" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {instruction.step}
                        </span>
                        <p className="mb-0">{instruction.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleStartExercise}
                  aria-label="Begin the exercise"
                >
                  Begin Exercise
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">{exercise.title}</h2>
                  <p className="text-muted">Follow the steps and use the timer below</p>
                </div>

                {/* Timer Display */}
                <div className="text-center mb-5">
                  <div 
                    className="display-1 fw-bold mb-3"
                    style={{ 
                      fontSize: '4rem',
                      color: timeLeft === 0 ? '#10b981' : (isTimerRunning ? '#6366f1' : '#6b7280')
                    }}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  
                  {/* Circular Progress */}
                  <div className="position-relative mx-auto mb-4" style={{ width: '200px', height: '200px' }}>
                    <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 90}`}
                        strokeDashoffset={`${2 * Math.PI * 90 * (1 - getTimerProgress() / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <div 
                      className="position-absolute top-50 start-50 translate-middle text-center"
                    >
                      <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                        {Math.round(getTimerProgress())}%
                      </div>
                      <small className="text-muted">Complete</small>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="d-flex justify-content-center gap-3 mb-4">
                    {!isTimerRunning ? (
                      <button 
                        className="btn btn-primary btn-lg px-5"
                        onClick={handleStartTimer}
                        disabled={timeLeft === 0}
                        aria-label="Start timer"
                      >
                        ▶ Start
                      </button>
                    ) : (
                      <button 
                        className="btn btn-warning btn-lg px-5"
                        onClick={handlePauseTimer}
                        aria-label="Pause timer"
                      >
                        ⏸ Pause
                      </button>
                    )}
                    <button 
                      className="btn btn-outline-secondary btn-lg px-5"
                      onClick={handleResetTimer}
                      aria-label="Reset timer"
                    >
                      ↻ Reset
                    </button>
                  </div>

                  {timeLeft === 0 && (
                    <div className="alert alert-success" role="alert">
                      🎉 Great job! You completed the exercise!
                    </div>
                  )}
                </div>

                {/* Exercise Steps */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold mb-3">Exercise Steps</h3>
                  <div className="accordion" id="stepsAccordion">
                    {exercise.instructions.map((instruction, index) => (
                      <div key={index} className="accordion-item border-0 mb-2 shadow-sm">
                        <h4 className="accordion-header">
                          <button 
                            className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target={`#step${index}`}
                            aria-expanded={index === 0}
                            aria-controls={`step${index}`}
                          >
                            <span className="badge bg-primary rounded-circle me-3" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {instruction.step}
                            </span>
                            Step {instruction.step}
                          </button>
                        </h4>
                        <div 
                          id={`step${index}`}
                          className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                          data-bs-parent="#stepsAccordion"
                        >
                          <div className="accordion-body">
                            {instruction.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setIsStarted(false)}
                    aria-label="Back to overview"
                  >
                    ← Back to Overview
                  </button>
                  
                  <button 
                    className="btn btn-success"
                    onClick={handleComplete}
                    aria-label="Complete exercise"
                  >
                    Complete & Exit ✓
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;
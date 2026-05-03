import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moodService, goalService } from '../services/api';

function MoodTracker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mood: '',
    intensity: 5,
    notes: '',
    activities: []
  });
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    targetMood: '',
    targetFrequency: 'Daily'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalService.getGoals();
      setGoals(data.goals);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const moodOptions = [
    { value: 'Very Happy', emoji: '😄', color: '#10b981', positive: true },
    { value: 'Happy', emoji: '😊', color: '#3b82f6', positive: true },
    { value: 'Calm', emoji: '😌', color: '#6366f1', positive: true },
    { value: 'Neutral', emoji: '😐', color: '#6b7280', positive: false },
    { value: 'Anxious', emoji: '😰', color: '#f59e0b', positive: false },
    { value: 'Sad', emoji: '😢', color: '#ef4444', positive: false },
    { value: 'Very Sad', emoji: '😭', color: '#dc2626', positive: false },
    { value: 'Stressed', emoji: '😫', color: '#8b5cf6', positive: false }
  ];

  const positiveMoodOptions = moodOptions.filter(option => option.positive);

  const activityOptions = [
    'Exercise', 'Meditation', 'Work', 'Social', 'Sleep', 'Hobby', 'Reading', 'Music'
  ];

  const handleMoodSelect = (mood) => {
    setFormData({ ...formData, mood });
  };

  const handleActivityToggle = (activity) => {
    const activities = formData.activities.includes(activity)
      ? formData.activities.filter(a => a !== activity)
      : [...formData.activities, activity];
    setFormData({ ...formData, activities });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.mood) {
      setError('Please select a mood');
      return;
    }

    setLoading(true);

    try {
      await moodService.trackMood(formData);
      setSuccess('Mood tracked successfully! 🎉');
      setTimeout(() => {
        navigate('/mood-history');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to track mood');
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!goalFormData.title) {
      setError('Please enter a goal title');
      return;
    }

    if (!goalFormData.targetMood) {
      setError('Please select a target mood');
      return;
    }

    try {
      await goalService.createGoal(goalFormData);
      setSuccess('Goal created successfully! 🎯');
      setShowGoalForm(false);
      setGoalFormData({
        title: '',
        description: '',
        targetMood: '',
        targetFrequency: 'Daily'
      });
      fetchGoals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalService.deleteGoal(id);
      setSuccess('Goal deleted successfully');
      fetchGoals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete goal');
    }
  };

  const toggleGoalStatus = async (goal) => {
    try {
      await goalService.updateGoal(goal._id, {
        isActive: !goal.isActive
      });
      fetchGoals();
    } catch (err) {
      setError('Failed to update goal');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              <h1 className="fw-bold mb-3">How are you feeling today?</h1>
              <p className="text-muted mb-4">Track your mood to understand your emotional patterns</p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Mood Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Select Your Mood *</label>
                  <div className="row g-3">
                    {moodOptions.map((option) => (
                      <div key={option.value} className="col-6 col-md-3">
                        <button
                          type="button"
                          className={`btn w-100 p-3 ${formData.mood === option.value ? 'border-primary shadow' : 'border'}`}
                          style={{
                            backgroundColor: formData.mood === option.value ? `${option.color}20` : 'white',
                            borderWidth: '2px'
                          }}
                          onClick={() => handleMoodSelect(option.value)}
                          aria-label={`Select ${option.value} mood`}
                          aria-pressed={formData.mood === option.value}
                        >
                          <div className="display-4">{option.emoji}</div>
                          <div className="small mt-2">{option.value}</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="mb-4">
                  <label htmlFor="intensity" className="form-label fw-bold">
                    Intensity Level: {formData.intensity}/10
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    id="intensity"
                    min="1"
                    max="10"
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                    aria-label="Mood intensity level"
                  />
                  <div className="d-flex justify-content-between text-muted small">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Activities */}
                <div className="mb-4">
                  <label className="form-label fw-bold">What have you been doing? (Optional)</label>
                  <div className="d-flex flex-wrap gap-2">
                    {activityOptions.map((activity) => (
                      <button
                        key={activity}
                        type="button"
                        className={`btn ${formData.activities.includes(activity) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleActivityToggle(activity)}
                        aria-label={`Toggle ${activity} activity`}
                        aria-pressed={formData.activities.includes(activity)}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label htmlFor="notes" className="form-label fw-bold">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows="3"
                    maxLength="500"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any thoughts or observations about your mood..."
                    aria-label="Additional notes about your mood"
                  ></textarea>
                  <div className="form-text">
                    {formData.notes.length}/500 characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg flex-grow-1"
                    disabled={loading}
                    aria-label="Save mood entry"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Mood Entry'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate('/mood-history')}
                    aria-label="View mood history"
                  >
                    View History
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Wellness Goals Section */}
          <div className="card border-0 shadow-lg mt-4">
            <div className="card-body p-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="h4 fw-bold mb-1">🎯 Your Wellness Goals</h2>
                  <p className="text-muted small mb-0">Set and track your mental wellness objectives</p>
                </div>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  aria-label="Add new goal"
                >
                  {showGoalForm ? 'Cancel' : '+ Add Goal'}
                </button>
              </div>

              {/* Goal Form */}
              {showGoalForm && (
                <div className="card bg-light border-0 p-3 mb-4">
                  <form onSubmit={handleGoalSubmit}>
                    <div className="mb-3">
                      <label htmlFor="goalTitle" className="form-label fw-bold">
                        Goal Title *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="goalTitle"
                        value={goalFormData.title}
                        onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                        placeholder="e.g., Feel calmer daily, Reduce anxiety"
                        maxLength="200"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="goalDescription" className="form-label">
                        Description (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="goalDescription"
                        rows="2"
                        value={goalFormData.description}
                        onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                        placeholder="Describe what you want to achieve..."
                        maxLength="500"
                      ></textarea>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="targetMood" className="form-label fw-bold">
                          Target Mood *
                        </label>
                        <select
                          className="form-select"
                          id="targetMood"
                          value={goalFormData.targetMood}
                          onChange={(e) => setGoalFormData({ ...goalFormData, targetMood: e.target.value })}
                          required
                        >
                          <option value="">Select a positive mood...</option>
                          {positiveMoodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.emoji} {option.value}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">Only positive moods can be set as goals</small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="targetFrequency" className="form-label">
                          Frequency *
                        </label>
                        <select
                          className="form-select"
                          id="targetFrequency"
                          value={goalFormData.targetFrequency}
                          onChange={(e) => setGoalFormData({ ...goalFormData, targetFrequency: e.target.value })}
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Create Goal
                    </button>
                  </form>
                </div>
              )}

              {/* Goals List */}
              {goals.length > 0 ? (
                <div className="row g-3">
                  {goals.map(goal => (
                    <div key={goal._id} className="col-md-6">
                      <div className={`card h-100 ${goal.isActive ? 'border-primary' : 'border-secondary'}`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">{goal.title}</h5>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={goal.isActive}
                                onChange={() => toggleGoalStatus(goal)}
                                aria-label="Toggle goal active status"
                              />
                            </div>
                          </div>
                          
                          {goal.description && (
                            <p className="card-text text-muted small">{goal.description}</p>
                          )}
                          
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {goal.targetMood && (
                              <span className="badge bg-primary">
                                Target: {goal.targetMood}
                              </span>
                            )}
                            <span className="badge bg-secondary">
                              {goal.targetFrequency}
                            </span>
                          </div>

                          <div className="progress mb-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ width: `${goal.progress}%` }}
                              aria-valuenow={goal.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">{goal.progress}% Progress</small>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteGoal(goal._id)}
                              aria-label="Delete goal"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">
                    No wellness goals yet. Create your first goal to start tracking your progress!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoodTracker;
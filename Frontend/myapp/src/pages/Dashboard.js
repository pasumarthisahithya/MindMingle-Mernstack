import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moodService, mindfulnessService, professionalHelpService } from '../services/api';

function Dashboard() {
  const [moodStats, setMoodStats] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [professionalHelpSuggestion, setProfessionalHelpSuggestion] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, moodHistoryData, todayMoodData, helpSuggestion] = await Promise.all([
        moodService.getMoodStats(),
        moodService.getMoodHistory(7),
        moodService.getTodayMood(),
        professionalHelpService.checkMoodSuggestion()
      ]);

      console.log('Professional help suggestion:', helpSuggestion);

      setMoodStats(statsData.stats);
      setRecentMoods(moodHistoryData.moodHistory);
      setProfessionalHelpSuggestion(helpSuggestion);
      
      if (todayMoodData.mood) {
        setTodayMood(todayMoodData.mood);
        fetchRecommendations(todayMoodData.mood.mood);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchRecommendations = async (mood) => {
    try {
      setLoadingRecommendations(true);
      const data = await moodService.getRecommendedExercises(mood);
      setRecommendedExercises(data.exercises);
      setLoadingRecommendations(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoadingRecommendations(false);
    }
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
          <h1 className="fw-bold">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-muted">Track your progress and manage your mental wellness journey</p>
        </div>
      </div>

      {/* Professional Help Suggestion */}
      {professionalHelpSuggestion?.needsHelp && (
        <div className="row mb-4">
          <div className="col">
            <div className="alert alert-warning border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-start">
                <div className="me-3" style={{ fontSize: '2rem' }}>🏥</div>
                <div className="flex-grow-1">
                  <h5 className="alert-heading mb-2">Consider Professional Support</h5>
                  <p className="mb-2">{professionalHelpSuggestion.message}</p>
                  <Link to="/professional-help" className="btn btn-warning btn-sm">
                    Connect with a Professional →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="row mb-5">
        <div className="col">
          <h2 className="h4 mb-3 fw-bold">Quick Actions</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <Link to="/mood-tracker" className="card border-0 shadow-sm text-decoration-none hover-lift">
                <div className="card-body">
                  <h3 className="h5 text-primary mb-2">📝 Track Your Mood</h3>
                  <p className="text-muted mb-0">Record how you're feeling today</p>
                </div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/exercises" className="card border-0 shadow-sm text-decoration-none hover-lift">
                <div className="card-body">
                  <h3 className="h5 text-success mb-2">🧘 Start Exercise</h3>
                  <p className="text-muted mb-0">Begin a mindfulness session</p>
                </div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/reminders" className="card border-0 shadow-sm text-decoration-none hover-lift">
                <div className="card-body">
                  <h3 className="h5 text-warning mb-2">⏰ Set Reminder</h3>
                  <p className="text-muted mb-0">Schedule your practice time</p>
                </div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/peer-support" className="card border-0 shadow-sm text-decoration-none hover-lift">
                <div className="card-body">
                  <h3 className="h5 text-info mb-2">💬 Peer Support</h3>
                  <p className="text-muted mb-0">Connect with others anonymously</p>
                </div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/professional-help" className="card border-0 shadow-sm text-decoration-none hover-lift">
                <div className="card-body">
                  <h3 className="h5 text-danger mb-2">🏥 Professional Help</h3>
                  <p className="text-muted mb-0">Talk to licensed practitioners</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Exercises Based on Today's Mood */}
      <div className="row mb-5">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 mb-3 fw-bold">💡 Personalized Recommendations</h2>
              
              {!todayMood ? (
                <div className="alert alert-info border-0 d-flex align-items-center" role="alert">
                  <div className="flex-grow-1">
                    <h5 className="alert-heading mb-2">📊 Track your mood first!</h5>
                    <p className="mb-2">To get personalized exercise recommendations, please log your mood for today.</p>
                    <Link to="/mood-tracker" className="btn btn-primary btn-sm mt-2">
                      Track Mood Now →
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="alert alert-light border d-flex align-items-center mb-4">
                    <div className="me-3">
                      <span className="fs-2">
                        {todayMood.mood === 'Very Happy' && '😄'}
                        {todayMood.mood === 'Happy' && '😊'}
                        {todayMood.mood === 'Calm' && '😌'}
                        {todayMood.mood === 'Neutral' && '😐'}
                        {todayMood.mood === 'Anxious' && '😰'}
                        {todayMood.mood === 'Sad' && '😢'}
                        {todayMood.mood === 'Very Sad' && '😭'}
                        {todayMood.mood === 'Stressed' && '😫'}
                      </span>
                    </div>
                    <div>
                      <strong>Today's Mood: {todayMood.mood}</strong>
                      <p className="mb-0 text-muted small">Based on your mood, we recommend these exercises:</p>
                    </div>
                  </div>

                  {loadingRecommendations ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading recommendations...</span>
                      </div>
                    </div>
                  ) : recommendedExercises.length > 0 ? (
                    <div className="row g-3">
                      {recommendedExercises.map((exercise) => (
                        <div key={exercise._id} className="col-md-6 col-lg-4">
                          <Link 
                            to={`/exercises/${exercise._id}`}
                            className="card border-0 shadow-sm text-decoration-none hover-lift h-100"
                          >
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title text-dark mb-0">{exercise.title}</h5>
                                <span className="badge bg-primary">{exercise.duration} min</span>
                              </div>
                              <p className="card-text text-muted small mb-2">
                                {exercise.description.substring(0, 100)}...
                              </p>
                              <div className="d-flex gap-2 flex-wrap">
                                <span className="badge bg-light text-dark">{exercise.category}</span>
                                <span className="badge bg-light text-dark">{exercise.difficulty}</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No specific recommendations available. <Link to="/exercises">Browse all exercises</Link></p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Moods */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">Recent Mood Entries</h2>
              {recentMoods.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentMoods.slice(0, 5).map((mood, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{mood.mood}</strong>
                          <small className="text-muted d-block">{mood.date}</small>
                        </div>
                        <span className="badge bg-primary rounded-pill">
                          {mood.intensity}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No mood entries yet. <Link to="/mood-tracker">Track your first mood</Link></p>
              )}
              <Link to="/mood-history" className="btn btn-outline-primary btn-sm mt-3">
                View All History
              </Link>
            </div>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">Mood Distribution</h2>
              {moodStats?.moodDistribution && Object.keys(moodStats.moodDistribution).length > 0 ? (
                <div>
                  {Object.entries(moodStats.moodDistribution).map(([mood, count]) => (
                    <div key={mood} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>{mood}</span>
                        <span className="text-muted">{count} times</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${(count / moodStats.totalEntries) * 100}%` }}
                          aria-valuenow={(count / moodStats.totalEntries) * 100}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No mood data available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
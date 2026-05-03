import React, { useEffect, useState } from 'react';
import { reminderService, mindfulnessService } from '../services/api';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    exerciseTitle: '',
    exerciseId: '',
    frequency: 'Daily',
    time: '',
    startDate: '',
    days: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
    requestNotificationPermission();
    checkReminders();
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders]);

  // Check if any reminder should trigger now
  const checkReminders = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    reminders.forEach(reminder => {
      if (!reminder.isActive) return;

      const shouldNotify = reminder.time === currentTime && (
        reminder.frequency === 'Daily' ||
        (reminder.frequency === 'Weekly' && reminder.days.includes(currentDay)) ||
        (reminder.frequency === 'Custom' && reminder.days.includes(currentDay))
      );

      if (shouldNotify) {
        showNotification(reminder);
      }
    });
  };

  // Show browser notification
  const showNotification = (reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Mindfulness Reminder 🧘', {
        body: `Time for your ${reminder.exerciseTitle}!`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: reminder._id,
        requireInteraction: true
      });
    }
  };

  const fetchData = async () => {
    try {
      const [remindersData, exercisesData] = await Promise.all([
        reminderService.getReminders(),
        mindfulnessService.getExercises()
      ]);
      setReminders(remindersData.reminders);
      setExercises(exercisesData.mindfulnessExercises);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleExerciseSelect = (e) => {
    const exerciseId = e.target.value;
    const exercise = exercises.find(ex => ex._id === exerciseId);
    
    setFormData({
      ...formData,
      exerciseId,
      exerciseTitle: exercise ? exercise.title : ''
    });
  };

  const handleDayToggle = (day) => {
    const days = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    setFormData({ ...formData, days });
  };

  // Convert 24-hour time to 12-hour AM/PM format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.exerciseTitle || !formData.time || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Convert time to 12-hour format before sending
      const formattedData = {
        ...formData,
        time: convertTo12Hour(formData.time)
      };
      
      await reminderService.setReminder(formattedData);
      setSuccess('Reminder set successfully! 🎉');
      setShowForm(false);
      setFormData({
        exerciseTitle: '',
        exerciseId: '',
        frequency: 'Daily',
        time: '',
        startDate: '',
        days: []
      });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set reminder');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await reminderService.deleteReminder(id);
      setSuccess('Reminder deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete reminder');
    }
  };

  const toggleReminderStatus = async (reminder) => {
    try {
      await reminderService.updateReminder(reminder._id, {
        isActive: !reminder.isActive
      });
      fetchData();
    } catch (error) {
      setError('Failed to update reminder');
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
        <div className="col-md-8">
          <h1 className="fw-bold">Mindfulness Reminders</h1>
          <p className="text-muted">Set reminders to stay consistent with your practice</p>
        </div>
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            aria-label="Add new reminder"
          >
            {showForm ? 'Cancel' : '+ Add Reminder'}
          </button>
        </div>
      </div>

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

      {/* Add Reminder Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-4">Create New Reminder</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="exercise" className="form-label">
                  Select Exercise *
                </label>
                <select
                  className="form-select"
                  id="exercise"
                  value={formData.exerciseId}
                  onChange={handleExerciseSelect}
                  required
                  aria-required="true"
                >
                  <option value="">Choose an exercise...</option>
                  {exercises.map(exercise => (
                    <option key={exercise._id} value={exercise._id}>
                      {exercise.title} ({exercise.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="frequency" className="form-label">
                    Frequency *
                  </label>
                  <select
                    className="form-select"
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                    aria-required="true"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="startDate" className="form-label">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    aria-required="true"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="time" className="form-label">
                    Time *
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {formData.frequency === 'Custom' && (
                <div className="mb-3">
                  <label className="form-label">Select Days</label>
                  <div className="d-flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`btn ${formData.days.includes(day) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleDayToggle(day)}
                        aria-pressed={formData.days.includes(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary">
                Set Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-4">Your Reminders</h2>
          
          {reminders.length > 0 ? (
            <div className="list-group list-group-flush">
              {reminders.map(reminder => (
                <div key={reminder._id} className="list-group-item px-0 py-3">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={reminder.isActive}
                          onChange={() => toggleReminderStatus(reminder)}
                          aria-label={`Toggle ${reminder.exerciseTitle} reminder`}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <h3 className="h6 mb-1 fw-bold">{reminder.exerciseTitle}</h3>
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        <span className="badge bg-primary">{reminder.frequency}</span>
                        <span className="badge bg-secondary">⏰ {reminder.time}</span>
                        {reminder.days && reminder.days.length > 0 && (
                          <span className="badge bg-info">
                            {reminder.days.map(d => d.substring(0, 3)).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-auto">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(reminder._id)}
                        aria-label={`Delete ${reminder.exerciseTitle} reminder`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No reminders set yet</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Create Your First Reminder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
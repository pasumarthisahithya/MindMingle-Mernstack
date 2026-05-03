import React, { useEffect, useState } from 'react';
import { moodService } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MoodHistory() {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchMoodHistory();
  }, [days]);

  const fetchMoodHistory = async () => {
    try {
      const data = await moodService.getMoodHistory(days);
      setMoodHistory(data.moodHistory);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      'Very Happy': '😄',
      'Happy': '😊',
      'Calm': '😌',
      'Neutral': '😐',
      'Anxious': '😰',
      'Sad': '😢',
      'Very Sad': '😭',
      'Stressed': '😫'
    };
    return emojis[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const colors = {
      'Very Happy': '#10b981',
      'Happy': '#3b82f6',
      'Calm': '#6366f1',
      'Neutral': '#6b7280',
      'Anxious': '#f59e0b',
      'Sad': '#ef4444',
      'Very Sad': '#dc2626',
      'Stressed': '#8b5cf6'
    };
    return colors[mood] || '#6b7280';
  };

  // Create a single connected line for all moods with color-coded points
  const getMoodDatasets = () => {
    const reversedHistory = [...moodHistory].reverse();
    
    // Main mood intensity line (hidden from legend)
    const mainDataset = {
      label: 'Mood Intensity',
      data: reversedHistory.map(entry => entry.intensity),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      pointRadius: 8,
      pointHoverRadius: 10,
      borderWidth: 2,
      pointBackgroundColor: reversedHistory.map(entry => getMoodColor(entry.mood)),
      pointBorderColor: reversedHistory.map(entry => getMoodColor(entry.mood)),
      pointBorderWidth: 2,
      hidden: false,
      segment: {
        borderColor: ctx => {
          const prev = reversedHistory[ctx.p0DataIndex];
          const next = reversedHistory[ctx.p1DataIndex];
          // Use the mood color when connecting same mood, gray dashed when different
          if (prev?.mood === next?.mood) {
            return getMoodColor(prev.mood);
          } else {
            return '#9ca3af';
          }
        },
        borderDash: ctx => {
          const prev = reversedHistory[ctx.p0DataIndex];
          const next = reversedHistory[ctx.p1DataIndex];
          // Dashed line when mood type changes
          return prev?.mood !== next?.mood ? [5, 5] : [];
        }
      }
    };

    // Create legend-only entries for each mood type present in the data
    const moodTypes = ['Very Happy', 'Happy', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Very Sad', 'Stressed'];
    const presentMoods = new Set(moodHistory.map(entry => entry.mood));
    
    const legendDatasets = moodTypes
      .filter(mood => presentMoods.has(mood))
      .map(mood => ({
        label: `${getMoodEmoji(mood)} ${mood}`,
        data: [],
        borderColor: getMoodColor(mood),
        backgroundColor: getMoodColor(mood),
        pointRadius: 6,
        pointStyle: 'circle',
        borderWidth: 0,
        pointBorderWidth: 2,
        showLine: false
      }));

    return [mainDataset, ...legendDatasets];
  };

  // Prepare chart data
  const chartData = {
    labels: moodHistory.map(entry => entry.date).reverse(),
    datasets: getMoodDatasets()
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          filter: function(item, chart) {
            // Hide "Mood Intensity" from legend
            return item.text !== 'Mood Intensity';
          }
        },
        onClick: function(e, legendItem, legend) {
          // Disable legend click functionality
          return false;
        }
      },
      title: {
        display: true,
        text: 'Mood Intensity Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const entry = [...moodHistory].reverse()[context.dataIndex];
            return [
              `${getMoodEmoji(entry.mood)} ${entry.mood}`,
              `Intensity: ${context.parsed.y}/10`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Intensity Level'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
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
          <h1 className="fw-bold">Mood History</h1>
          <p className="text-muted">Track your emotional journey over time</p>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select" 
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            aria-label="Select time period"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      {moodHistory.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Mood entries list */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-4">Recent Entries</h2>
          
          {moodHistory.length > 0 ? (
            <div className="list-group list-group-flush">
              {moodHistory.map((entry, index) => (
                <div key={entry.id || index} className="list-group-item px-0 py-3">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="display-4">{getMoodEmoji(entry.mood)}</div>
                    </div>
                    <div className="col">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <h3 className="h6 mb-1 fw-bold">{entry.mood}</h3>
                          <small className="text-muted">{entry.date}</small>
                        </div>
                        <span className="badge bg-primary rounded-pill">
                          {entry.intensity}/10
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="mb-2 text-muted small">{entry.notes}</p>
                      )}
                      {entry.activities && entry.activities.length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {entry.activities.map((activity, idx) => (
                            <span key={idx} className="badge bg-secondary">
                              {activity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No mood entries found</p>
              <a href="/mood-tracker" className="btn btn-primary">
                Track Your First Mood
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MoodHistory;
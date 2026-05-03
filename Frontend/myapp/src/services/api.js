import axios from 'axios';

//const API_URL = '/api/v1';
const API_URL = 'http://localhost:5000/api/v1';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth services
export const authService = {
  signup: async (name, email, password, userType, specialization, licenseNumber) => {
    const signupData = { name, email, password };
    
    if (userType) {
      signupData.userType = userType;
    }
    
    if (userType === 'practitioner' && specialization && licenseNumber) {
      signupData.specialization = specialization;
      signupData.licenseNumber = licenseNumber;
    }
    
    const response = await axios.post(`${API_URL}/auth/signup`, signupData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Mindfulness exercises services
export const mindfulnessService = {
  getExercises: async () => {
    const response = await axios.get(`${API_URL}/mindfulness-exercises`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getExercise: async (id) => {
    const response = await axios.get(`${API_URL}/mindfulness-exercises/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Mood tracking services
export const moodService = {
  trackMood: async (moodData) => {
    const response = await axios.post(`${API_URL}/mood-tracking`, moodData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMoodHistory: async (days = 30) => {
    const response = await axios.get(`${API_URL}/mood-history?days=${days}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMoodStats: async () => {
    const response = await axios.get(`${API_URL}/mood-tracking/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getTodayMood: async () => {
    const response = await axios.get(`${API_URL}/mood-tracking/today`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getRecommendedExercises: async (mood) => {
    const response = await axios.get(`${API_URL}/mood-tracking/recommendations?mood=${mood}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Peer support services
export const peerSupportService = {
  sendMessage: async (message, supportType) => {
    const response = await axios.post(`${API_URL}/peer-support/connect`, 
      { message, supportType }, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getMessages: async (limit = 50, supportType = null) => {
    const url = supportType 
      ? `${API_URL}/peer-support/messages?limit=${limit}&supportType=${supportType}`
      : `${API_URL}/peer-support/messages?limit=${limit}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Reminder services
export const reminderService = {
  setReminder: async (reminderData) => {
    const response = await axios.post(`${API_URL}/reminders`, reminderData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getReminders: async () => {
    const response = await axios.get(`${API_URL}/reminders`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateReminder: async (id, reminderData) => {
    const response = await axios.put(`${API_URL}/reminders/${id}`, reminderData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteReminder: async (id) => {
    const response = await axios.delete(`${API_URL}/reminders/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Goal services
export const goalService = {
  createGoal: async (goalData) => {
    const response = await axios.post(`${API_URL}/goals`, goalData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getGoals: async () => {
    const response = await axios.get(`${API_URL}/goals`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateGoal: async (id, goalData) => {
    const response = await axios.put(`${API_URL}/goals/${id}`, goalData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await axios.delete(`${API_URL}/goals/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Professional help services
export const professionalHelpService = {
  checkMoodSuggestion: async () => {
    const response = await axios.get(`${API_URL}/professional-help/check-mood`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getPractitioners: async () => {
    const response = await axios.get(`${API_URL}/professional-help/practitioners`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
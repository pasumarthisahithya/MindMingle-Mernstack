import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

//const API_URL = '/api/v1';
const API_URL = 'http://localhost:5000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function ProfessionalHelp() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [practitioners, setPractitioners] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [moodSuggestion, setMoodSuggestion] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'practitioners', 'chat'
  const [currentUser, setCurrentUser] = useState(null);
  const [isPractitioner, setIsPractitioner] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    const isPrac = userData?.userType === 'practitioner';
    setIsPractitioner(isPrac);
    fetchData(isPrac);
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
      setView('chat');
    }
  }, [chatId]);

  const fetchData = async (isPrac) => {
    try {
      const requests = [
        axios.get(`${API_URL}/professional-help/chats`, { headers: getAuthHeader() })
      ];

      // Only fetch practitioners and mood check for regular users
      if (!isPrac) {
        requests.push(
          axios.get(`${API_URL}/professional-help/practitioners`, { headers: getAuthHeader() }),
          axios.get(`${API_URL}/professional-help/check-mood`, { headers: getAuthHeader() })
        );
      }

      const responses = await Promise.all(requests);
      
      console.log('Chats data:', responses[0].data.chats);
      setChats(responses[0].data.chats);
      
      if (!isPrac) {
        setPractitioners(responses[1].data.practitioners);
        setMoodSuggestion(responses[2].data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchChat = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/professional-help/chat/${id}`, {
        headers: getAuthHeader()
      });
      setCurrentChat(response.data.chat);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const startNewChat = async (practitionerId) => {
    try {
      const response = await axios.post(
        `${API_URL}/professional-help/chat/${practitionerId}`,
        {},
        { headers: getAuthHeader() }
      );
      
      setCurrentChat(response.data.chat);
      setView('chat');
      navigate(`/professional-help/${response.data.chat._id}`);
      fetchData(isPractitioner);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `${API_URL}/professional-help/chat/${currentChat._id}/message`,
        { message: newMessage },
        { headers: getAuthHeader() }
      );

      setNewMessage('');
      fetchChat(currentChat._id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const openChat = (chat) => {
    setCurrentChat(chat);
    setView('chat');
    navigate(`/professional-help/${chat._id}`);
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
      <div className="row">
        <div className="col">
          <h1 className="fw-bold mb-3">
            {isPractitioner ? '👥 Patient Conversations' : '🏥 Professional Help'}
          </h1>
          <p className="text-muted mb-4">
            {isPractitioner 
              ? 'Manage your patient conversations and provide support'
              : 'Connect with licensed mental health professionals'
            }
          </p>

          {/* Mood-based suggestion banner - only for regular users */}
          {!isPractitioner && moodSuggestion?.needsHelp && (
            <div className="alert alert-warning border-0 shadow-sm mb-4" role="alert">
              <h5 className="alert-heading">💚 We're here for you</h5>
              <p className="mb-0">{moodSuggestion.message}</p>
            </div>
          )}

          {view === 'list' && (
            <>
              {/* Navigation Buttons - only for regular users */}
              {!isPractitioner && (
                <div className="d-flex gap-3 mb-4">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setView('practitioners')}
                  >
                    Browse Practitioners
                  </button>
                </div>
              )}

              {/* Existing Chats */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-3">
                    {isPractitioner ? 'Patient Conversations' : 'Your Conversations'}
                  </h2>
                  
                  {chats.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {chats.map((chat) => {
                        const displayName = isPractitioner 
                          ? (chat.userId?.name || 'Unknown Patient')
                          : (chat.practitionerId?.name || 'Practitioner');
                        const displayInfo = isPractitioner
                          ? chat.userId?.email || ''
                          : chat.practitionerId?.specialization || '';
                        
                        return (
                          <button
                            key={chat._id}
                            className="list-group-item list-group-item-action border-0 p-3"
                            onClick={() => openChat(chat)}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h5 className="mb-1">
                                  {isPractitioner ? displayName : `Dr. ${displayName}`}
                                </h5>
                                {displayInfo && (
                                  <p className="mb-1 text-muted small">
                                    {displayInfo}
                                  </p>
                                )}
                                {chat.messages && chat.messages.length > 0 && (
                                  <p className="mb-0 text-muted small">
                                    Last message: {new Date(chat.lastMessageAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">
                        {isPractitioner 
                          ? 'No patient conversations yet. Patients will be able to reach out to you.'
                          : 'No conversations yet'
                        }
                      </p>
                      {!isPractitioner && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => setView('practitioners')}
                        >
                          Start Your First Conversation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {view === 'practitioners' && !isPractitioner && (
            <div>
              <button 
                className="btn btn-outline-secondary mb-4"
                onClick={() => setView('list')}
              >
                ← Back to Conversations
              </button>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-3">Available Practitioners</h2>
                  
                  {practitioners.length > 0 ? (
                    <div className="row g-4">
                      {practitioners.map((practitioner) => (
                        <div key={practitioner._id} className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                     style={{ width: '50px', height: '50px', fontSize: '24px' }}>
                                  👨‍⚕️
                                </div>
                                <div>
                                  <h5 className="mb-0">Dr. {practitioner.name}</h5>
                                  <small className="text-muted">{practitioner.specialization}</small>
                                </div>
                              </div>
                              <button
                                className="btn btn-primary w-100"
                                onClick={() => startNewChat(practitioner._id)}
                              >
                                Start Conversation
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No practitioners available at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'chat' && currentChat && (
            <div>
              <button 
                className="btn btn-outline-secondary mb-4"
                onClick={() => {
                  setView('list');
                  setCurrentChat(null);
                  navigate('/professional-help');
                }}
              >
                ← Back to Conversations
              </button>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white p-3">
                  <h5 className="mb-0">
                    💬 {isPractitioner 
                      ? currentChat.userId?.name || 'Patient'
                      : `Dr. ${currentChat.practitionerId?.name || 'Practitioner'}`
                    }
                  </h5>
                  {!isPractitioner && (
                    <small>
                      {currentChat.practitionerId?.specialization || ''}
                    </small>
                  )}
                </div>
                <div className="card-body p-0">
                  <div 
                    className="p-4" 
                    style={{ 
                      height: '500px', 
                      overflowY: 'auto',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {currentChat.messages.length > 0 ? (
                      currentChat.messages.map((msg, index) => {
                        const isMyMessage = isPractitioner 
                          ? msg.senderType === 'practitioner'
                          : msg.senderType === 'user';
                        
                        return (
                          <div 
                            key={index}
                            className={`mb-3 d-flex ${isMyMessage ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div 
                              className={`p-3 rounded ${
                                isMyMessage
                                  ? 'bg-primary text-white' 
                                  : 'bg-white border'
                              }`}
                              style={{ maxWidth: '70%' }}
                            >
                              <p className="mb-1">{msg.message}</p>
                              <small className={isMyMessage ? 'text-white-50' : 'text-muted'}>
                                {new Date(msg.timestamp).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-white p-3">
                  <form onSubmit={sendMessage}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        maxLength="2000"
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="alert alert-info border-0 mt-3">
                <small>
                  <strong>Privacy Note:</strong> Your conversations are confidential and stored securely.
                  In case of emergency, please call your local emergency services.
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessionalHelp;
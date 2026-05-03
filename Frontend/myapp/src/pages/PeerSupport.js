import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { peerSupportService } from '../services/api';

function PeerSupport() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [supportType, setSupportType] = useState('general');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [viewMode, setViewMode] = useState('group'); // 'group' or 'private'
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });

    const userData = JSON.parse(localStorage.getItem('user'));
    const userId = userData?.id;
    setCurrentUserId(userId);

    newSocket.on('connect', () => {
      console.log('Connected to support room');
      newSocket.emit('join-support', { userId, supportType });
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    // Listen for active users
    newSocket.on('active-users', (users) => {
      // Filter out current user and add avatars
      const otherUsers = users.filter(u => u.userId !== userId).map((user, index) => ({
        ...user,
        avatar: ['🧘', '🌟', '💙', '🌈', '☀️', '🌸', '🦋', '🌺', '✨', '🌼'][index % 10]
      }));
      setActiveUsers(otherUsers);
    });

    // Listen for private messages
    newSocket.on('private-message', ({ from, message, timestamp, senderExperience }) => {
      setPrivateMessages(prev => ({
        ...prev,
        [from]: [...(prev[from] || []), { message, timestamp, from, senderExperience }]
      }));
    });

    setSocket(newSocket);

    // Fetch existing messages
    fetchMessages();

    return () => {
      newSocket.close();
    };
  }, [supportType]);

  const fetchMessages = async () => {
    try {
      const data = await peerSupportService.getMessages(50);
      setMessages(data.messages.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    if (newMessage.length > 1000) {
      alert('Message cannot exceed 1000 characters');
      return;
    }

    setSending(true);

    try {
      if (viewMode === 'private' && selectedUser) {
        // Send private message via socket
        socket.emit('private-message', {
          to: selectedUser.userId,
          message: newMessage,
          senderExperience: supportType
        });
        
        // Add to local state
        setPrivateMessages(prev => ({
          ...prev,
          [selectedUser.userId]: [
            ...(prev[selectedUser.userId] || []),
            {
              message: newMessage,
              timestamp: new Date().toISOString(),
              from: currentUserId,
              senderExperience: supportType,
              isSent: true
            }
          ]
        }));
      } else {
        // Send group message
        await peerSupportService.sendMessage(newMessage, supportType);
      }
      
      setNewMessage('');
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      setSending(false);
    }
  };

  const startPrivateChat = (user) => {
    setSelectedUser(user);
    setViewMode('private');
  };

  const backToGroup = () => {
    setViewMode('group');
    setSelectedUser(null);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Active Users Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">👥 Active Users ({activeUsers.length})</h6>
            </div>
            <div className="card-body p-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {activeUsers.length > 0 ? (
                <div className="list-group list-group-flush">
                  {activeUsers.map((user, index) => (
                    <button
                      key={index}
                      className={`list-group-item list-group-item-action border-0 ${selectedUser?.userId === user.userId ? 'active' : ''}`}
                      onClick={() => startPrivateChat(user)}
                    >
                      <div className="d-flex align-items-center">
                        <span className="fs-3 me-2">{user.avatar}</span>
                        <div className="flex-grow-1">
                          <div className="fw-bold small">{user.anonymousName}</div>
                          {user.experience && (
                            <small className="text-muted text-capitalize">
                              {user.experience}
                            </small>
                          )}
                        </div>
                        {privateMessages[user.userId]?.length > 0 && (
                          <span className="badge bg-danger rounded-pill">
                            {privateMessages[user.userId].length}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <small className="text-muted">No other users online</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {viewMode === 'private' && selectedUser ? (
                    <>
                      <button 
                        className="btn btn-sm btn-light me-3"
                        onClick={backToGroup}
                      >
                        ← Back
                      </button>
                      <span className="fs-4">{selectedUser.avatar}</span>
                      <span className="ms-2 fw-bold">Private Chat with {selectedUser.anonymousName}</span>
                    </>
                  ) : (
                    <>
                      <h1 className="h4 mb-2 fw-bold">💬 Group Support Chat</h1>
                      <p className="mb-0 small">
                        Connect with others in a safe, anonymous environment
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              {/* Support Type Selector - Only in group mode */}
              {viewMode === 'group' && (
                <div className="p-3 border-bottom bg-light">
                  <label className="form-label small fw-bold mb-2">Shared Experience:</label>
                  <select 
                    className="form-select form-select-sm"
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value)}
                    aria-label="Select support topic"
                  >
                    <option value="general">General Support</option>
                    <option value="anxiety">Anxiety</option>
                    <option value="depression">Depression</option>
                    <option value="stress">Stress</option>
                    <option value="relationships">Relationships</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Messages Area */}
              <div 
                className="p-4" 
                style={{ 
                  height: '400px', 
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa'
                }}
                role="log"
                aria-label="Support messages"
              >
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading messages...</span>
                    </div>
                  </div>
                ) : viewMode === 'private' && selectedUser ? (
                  // Private messages
                  <div className="d-flex flex-column-reverse">
                    {(privateMessages[selectedUser.userId] || []).map((msg, index) => (
                      <div 
                        key={index} 
                        className={`card mb-3 border-0 shadow-sm ${msg.isSent ? 'ms-auto' : ''}`}
                        style={{ maxWidth: '75%' }}
                      >
                        <div className={`card-body ${msg.isSent ? 'bg-primary text-white' : ''}`}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-secondary">
                              {msg.isSent ? 'You' : selectedUser.anonymousName}
                            </span>
                            <small className={msg.isSent ? 'text-white-50' : 'text-muted'}>
                              {formatTimestamp(msg.timestamp)}
                            </small>
                          </div>
                          <p className="mb-0">{msg.message}</p>
                          {msg.senderExperience && (
                            <span className={`badge mt-2 ${msg.isSent ? 'bg-light text-dark' : 'bg-primary'}`}>
                              {msg.senderExperience}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!privateMessages[selectedUser.userId] || privateMessages[selectedUser.userId].length === 0) && (
                      <div className="text-center py-5">
                        <p className="text-muted">
                          Start a private conversation with {selectedUser.anonymousName}
                        </p>
                        <p className="text-muted small">
                          🔒 Your identities remain anonymous. Connect based on shared experiences.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Group messages
                  messages.length > 0 ? (
                    <div className="d-flex flex-column-reverse">
                      {messages.map((msg, index) => (
                        <div 
                          key={msg.id || index} 
                          className="card mb-3 border-0 shadow-sm"
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className="badge bg-secondary">Anonymous User</span>
                              <small className="text-muted">
                                {formatTimestamp(msg.timestamp)}
                              </small>
                            </div>
                            <p className="mb-2">{msg.message}</p>
                            {msg.supportType && (
                              <span className="badge bg-primary text-capitalize">
                                {msg.supportType}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No messages yet. Be the first to share!</p>
                    </div>
                  )
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 border-top">
                <form onSubmit={handleSendMessage}>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share your thoughts or offer support... (Max 1000 characters)"
                      maxLength="1000"
                      aria-label="Message input"
                      required
                    ></textarea>
                    <div className="form-text text-end">
                      {newMessage.length}/1000 characters
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      🔒 Your identity remains anonymous
                    </small>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={sending || !newMessage.trim()}
                      aria-label="Send message"
                    >
                      {sending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card-footer bg-light p-3">
              <small className="text-muted">
                <strong>Guidelines:</strong> Be respectful, supportive, and kind. This is a safe space for everyone.
                If you're in crisis, please contact a professional helpline.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerSupport;
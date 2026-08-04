import React from 'react';

function App() {
  const isLoggedIn = localStorage.getItem('token');

  if (!isLoggedIn) {
    // Load login page
    return <LoginScreen />;
  }

  // Load chat page
  return <ChatScreen />;
}

// Simple router - no extra library needed
function LoginScreen() {
  return React.createElement(require('./screens/Auth/LoginScreen').default);
}

function ChatScreen() {
  return React.createElement(require('./screens/Chats/ChatListScreen').default);
}

export default App;

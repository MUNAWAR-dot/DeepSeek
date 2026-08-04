import React, { useState } from 'react';

const API_URL = 'https://chatsapp-api.onrender.com/api';

function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { email, password }
        : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/chats';
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
          </div>
          <h1 style={styles.appName}>ChatsApp</h1>
          <p style={styles.tagline}>Connect with friends and family</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={styles.subtitle}>
            {isLogin ? 'Login to continue' : 'Join ChatsApp today'}
          </p>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <span style={styles.icon}>👤</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <span style={styles.icon}>📧</span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.icon}>🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <div style={styles.toggle}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {setIsLogin(!isLogin); setError('');}}
              style={styles.toggleButton}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          🔒 Secure & Encrypted
        </p>
      </div>
    </div>
  );
}

// 💫 BEAUTIFUL STYLES
const styles = {
  body: {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #075E54 0%, #128C7E 50%, #25D366 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '20px',
  },

  logoContainer: {
    textAlign: 'center',
    marginBottom: '30px',
    animation: 'fadeIn 0.8s ease',
  },

  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #25D366, #128C7E)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },

  appName: {
    color: 'white',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    margin: 0,
  },

  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '35px 30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(10px)',
    animation: 'slideUp 0.6s ease',
  },

  title: {
    color: '#075E54',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 5px',
    textAlign: 'center',
  },

  subtitle: {
    color: '#667781',
    fontSize: '14px',
    margin: '0 0 25px',
    textAlign: 'center',
  },

  errorBox: {
    background: '#FFF3F3',
    color: '#D32F2F',
    padding: '12px 15px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #FFCDD2',
    animation: 'shake 0.5s ease',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#F5F7FA',
    borderRadius: '12px',
    border: '2px solid #E8EDF2',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },

  icon: {
    padding: '0 15px',
    fontSize: '18px',
  },

  input: {
    flex: 1,
    padding: '15px 15px 15px 0',
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    color: '#333',
    outline: 'none',
  },

  button: {
    background: 'linear-gradient(135deg, #25D366, #128C7E)',
    color: 'white',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 5px 15px rgba(37, 211, 102, 0.3)',
    transition: 'all 0.3s ease',
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },

  toggle: {
    textAlign: 'center',
    marginTop: '25px',
    color: '#667781',
    fontSize: '14px',
  },

  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#25D366',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '5px',
    padding: 0,
  },

  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    marginTop: '20px',
  },
};

// Add animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  input:focus {
    border-color: #25D366 !important;
    background: white !important;
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
  }
  
  button:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default LoginScreen;

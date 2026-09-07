import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-orb" />
        <div className="login-bg-orb" />
        <div className="login-bg-orb" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Activity size={28} color="white" />
          </div>
          <h2>MedConnect</h2>
          <p>Healthcare Information Exchange</p>
        </div>

        {error && (
          <div className="login-error" id="login-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
            id="btn-login"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-demo">
          <h4>Demo Accounts</h4>
          <div className="demo-credentials">
            <button
              className="demo-btn"
              onClick={() => fillDemo('admin@medconnect.com', 'admin123')}
              id="demo-admin"
            >
              👑 Admin
            </button>
            <button
              className="demo-btn"
              onClick={() => fillDemo('dr.smith@medconnect.com', 'doctor123')}
              id="demo-doctor"
            >
              🩺 Doctor
            </button>
            <button
              className="demo-btn"
              onClick={() => fillDemo('nurse.jones@medconnect.com', 'nurse123')}
              id="demo-nurse"
            >
              💉 Nurse
            </button>
            <button
              className="demo-btn"
              onClick={() => fillDemo('reception@medconnect.com', 'reception123')}
              id="demo-receptionist"
            >
              🏥 Receptionist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

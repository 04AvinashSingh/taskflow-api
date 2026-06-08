// ═══════════════════════════════════════════
// Login Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { authAPI } from '../api/axios.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await authAPI.login({
        email: form.email.trim(),
        password: form.password,
      });

      login(data.data.token, data.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="auth-page">
      {/* Left side: Form Panel */}
      <div className="auth-panel-left">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span>TaskFlow</span>
            </h1>
            <p className="auth-subtitle">Welcome back. Enter your details.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                className={`form-input${errors.email ? ' error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
                autoFocus
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className={`form-input${errors.password ? ' error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
              id="login-submit"
            >
              {loading && <span className="spinner" style={{ marginRight: '8px' }} />}
              Sign In
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one for free</Link>
          </div>
        </div>
      </div>

      {/* Right side: Modern Utility Brand Presentation Panel */}
      <div className="auth-panel-right">
        <div className="showcase-container">
          <h2 className="showcase-headline">Streamline your software workflow.</h2>
          <p className="showcase-subhead">A workspace built for developer velocity and task coordination.</p>
          
          <div className="showcase-board">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>active_sprint.json</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
              </div>
            </div>

            <div className="showcase-row">
              <span className="showcase-dot" style={{ background: 'var(--color-success)' }}></span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Connect database backend</span>
                <div className="showcase-text-line" style={{ width: '40%' }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>DONE</span>
            </div>

            <div className="showcase-row" style={{ background: 'rgba(99, 102, 241, 0.03)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
              <span className="showcase-dot" style={{ background: 'var(--color-info)' }}></span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>Redesign user experience</span>
                <div className="showcase-text-line" style={{ width: '70%' }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-info)', fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}>IN_PROGRESS</span>
            </div>

            <div className="showcase-row">
              <span className="showcase-dot" style={{ background: 'var(--color-warning)' }}></span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add full API validation suite</span>
                <div className="showcase-text-line" style={{ width: '30%' }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>PENDING</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

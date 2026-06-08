// ═══════════════════════════════════════════
// Navbar Component
// ═══════════════════════════════════════════

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
    : '?';

  const initialsText = initials
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/dashboard" className="navbar-brand">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>TaskFlow</span>
      </Link>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{initialsText}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.8125rem', lineHeight: '1.2' }}>
              {user?.name}
            </div>
            <div style={{ display: 'flex' }}>
              <span className={`badge badge-${isAdmin ? 'admin' : 'user'}`}>
                {user?.role === 'ADMIN' ? 'admin' : 'member'}
              </span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          id="logout-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

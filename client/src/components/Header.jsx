import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Search, Bell, X } from 'lucide-react';

const pageNames = {
  '/': 'Dashboard',
  '/patients': 'Patient Records',
  '/appointments': 'Appointments',
  '/exchanges': 'Clinical Exchange',
  '/providers': 'Provider Directory',
  '/audit': 'Audit Logs',
};

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const socketCtx = useSocket();
  const notifications = socketCtx?.notifications || [];

  const pageName = pageNames[location.pathname] || 'MedConnect';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <div>
          <div className="header-title">{pageName}</div>
          <div className="header-subtitle">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search patients, records..."
            id="header-search-input"
          />
        </div>

        <button className="header-icon-btn" id="btn-notifications" title="Notifications">
          <Bell size={18} />
          {notifications.length > 0 && <span className="notification-dot" />}
        </button>
      </div>

      {/* Toast notifications */}
      {notifications.length > 0 && (
        <div className="toast-container">
          {notifications.map((notif) => (
            <div key={notif.id} className={`toast toast-${notif.type}`}>
              <span>{notif.message}</span>
              <button
                className="toast-close"
                onClick={() => socketCtx?.clearNotification(notif.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;

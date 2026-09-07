import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ArrowLeftRight,
  Building2,
  Shield,
  Activity,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      section: 'Main',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/patients', icon: Users, label: 'Patients' },
        { to: '/appointments', icon: Calendar, label: 'Appointments' },
      ],
    },
    {
      section: 'Exchange',
      items: [
        { to: '/exchanges', icon: ArrowLeftRight, label: 'Clinical Exchange', roles: ['admin', 'doctor', 'nurse', 'lab_technician'] },
        { to: '/providers', icon: Building2, label: 'Providers' },
      ],
    },
    {
      section: 'Administration',
      items: [
        { to: '/audit', icon: Shield, label: 'Audit Logs', roles: ['admin'] },
      ],
    },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Activity size={20} />
        </div>
        <div className="sidebar-brand-text">
          <h1>MedConnect</h1>
          <p>Health Exchange</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.some((role) => hasRole(role))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{getInitials(user?.name)}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
        </div>
        <button
          className="btn-ghost btn-icon"
          onClick={logout}
          title="Logout"
          id="btn-logout"
          style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

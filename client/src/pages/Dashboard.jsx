import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Calendar, ArrowLeftRight, Building2, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity'),
      ]);
      setStats(statsRes.data.data);
      setActivity(activityRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const chartData = stats?.appointmentsByDay?.map((d) => ({
    date: format(parseISO(d._id), 'MMM dd'),
    appointments: d.count,
  })) || [];

  const getActionColor = (action) => {
    const colors = {
      LOGIN: 'blue',
      CREATE: 'green',
      UPDATE: 'amber',
      DELETE: 'red',
      READ: 'purple',
      EXCHANGE: 'blue',
      STATUS_CHANGE: 'amber',
    };
    return colors[action] || 'blue';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
          <p style={{ color: 'var(--color-accent-primary)', fontSize: '0.9rem', fontWeight: 700 }}>
            {payload[0].value} appointments
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue" id="stat-patients">
          <div className="stat-info">
            <h3>Total Patients</h3>
            <div className="stat-value">{stats?.totalPatients || 0}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} />
              +{stats?.newPatientsThisWeek || 0} this week
            </div>
          </div>
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card green" id="stat-appointments">
          <div className="stat-info">
            <h3>Today's Appointments</h3>
            <div className="stat-value">{stats?.todayAppointments || 0}</div>
            <div className="stat-change positive">
              <Calendar size={12} />
              {stats?.appointmentsThisWeek || 0} this week
            </div>
          </div>
          <div className="stat-icon green">
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card amber" id="stat-exchanges">
          <div className="stat-info">
            <h3>Pending Exchanges</h3>
            <div className="stat-value">{stats?.pendingExchanges || 0}</div>
            <div className="stat-change negative">
              <Clock size={12} />
              Awaiting review
            </div>
          </div>
          <div className="stat-icon amber">
            <ArrowLeftRight size={24} />
          </div>
        </div>

        <div className="stat-card purple" id="stat-providers">
          <div className="stat-info">
            <h3>Active Providers</h3>
            <div className="stat-value">{stats?.activeProviders || 0}</div>
            <div className="stat-change positive">
              <Building2 size={12} />
              {stats?.totalUsers || 0} staff members
            </div>
          </div>
          <div className="stat-icon purple">
            <Building2 size={24} />
          </div>
        </div>
      </div>

      {/* Chart + Activity */}
      <div className="grid-2">
        {/* Appointments Chart */}
        <div className="card" id="appointments-chart">
          <div className="card-header">
            <div>
              <div className="card-title">Appointments Overview</div>
              <div className="card-subtitle">Last 7 days activity</div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAppts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Calendar size={36} />
              <p>No appointment data yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card" id="recent-activity">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Activity</div>
              <div className="card-subtitle">System audit trail</div>
            </div>
          </div>
          <div className="activity-list" style={{ maxHeight: 280, overflowY: 'auto' }}>
            {activity.length > 0 ? (
              activity.slice(0, 15).map((item, i) => (
                <div className="activity-item" key={item._id || i}>
                  <div className={`activity-dot ${getActionColor(item.action)}`} />
                  <div>
                    <div className="activity-text">
                      <strong>{item.userName || 'System'}</strong>{' '}
                      {item.action.toLowerCase().replace('_', ' ')} on{' '}
                      <strong>{item.resource}</strong>
                    </div>
                    <div className="activity-time">
                      {item.timestamp
                        ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                        : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

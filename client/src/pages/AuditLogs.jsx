import { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Search, Filter, Download } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const actionColors = {
  LOGIN: 'badge-info',
  LOGOUT: 'badge-default',
  CREATE: 'badge-success',
  READ: 'badge-purple',
  UPDATE: 'badge-warning',
  DELETE: 'badge-danger',
  EXCHANGE: 'badge-info',
  STATUS_CHANGE: 'badge-warning',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, resourceFilter]);

  const loadLogs = async () => {
    try {
      const params = { page, limit: 25 };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;

      const res = await api.get('/audit', { params });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Load audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csv = [
      'Timestamp,User,Role,Action,Resource,Details,IP Address',
      ...logs.map((log) =>
        `"${log.timestamp}","${log.userName || ''}","${log.userRole || ''}","${log.action}","${log.resource}","${log.details || ''}","${log.ipAddress || ''}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / 25);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={exportLogs} id="btn-export-logs">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select className="filter-select" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} id="filter-audit-action">
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="CREATE">Create</option>
          <option value="READ">Read</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="EXCHANGE">Exchange</option>
          <option value="STATUS_CHANGE">Status Change</option>
        </select>
        <select className="filter-select" value={resourceFilter} onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }} id="filter-audit-resource">
          <option value="">All Resources</option>
          <option value="Auth">Auth</option>
          <option value="Patient">Patient</option>
          <option value="Appointment">Appointment</option>
          <option value="Exchange">Exchange</option>
          <option value="ClinicalExchange">Clinical Exchange</option>
          <option value="Provider">Provider</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {total} total records
        </div>
      </div>

      {/* Audit Table */}
      <div className="data-table-wrapper">
        <table className="data-table" id="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log._id}>
                <td>
                  <div className="text-primary" style={{ fontSize: '0.8rem' }}>
                    {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy') : '—'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {log.timestamp ? format(new Date(log.timestamp), 'hh:mm:ss a') : ''}
                  </div>
                </td>
                <td className="text-primary">{log.userName || '—'}</td>
                <td>
                  <span className="badge badge-default" style={{ textTransform: 'capitalize' }}>
                    {log.userRole?.replace('_', ' ') || '—'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${actionColors[log.action] || 'badge-default'}`}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{log.resource}</td>
                <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                  {log.details || '—'}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {log.ipAddress || '—'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Shield size={36} />
                    <h3>No audit logs found</h3>
                    <p>Adjust your filters to see audit entries</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                className={`pagination-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            );
          })}
          <button
            className="pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

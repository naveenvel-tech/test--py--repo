import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Plus, ArrowRight, FileText, Send, Eye, CheckCircle,
  XCircle, Clock, AlertTriangle, Filter, ArrowLeftRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const docTypeLabels = {
  'lab-report': { label: 'Lab Report', icon: '🔬' },
  prescription: { label: 'Prescription', icon: '💊' },
  'discharge-summary': { label: 'Discharge Summary', icon: '📋' },
  imaging: { label: 'Imaging', icon: '🩻' },
  referral: { label: 'Referral', icon: '📨' },
};

const statusStyles = {
  pending: 'badge-warning',
  sent: 'badge-info',
  received: 'badge-purple',
  reviewed: 'badge-success',
  rejected: 'badge-danger',
};

const priorityStyles = {
  routine: 'badge-default',
  urgent: 'badge-warning',
  stat: 'badge-danger',
};

const ClinicalExchange = () => {
  const { hasRole } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [providers, setProviders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient: '', fromProvider: '', toProvider: '',
    documentType: 'lab-report', subject: '', content: '', priority: 'routine',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const [exRes, provRes, patRes] = await Promise.all([
        api.get('/exchanges', { params }),
        api.get('/providers'),
        api.get('/patients', { params: { limit: 100 } }),
      ]);
      setExchanges(exRes.data.data);
      setProviders(provRes.data.data);
      setPatients(patRes.data.data);
    } catch (err) {
      console.error('Load exchanges error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exchanges', formData);
      setShowForm(false);
      setFormData({ patient: '', fromProvider: '', toProvider: '', documentType: 'lab-report', subject: '', content: '', priority: 'routine' });
      loadData();
    } catch (err) {
      console.error('Create exchange error:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/exchanges/${id}/status`, { status });
      loadData();
      setShowDetail(false);
    } catch (err) {
      console.error('Update exchange status error:', err);
    }
  };

  const viewExchange = (exchange) => {
    setSelectedExchange(exchange);
    setShowDetail(true);
  };

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
        <h1>Clinical Exchange</h1>
        {hasRole('admin', 'doctor', 'lab_technician') && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-exchange">
              <Plus size={18} /> New Exchange
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="filter-exchange-status">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
          <option value="reviewed">Reviewed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} id="filter-exchange-priority">
          <option value="">All Priorities</option>
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
          <option value="stat">STAT</option>
        </select>
      </div>

      {/* Exchange Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {exchanges.length > 0 ? exchanges.map((ex) => (
          <div key={ex._id} className="exchange-card" onClick={() => viewExchange(ex)}>
            <div className="exchange-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>{docTypeLabels[ex.documentType]?.icon || '📄'}</span>
                  <span className="exchange-card-title">{ex.subject}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span className={`badge ${statusStyles[ex.status]}`}>{ex.status}</span>
                  <span className={`badge ${priorityStyles[ex.priority]}`}>{ex.priority}</span>
                  <span className="badge badge-default">{docTypeLabels[ex.documentType]?.label || ex.documentType}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                {ex.createdAt ? formatDistanceToNow(new Date(ex.createdAt), { addSuffix: true }) : ''}
              </div>
            </div>

            <div className="exchange-flow">
              <span style={{ fontWeight: 500 }}>{ex.fromProvider?.name || 'Unknown'}</span>
              <ArrowRight size={16} />
              <span style={{ fontWeight: 500 }}>{ex.toProvider?.name || 'Unknown'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <span>Patient: <strong style={{ color: 'var(--color-text-secondary)' }}>{ex.patient?.firstName} {ex.patient?.lastName}</strong></span>
              <span style={{ marginLeft: 'auto' }}>By: {ex.requestedBy?.name}</span>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <ArrowLeftRight size={36} />
            <h3>No exchanges found</h3>
            <p>Create a new clinical exchange to share data between providers</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Exchange Details" size="lg">
        {selectedExchange && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>{docTypeLabels[selectedExchange.documentType]?.icon}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedExchange.subject}</h3>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <span className={`badge ${statusStyles[selectedExchange.status]}`}>{selectedExchange.status}</span>
              <span className={`badge ${priorityStyles[selectedExchange.priority]}`}>{selectedExchange.priority}</span>
            </div>

            <div className="exchange-flow" style={{ padding: '14px 16px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>FROM</div>
                <div style={{ fontWeight: 600 }}>{selectedExchange.fromProvider?.name}</div>
              </div>
              <ArrowRight size={20} style={{ color: 'var(--color-accent-primary)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>TO</div>
                <div style={{ fontWeight: 600 }}>{selectedExchange.toProvider?.name}</div>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Content</div>
              <div style={{ background: 'var(--color-bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                {selectedExchange.content}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <div className="detail-field" style={{ flex: 1 }}>
                <div className="detail-field-label">Patient</div>
                <div className="detail-field-value">{selectedExchange.patient?.firstName} {selectedExchange.patient?.lastName} ({selectedExchange.patient?.mrn})</div>
              </div>
              <div className="detail-field" style={{ flex: 1 }}>
                <div className="detail-field-label">Requested By</div>
                <div className="detail-field-value">{selectedExchange.requestedBy?.name}</div>
              </div>
            </div>

            {hasRole('admin', 'doctor', 'lab_technician') && selectedExchange.status !== 'reviewed' && selectedExchange.status !== 'rejected' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                {selectedExchange.status === 'pending' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(selectedExchange._id, 'received')}>
                    <Eye size={14} /> Mark Received
                  </button>
                )}
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(selectedExchange._id, 'reviewed')}>
                  <CheckCircle size={14} /> Mark Reviewed
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(selectedExchange._id, 'rejected')}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Exchange Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Clinical Exchange"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} id="btn-send-exchange">
              <Send size={16} /> Send Exchange
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select className="form-select" value={formData.patient} onChange={(e) => setFormData({ ...formData, patient: e.target.value })} required>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Provider *</label>
              <select className="form-select" value={formData.fromProvider} onChange={(e) => setFormData({ ...formData, fromProvider: e.target.value })} required>
                <option value="">Select source</option>
                {providers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To Provider *</label>
              <select className="form-select" value={formData.toProvider} onChange={(e) => setFormData({ ...formData, toProvider: e.target.value })} required>
                <option value="">Select destination</option>
                {providers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Document Type *</label>
              <select className="form-select" value={formData.documentType} onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}>
                <option value="lab-report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="discharge-summary">Discharge Summary</option>
                <option value="imaging">Imaging</option>
                <option value="referral">Referral</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select className="form-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input className="form-input" placeholder="Brief subject line" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea className="form-textarea" placeholder="Clinical content..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required style={{ minHeight: 140 }} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClinicalExchange;

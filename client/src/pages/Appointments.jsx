import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Plus, Search, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, User, Filter
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

const statusConfig = {
  scheduled: { badge: 'badge-info', icon: Calendar },
  confirmed: { badge: 'badge-purple', icon: CheckCircle },
  'in-progress': { badge: 'badge-warning', icon: Clock },
  completed: { badge: 'badge-success', icon: CheckCircle },
  cancelled: { badge: 'badge-danger', icon: XCircle },
  'no-show': { badge: 'badge-default', icon: AlertTriangle },
};

const typeConfig = {
  consultation: 'badge-info',
  'follow-up': 'badge-purple',
  procedure: 'badge-warning',
  'lab-test': 'badge-success',
  emergency: 'badge-danger',
};

const Appointments = () => {
  const { hasRole } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient: '', doctor: '', dateTime: '', duration: 30,
    type: 'consultation', reason: '', roomNumber: '',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const [apptRes, patRes] = await Promise.all([
        api.get('/appointments', { params }),
        api.get('/patients', { params: { limit: 100 } }),
      ]);
      setAppointments(apptRes.data.data);
      setPatients(patRes.data.data);

      try {
        const usersRes = await api.get('/auth/users');
        setDoctors(usersRes.data.data.filter((u) => u.role === 'doctor'));
      } catch {
        setDoctors([]);
      }
    } catch (err) {
      console.error('Load appointments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      setShowForm(false);
      setFormData({ patient: '', doctor: '', dateTime: '', duration: 30, type: 'consultation', reason: '', roomNumber: '' });
      loadData();
    } catch (err) {
      console.error('Create appointment error:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      loadData();
    } catch (err) {
      console.error('Update status error:', err);
    }
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
        <h1>Appointments</h1>
        {hasRole('admin', 'doctor', 'nurse', 'receptionist') && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-add-appointment">
              <Plus size={18} /> Schedule Appointment
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="filter-appt-status">
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
        <input
          type="date"
          className="filter-select"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          id="filter-appt-date"
          style={{ cursor: 'pointer' }}
        />
        {(statusFilter || dateFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>
            <XCircle size={14} /> Clear
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div className="data-table-wrapper">
        <table className="data-table" id="appointments-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? appointments.map((appt) => {
              const apptDate = new Date(appt.dateTime);
              const isApptToday = isToday(apptDate);
              const config = statusConfig[appt.status] || statusConfig.scheduled;

              return (
                <tr key={appt._id} style={isApptToday ? { background: 'var(--color-accent-glow)' } : {}}>
                  <td>
                    <div className="text-primary" style={{ fontWeight: 600 }}>
                      {format(apptDate, 'MMM dd, yyyy')}
                      {isApptToday && <span className="badge badge-info" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Today</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                      {format(apptDate, 'hh:mm a')}
                    </div>
                  </td>
                  <td className="text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</td>
                  <td style={{ fontSize: '0.82rem' }}>{appt.doctor?.name || '—'}</td>
                  <td><span className={`badge ${typeConfig[appt.type] || 'badge-default'}`}>{appt.type}</span></td>
                  <td>{appt.duration} min</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.reason}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{appt.roomNumber || '—'}</td>
                  <td><span className={`badge ${config.badge}`}>{appt.status}</span></td>
                  <td>
                    {hasRole('admin', 'doctor', 'nurse', 'receptionist') && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {appt.status === 'scheduled' && (
                          <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(appt._id, 'confirmed')} title="Confirm" style={{ color: 'var(--color-purple)' }}>
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {(appt.status === 'confirmed' || appt.status === 'scheduled') && (
                          <>
                            <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(appt._id, 'completed')} title="Complete" style={{ color: 'var(--color-success)' }}>
                              <CheckCircle size={14} />
                            </button>
                            <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(appt._id, 'cancelled')} title="Cancel" style={{ color: 'var(--color-danger)' }}>
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <Calendar size={36} />
                    <h3>No appointments found</h3>
                    <p>Try adjusting your filters or schedule a new appointment</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Schedule New Appointment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} id="btn-save-appointment">Schedule</button>
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
          <div className="form-group">
            <label className="form-label">Doctor *</label>
            <select className="form-select" value={formData.doctor} onChange={(e) => setFormData({ ...formData, doctor: e.target.value })} required>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input type="datetime-local" className="form-input" value={formData.dateTime} onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <select className="form-select" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="procedure">Procedure</option>
                <option value="lab-test">Lab Test</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room</label>
              <input className="form-input" placeholder="e.g. R-101" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason *</label>
            <textarea className="form-textarea" placeholder="Reason for appointment..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required style={{ minHeight: 80 }} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;

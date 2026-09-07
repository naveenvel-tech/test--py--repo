import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Search, Plus, Eye, Edit2, Trash2, Heart, Thermometer,
  Droplets, Activity, X, User, Phone, Mail, MapPin
} from 'lucide-react';
import { format } from 'date-fns';

const Patients = () => {
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodGroup: '',
    contactInfo: { phone: '', email: '', address: { street: '', city: '', state: '', zip: '' } },
    emergencyContact: { name: '', relationship: '', phone: '' },
  });

  useEffect(() => {
    loadPatients();
  }, [search, genderFilter, bloodFilter]);

  const loadPatients = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (genderFilter) params.gender = genderFilter;
      if (bloodFilter) params.bloodGroup = bloodFilter;
      const res = await api.get('/patients', { params });
      setPatients(res.data.data);
    } catch (err) {
      console.error('Load patients error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewPatient = async (id) => {
    try {
      const res = await api.get(`/patients/${id}`);
      setSelectedPatient(res.data.data);
      setShowModal(true);
    } catch (err) {
      console.error('View patient error:', err);
    }
  };

  const openCreateForm = () => {
    setEditPatient(null);
    setFormData({
      firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodGroup: '',
      contactInfo: { phone: '', email: '', address: { street: '', city: '', state: '', zip: '' } },
      emergencyContact: { name: '', relationship: '', phone: '' },
    });
    setShowForm(true);
  };

  const openEditForm = (patient) => {
    setEditPatient(patient);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'yyyy-MM-dd') : '',
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || '',
      contactInfo: patient.contactInfo || { phone: '', email: '', address: { street: '', city: '', state: '', zip: '' } },
      emergencyContact: patient.emergencyContact || { name: '', relationship: '', phone: '' },
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editPatient) {
        await api.put(`/patients/${editPatient._id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      setShowForm(false);
      loadPatients();
    } catch (err) {
      console.error('Save patient error:', err);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this patient record?')) return;
    try {
      await api.delete(`/patients/${id}`);
      loadPatients();
    } catch (err) {
      console.error('Delete patient error:', err);
    }
  };

  const getVitalStatus = (value, type) => {
    if (!value) return 'badge-default';
    if (type === 'heartRate') return value > 100 || value < 60 ? 'badge-danger' : 'badge-success';
    if (type === 'temp') return value > 99.5 ? 'badge-warning' : 'badge-success';
    if (type === 'o2') return value < 95 ? 'badge-danger' : 'badge-success';
    return 'badge-default';
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
        <h1>Patient Records</h1>
        {hasRole('admin', 'doctor', 'nurse', 'receptionist') && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={openCreateForm} id="btn-add-patient">
              <Plus size={18} /> Add Patient
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, MRN, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="patient-search"
          />
        </div>
        <select className="filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} id="filter-gender">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select className="filter-select" value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)} id="filter-blood">
          <option value="">All Blood Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* Patient Table */}
      <div className="data-table-wrapper">
        <table className="data-table" id="patients-table">
          <thead>
            <tr>
              <th>MRN</th>
              <th>Patient Name</th>
              <th>Age / Gender</th>
              <th>Blood Group</th>
              <th>Contact</th>
              <th>Doctor</th>
              <th>Vitals</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? patients.map((patient) => (
              <tr key={patient._id}>
                <td className="text-primary" style={{ fontFamily: 'monospace' }}>{patient.mrn}</td>
                <td className="text-primary">{patient.firstName} {patient.lastName}</td>
                <td>
                  {patient.age || '—'} / <span style={{ textTransform: 'capitalize' }}>{patient.gender}</span>
                </td>
                <td>
                  {patient.bloodGroup ? (
                    <span className="badge badge-danger" style={{ gap: 2 }}>
                      <Droplets size={10} /> {patient.bloodGroup}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ fontSize: '0.8rem' }}>{patient.contactInfo?.phone || '—'}</td>
                <td style={{ fontSize: '0.8rem' }}>{patient.assignedDoctor?.name || '—'}</td>
                <td>
                  {patient.vitals?.heartRate ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span className={`badge ${getVitalStatus(patient.vitals.heartRate, 'heartRate')}`}>
                        ❤ {patient.vitals.heartRate}
                      </span>
                      <span className={`badge ${getVitalStatus(patient.vitals.oxygenSaturation, 'o2')}`}>
                        O₂ {patient.vitals.oxygenSaturation}%
                      </span>
                    </div>
                  ) : (
                    <span className="badge badge-default">No vitals</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => viewPatient(patient._id)} title="View">
                      <Eye size={15} />
                    </button>
                    {hasRole('admin', 'doctor', 'nurse', 'receptionist') && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEditForm(patient)} title="Edit">
                        <Edit2 size={15} />
                      </button>
                    )}
                    {hasRole('admin') && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deletePatient(patient._id)} title="Delete" style={{ color: 'var(--color-danger)' }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <Users size={36} />
                    <h3>No patients found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Patient Details" size="lg">
        {selectedPatient && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: '1rem' }}>
                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span className="badge badge-info">{selectedPatient.mrn}</span>
                  <span className="badge badge-default">{selectedPatient.age} yrs</span>
                  <span className="badge badge-default" style={{ textTransform: 'capitalize' }}>{selectedPatient.gender}</span>
                  {selectedPatient.bloodGroup && <span className="badge badge-danger"><Droplets size={10} /> {selectedPatient.bloodGroup}</span>}
                </div>
              </div>
            </div>

            <div className="detail-panel">
              <div>
                <div className="detail-section">
                  <div className="detail-section-title">Contact Information</div>
                  <div className="detail-field">
                    <div className="detail-field-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone</div>
                    <div className="detail-field-value">{selectedPatient.contactInfo?.phone}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email</div>
                    <div className="detail-field-value">{selectedPatient.contactInfo?.email || '—'}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Address</div>
                    <div className="detail-field-value">
                      {selectedPatient.contactInfo?.address ?
                        `${selectedPatient.contactInfo.address.street}, ${selectedPatient.contactInfo.address.city}, ${selectedPatient.contactInfo.address.state} ${selectedPatient.contactInfo.address.zip}` : '—'}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-section-title">Emergency Contact</div>
                  <div className="detail-field">
                    <div className="detail-field-label">Name / Relationship</div>
                    <div className="detail-field-value">{selectedPatient.emergencyContact?.name} ({selectedPatient.emergencyContact?.relationship})</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Phone</div>
                    <div className="detail-field-value">{selectedPatient.emergencyContact?.phone}</div>
                  </div>
                </div>

                {selectedPatient.allergies?.length > 0 && (
                  <div className="detail-section">
                    <div className="detail-section-title">Allergies</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedPatient.allergies.map((a, i) => (
                        <span key={i} className={`badge ${a.severity === 'severe' ? 'badge-danger' : a.severity === 'moderate' ? 'badge-warning' : 'badge-info'}`}>
                          {a.name} ({a.severity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                {selectedPatient.vitals && (
                  <div className="detail-section">
                    <div className="detail-section-title">Latest Vitals</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="card" style={{ padding: 14, textAlign: 'center' }}>
                        <Heart size={16} style={{ color: 'var(--color-danger)', marginBottom: 4 }} />
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPatient.vitals.heartRate || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Heart Rate</div>
                      </div>
                      <div className="card" style={{ padding: 14, textAlign: 'center' }}>
                        <Activity size={16} style={{ color: 'var(--color-info)', marginBottom: 4 }} />
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPatient.vitals.bloodPressure || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Blood Pressure</div>
                      </div>
                      <div className="card" style={{ padding: 14, textAlign: 'center' }}>
                        <Thermometer size={16} style={{ color: 'var(--color-warning)', marginBottom: 4 }} />
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPatient.vitals.temperature || '—'}°F</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Temperature</div>
                      </div>
                      <div className="card" style={{ padding: 14, textAlign: 'center' }}>
                        <Droplets size={16} style={{ color: 'var(--color-success)', marginBottom: 4 }} />
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPatient.vitals.oxygenSaturation || '—'}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>O₂ Saturation</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPatient.medicalHistory?.length > 0 && (
                  <div className="detail-section">
                    <div className="detail-section-title">Medical History</div>
                    {selectedPatient.medicalHistory.map((h, i) => (
                      <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.condition}</span>
                          <span className={`badge ${h.status === 'active' ? 'badge-warning' : h.status === 'resolved' ? 'badge-success' : 'badge-info'}`}>{h.status}</span>
                        </div>
                        {h.notes && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>{h.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatient.currentMedications?.length > 0 && (
                  <div className="detail-section">
                    <div className="detail-section-title">Current Medications</div>
                    {selectedPatient.currentMedications.map((m, i) => (
                      <div key={i} style={{ marginBottom: 8, fontSize: '0.82rem' }}>
                        <strong>{m.name}</strong> — {m.dosage}, {m.frequency}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editPatient ? 'Edit Patient' : 'Add New Patient'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} id="btn-save-patient">
              {editPatient ? 'Update' : 'Create'} Patient
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-input" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" value={formData.contactInfo.phone} onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={formData.contactInfo.email} onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, email: e.target.value } })} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Patients;

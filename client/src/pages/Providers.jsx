import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Plus, Building2, Phone, Mail, Clock, MapPin, Users,
  Globe, Search, Edit2, Trash2
} from 'lucide-react';

const typeStyles = {
  hospital: { badge: 'badge-info', label: 'Hospital' },
  clinic: { badge: 'badge-success', label: 'Clinic' },
  lab: { badge: 'badge-purple', label: 'Lab' },
  pharmacy: { badge: 'badge-warning', label: 'Pharmacy' },
  'imaging-center': { badge: 'badge-default', label: 'Imaging Center' },
};

const Providers = () => {
  const { hasRole } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProvider, setEditProvider] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'hospital', phone: '', email: '', website: '',
    description: '', staffCount: 0, specialties: '',
    address: { street: '', city: '', state: '', zip: '' },
  });

  useEffect(() => {
    loadProviders();
  }, [typeFilter, search]);

  const loadProviders = async () => {
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const res = await api.get('/providers', { params });
      setProviders(res.data.data);
    } catch (err) {
      console.error('Load providers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditProvider(null);
    setFormData({ name: '', type: 'hospital', phone: '', email: '', website: '', description: '', staffCount: 0, specialties: '', address: { street: '', city: '', state: '', zip: '' } });
    setShowForm(true);
  };

  const openEditForm = (prov) => {
    setEditProvider(prov);
    setFormData({
      name: prov.name, type: prov.type, phone: prov.phone, email: prov.email,
      website: prov.website || '', description: prov.description || '',
      staffCount: prov.staffCount || 0,
      specialties: (prov.specialties || []).join(', '),
      address: prov.address || { street: '', city: '', state: '', zip: '' },
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      specialties: formData.specialties.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editProvider) {
        await api.put(`/providers/${editProvider._id}`, data);
      } else {
        await api.post('/providers', data);
      }
      setShowForm(false);
      loadProviders();
    } catch (err) {
      console.error('Save provider error:', err);
    }
  };

  const deleteProvider = async (id) => {
    if (!window.confirm('Deactivate this provider?')) return;
    try {
      await api.delete(`/providers/${id}`);
      loadProviders();
    } catch (err) {
      console.error('Delete provider error:', err);
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
        <h1>Provider Directory</h1>
        {hasRole('admin') && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={openCreateForm} id="btn-add-provider">
              <Plus size={18} /> Add Provider
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
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="provider-search"
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} id="filter-provider-type">
          <option value="">All Types</option>
          <option value="hospital">Hospital</option>
          <option value="clinic">Clinic</option>
          <option value="lab">Lab</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="imaging-center">Imaging Center</option>
        </select>
      </div>

      {/* Provider Cards */}
      <div className="provider-grid">
        {providers.length > 0 ? providers.map((prov) => {
          const style = typeStyles[prov.type] || typeStyles.hospital;
          return (
            <div key={prov._id} className="provider-card">
              <div className={`provider-card-type badge ${style.badge}`}>
                {style.label}
              </div>
              <div className="provider-card-name">{prov.name}</div>
              {prov.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  {prov.description}
                </div>
              )}

              {prov.specialties?.length > 0 && (
                <div className="provider-card-specialties">
                  {prov.specialties.slice(0, 4).map((s, i) => <span key={i}>{s}</span>)}
                  {prov.specialties.length > 4 && (
                    <span style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                      +{prov.specialties.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="provider-card-detail">
                <Phone size={14} /> {prov.phone}
              </div>
              <div className="provider-card-detail">
                <Mail size={14} /> {prov.email}
              </div>
              <div className="provider-card-detail">
                <MapPin size={14} />
                {prov.address ? `${prov.address.city}, ${prov.address.state}` : 'N/A'}
              </div>
              <div className="provider-card-detail">
                <Clock size={14} /> Weekdays: {prov.operatingHours?.weekdays || 'N/A'}
              </div>
              <div className="provider-card-detail">
                <Users size={14} /> {prov.staffCount} staff members
              </div>

              {hasRole('admin') && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(prov)}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteProvider(prov._id)}>
                    <Trash2 size={14} /> Deactivate
                  </button>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <Building2 size={36} />
            <h3>No providers found</h3>
            <p>Add healthcare providers to the directory</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editProvider ? 'Edit Provider' : 'Add New Provider'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} id="btn-save-provider">
              {editProvider ? 'Update' : 'Create'} Provider
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="lab">Lab</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="imaging-center">Imaging Center</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Specialties (comma-separated)</label>
            <input className="form-input" placeholder="Cardiology, Neurology, ..." value={formData.specialties} onChange={(e) => setFormData({ ...formData, specialties: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: 70 }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Staff Count</label>
              <input type="number" className="form-input" value={formData.staffCount} onChange={(e) => setFormData({ ...formData, staffCount: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Providers;

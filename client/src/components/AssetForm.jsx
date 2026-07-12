import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';

/**
 * Reusable Asset Form Component
 * Used for both Asset Registration and Asset Edit panels.
 */
const AssetForm = ({ initialData, onSubmit, loading, error }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    model: '',
    category: '',
    department: '',
    purchaseDate: '',
    cost: '',
    status: 'Available',
    assignedTo: '',
    description: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Dropdown lists
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Load dropdown lists on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      // Fetch categories
      try {
        const catRes = await api.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories for dropdown:', err);
      }

      // Fetch departments
      try {
        const deptRes = await api.get('/departments');
        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments);
        }
      } catch (err) {
        console.error('Error fetching departments for dropdown:', err);
      }

      // Fetch employees
      try {
        const empRes = await api.get('/users');
        if (empRes.data.success) {
          setEmployees(empRes.data.users);
        }
      } catch (err) {
        console.error('Error fetching employees for dropdown:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        serialNumber: initialData.serialNumber || '',
        model: initialData.model || '',
        category: initialData.category?._id || initialData.category || '',
        department: initialData.department?._id || initialData.department || '',
        purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
        cost: initialData.cost || '',
        status: initialData.status || 'Available',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        description: initialData.description || ''
      });

      if (initialData.image) {
        setImagePreview(`${API_BASE_URL}${initialData.image}`);
      }
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Compile into FormData to support multipart file upload
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      let val = formData[key];
      if (typeof val === 'string') {
        val = val.trim();
        if (key === 'serialNumber') {
          val = val.toUpperCase();
        }
      }
      if (val !== '') {
        data.append(key, val);
      }
    });

    if (imageFile) {
      data.append('image', imageFile);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '13px' 
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Asset Name *</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. MacBook Pro M3"
            value={formData.name}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
            required
          />
        </div>

        {/* Serial Number */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Serial Number *</label>
          <input
            type="text"
            name="serialNumber"
            placeholder="e.g. SN-0982-X"
            value={formData.serialNumber}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Model */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Model</label>
          <input
            type="text"
            name="model"
            placeholder="e.g. A2941"
            value={formData.model}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          />
        </div>

        {/* Cost */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Cost (₹)</label>
          <input
            type="number"
            name="cost"
            placeholder="e.g. 1999"
            min="0"
            step="any"
            value={formData.cost}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Department *</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Purchase Date */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Purchase Date</label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          />
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Assigned To Employee (only display if status is 'Assigned') */}
      {formData.status === 'Assigned' && (
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Assigned Employee *</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Description</label>
        <textarea
          name="description"
          placeholder="Additional features, details..."
          value={formData.description}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', resize: 'vertical', minHeight: '80px', outline: 'none' }}
        />
      </div>

      {/* Image selector */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Asset Image</label>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ color: 'var(--text)' }}
          />
          {imagePreview && (
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: '#000' }}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => navigate('/assets')}
          style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="counter"
          style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          {loading ? 'Submitting...' : 'Save Asset'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;

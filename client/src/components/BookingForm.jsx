import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BookingForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    asset: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [localError, setLocalError] = useState(null);

  const getMinDateTimeString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/assets?limit=100');
        if (res.data.success) {
          const bookableCategories = ['meeting rooms', 'vehicles', 'projectors', 'conference rooms'];
          const filtered = res.data.assets.filter((asset) => {
            const catName = asset.category?.name?.toLowerCase() || '';
            return bookableCategories.some((bc) => catName.includes(bc));
          });
          setAssets(filtered);
        }
      } catch (err) {
        console.error('Error fetching assets for booking:', err);
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (val) => {
    setFormData({ ...formData, asset: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();

    if (start < now) {
      setLocalError('Start date/time cannot be in the past.');
      return;
    }

    if (end <= start) {
      setLocalError('End date/time must be strictly after the start date/time.');
      return;
    }

    onSubmit(formData);
  };

  const minDateTime = getMinDateTimeString();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {(localError || error) && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {localError || error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Select Resource <span className="text-destructive">*</span></Label>
        <Select 
          value={formData.asset} 
          onValueChange={handleSelectChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingAssets ? 'Loading resources...' : 'Select a Meeting Room, Vehicle, or Device'} />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset._id} value={asset._id}>
                {asset.name} ({asset.category?.name} - S/N: {asset.serialNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Start Date & Time <span className="text-destructive">*</span></Label>
        <Input
          type="datetime-local"
          name="startDate"
          min={minDateTime}
          value={formData.startDate}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>End Date & Time <span className="text-destructive">*</span></Label>
        <Input
          type="datetime-local"
          name="endDate"
          min={formData.startDate || minDateTime}
          value={formData.endDate}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Purpose of Reservation <span className="text-destructive">*</span></Label>
        <Textarea
          name="purpose"
          placeholder="e.g. Weekly Sync, Client Pitch meeting..."
          value={formData.purpose}
          onChange={handleInputChange}
          className="resize-none"
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Confirming...' : 'Book Resource'}
        </Button>
      </div>
    </form>
  );
}

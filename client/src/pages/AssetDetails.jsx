import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Image as ImageIcon, Box } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { toast } from 'react-hot-toast';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/assets/${id}`);
        if (res.data.success) {
          setAsset(res.data.asset);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch asset details');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/assets/${id}`);
      if (res.data.success) {
        toast.success('Asset deleted successfully');
        navigate('/assets');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl col-span-1" />
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="py-12">
        <EmptyState 
          icon={<Box className="w-8 h-8" />}
          title="Asset Not Found"
          description={error || "The asset you're looking for doesn't exist or you don't have permission to view it."}
          actionLabel="Back to Directory"
          onAction={() => navigate('/assets')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Header buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/assets')} className="gap-2 -ml-3">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Button>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/assets/${asset._id}/edit`)} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Asset
            </Button>
            <Button variant="destructive" variant="outline" onClick={() => setDeleteConfirmId(asset._id)} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Card Image */}
        <Card className="col-span-1 shadow-sm overflow-hidden">
          <div className="aspect-square bg-muted flex items-center justify-center p-6">
            {asset.image ? (
              <img 
                src={asset.image.startsWith('http') ? asset.image : `${API_BASE_URL}${asset.image}`} 
                alt={asset.name} 
                className="w-full h-full object-contain rounded-lg drop-shadow-md" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                <ImageIcon className="w-16 h-16 opacity-50" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}
          </div>
        </Card>

        {/* Specifications panel */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm font-bold text-primary uppercase tracking-wider">
                  {asset.category?.name || 'Unassigned Category'}
                </div>
                <StatusBadge status={asset.status} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {asset.name}
              </h1>
              <p className="text-sm font-mono text-muted-foreground mb-8 pb-8 border-b">
                Serial Number: {asset.serialNumber}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1">Model Number</span>
                  <span className="text-base text-foreground">{asset.model || '—'}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1">Corporate Department</span>
                  <span className="text-base text-foreground">{asset.department?.name} ({asset.department?.code})</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1">Purchase Cost</span>
                  <span className="text-base font-semibold text-foreground">{asset.cost ? `₹${asset.cost.toLocaleString('en-IN')}` : '₹0'}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1">Purchase Date</span>
                  <span className="text-base text-foreground">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}</span>
                </div>
              </div>

              {asset.description && (
                <div className="mt-8 pt-8 border-t">
                  <span className="block text-sm font-medium text-foreground mb-3">Asset Description</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allocation Details */}
          {asset.status === 'Assigned' && asset.assignedTo && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Current Allocation Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-sm font-medium text-muted-foreground mb-1">Employee Name</span>
                    <span className="text-base text-foreground">{asset.assignedTo.name}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-muted-foreground mb-1">Email</span>
                    <span className="text-base text-foreground">{asset.assignedTo.email}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-muted-foreground mb-1">Role</span>
                    <span className="text-base text-foreground">{asset.assignedTo.role}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-muted-foreground mb-1">Department</span>
                    <span className="text-base text-foreground">{asset.assignedTo.department || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Asset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

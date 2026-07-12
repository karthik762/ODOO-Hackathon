import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Image as ImageIcon, Box } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssetDirectory() {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'AssetManager';
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          api.get('/categories'),
          api.get('/departments')
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (deptRes.data.success) setDepartments(deptRes.data.departments);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchDropdownData();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        department: selectedDepartment === 'all' ? '' : selectedDepartment,
        status: selectedStatus === 'all' ? '' : selectedStatus,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const res = await api.get('/assets', { params });
      if (res.data.success) {
        setAssets(res.data.assets);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assets');
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, selectedDepartment, selectedStatus, currentPage]);

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/assets/${id}`);
      if (res.data.success) {
        toast.success('Asset deleted successfully');
        fetchAssets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Assets Inventory" 
        description="Browse corporate resource allocations, status, and department assignments."
        actions={
          canEdit && (
            <Button onClick={() => navigate('/assets/new')} className="gap-2">
              <Plus className="w-4 h-4" />
              Register Asset
            </Button>
          )
        }
      />

      {/* Filter panel */}
      <Card className="shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search assets..." 
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Grid container */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState 
          icon={<Box className="w-8 h-8" />}
          title="Error Loading Assets"
          description={error}
          actionLabel="Retry"
          onAction={fetchAssets}
        />
      ) : assets.length === 0 ? (
        <EmptyState 
          icon={<Box className="w-8 h-8" />}
          title="No assets found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <Card key={asset._id} className="overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col">
                <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden border-b">
                  {asset.image ? (
                    <img 
                      src={`${API_BASE_URL}${asset.image}`} 
                      alt={asset.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={asset.status} />
                  </div>
                </div>
                
                <CardHeader className="p-4 pb-2">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {asset.category?.name || 'Unassigned'}
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{asset.name}</CardTitle>
                  <p className="text-sm font-mono text-muted-foreground">S/N: {asset.serialNumber}</p>
                </CardHeader>
                
                <CardContent className="p-4 pt-2 flex-1">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2 border-t pt-3">
                    <div>
                      <span className="block text-xs font-medium text-foreground">Department</span>
                      {asset.department?.code || '—'}
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-foreground">Assigned To</span>
                      <span className="line-clamp-1">{asset.assignedTo?.name || '—'}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <Link to={`/assets/${asset._id}`}>Details</Link>
                  </Button>
                  {canEdit && (
                    <>
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <Link to={`/assets/${asset._id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(asset._id)} className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 border-transparent sm:border-border hover:border-destructive/20">
                        Delete
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium text-muted-foreground px-4">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

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
            <AlertDialogAction onClick={() => handleDelete(deleteConfirmId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

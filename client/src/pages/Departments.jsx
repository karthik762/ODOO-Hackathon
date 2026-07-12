import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Departments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentHead: '',
    status: 'active'
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return; 
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setEmployees(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      code: '',
      description: '',
      departmentHead: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditMode(true);
    setCurrentId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      departmentHead: dept.departmentHead?._id || '',
      status: dept.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        departmentHead: formData.departmentHead === '' ? null : formData.departmentHead
      };
      
      if (isEditMode) {
        const res = await api.put(`/departments/${currentId}`, payload);
        if (res.data.success) {
          toast.success('Department updated');
          setIsModalOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await api.post('/departments', payload);
        if (res.data.success) {
          toast.success('Department created');
          setIsModalOpen(false);
          fetchDepartments();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/departments/${id}`);
      if (res.data.success) {
        toast.success('Department deleted');
        fetchDepartments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Departments" 
        description="Manage organization units and assign department heads."
        actions={
          isAdmin && (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          )
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by code or name..." 
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <EmptyState 
            icon={<Building2 className="w-8 h-8" />}
            title="No departments found"
            description={search ? "We couldn't find any departments matching your search." : "Get started by adding a new department."}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((dept) => (
                  <TableRow key={dept._id} className="group">
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>
                      {dept.departmentHead?.name ? (
                        <span className="text-foreground">{dept.departmentHead.name}</span>
                      ) : (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {dept.description || '—'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        dept.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-muted text-muted-foreground border'
                      }`}>
                        {dept.status}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(dept)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirmId(dept._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} entries
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Department' : 'Create Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code <span className="text-destructive">*</span></Label>
              <Input
                id="code"
                placeholder="e.g. IT"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                disabled={isEditMode}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Information Technology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="head">Department Head</Label>
              <Select 
                value={formData.departmentHead} 
                onValueChange={(val) => setFormData({ ...formData, departmentHead: val === 'none' ? '' : val })}
              >
                <SelectTrigger id="head">
                  <SelectValue placeholder="Select Department Head" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {employees
                    .filter(emp => ['Admin', 'AssetManager', 'DepartmentHead'].includes(emp.role))
                    .map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role})
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Department details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Save Changes' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the department and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteConfirmId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Department
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

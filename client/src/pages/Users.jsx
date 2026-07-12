import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Users() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [statusConfirmUser, setStatusConfirmUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user directory');
      toast.error('Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success('User role updated');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userObj) => {
    const newStatus = userObj.status === 'active' ? 'inactive' : 'active';
    
    if (newStatus === 'inactive' && !statusConfirmUser) {
      setStatusConfirmUser(userObj);
      return;
    }

    try {
      const targetUserId = statusConfirmUser?._id || userObj._id;
      const res = await api.patch(`/users/${targetUserId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`User account ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
        setStatusConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
      setStatusConfirmUser(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const getRoleStyle = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'AssetManager':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DepartmentHead':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Employees Directory" 
        description="Manage staff roles, verify departments, and toggle accounts access status."
      />

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or role..." 
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
            icon={<UsersIcon className="w-8 h-8" />}
            title="No users found"
            description={search ? "We couldn't find any users matching your search." : "No users exist in the system yet."}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Role Badge</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right">Actions / Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((u) => {
                  const isSelf = currentUser?._id === u._id;
                  
                  return (
                    <TableRow key={u._id} className="group">
                      <TableCell className="font-medium">
                        {u.name}
                        {isSelf && <span className="ml-2 text-xs text-muted-foreground font-normal italic">(You)</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleStyle(u.role)}`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Select
                            value={u.role}
                            onValueChange={(val) => handleRoleChange(u._id, val)}
                            disabled={isSelf}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="AssetManager">Asset Manager</SelectItem>
                              <SelectItem value="DepartmentHead">Department Head</SelectItem>
                              <SelectItem value="Employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant={u.status === 'active' ? 'destructive' : 'outline'}
                            size="sm"
                            className={`h-8 text-xs w-[80px] ${
                              u.status === 'active' 
                                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-transparent' 
                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent hover:text-emerald-500'
                            }`}
                            onClick={() => handleStatusToggle(u)}
                            disabled={isSelf}
                          >
                            {u.status === 'active' ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
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

      <AlertDialog open={!!statusConfirmUser} onOpenChange={(open) => !open && setStatusConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable <strong>{statusConfirmUser?.name}</strong> ({statusConfirmUser?.email})? 
              This user will be immediately blocked from logging into AssetFlow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleStatusToggle(statusConfirmUser)} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disable Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

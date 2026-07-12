import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MaintenanceTimeline from '../components/MaintenanceTimeline';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PenTool, Plus, X, Trash2, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Maintenance() {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicketId, setSelectedTicketId] = useState(null); 
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    asset: '',
    title: '',
    description: '',
    priority: 'Medium'
  });

  const [resolveTicketId, setResolveTicketId] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveData, setResolveData] = useState({
    cost: '',
    notes: ''
  });

  const [rejectConfirmId, setRejectConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve maintenance tickets');
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets?limit=100');
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.error('Error loading assets list:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAssets();
  }, []);

  const handleOpenForm = () => {
    setFormError(null);
    setFormData({ asset: '', title: '', description: '', priority: 'Medium' });
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await api.post('/maintenance', formData);
      if (res.data.success) {
        toast.success('Maintenance request submitted');
        setIsFormOpen(false);
        fetchTickets();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.patch(`/maintenance/${id}/approve`);
      if (res.data.success) {
        toast.success('Ticket approved for repair');
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve operation failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.patch(`/maintenance/${id}/reject`);
      if (res.data.success) {
        toast.success('Ticket rejected');
        setRejectConfirmId(null);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject operation failed');
    } finally {
      setActionLoadingId(null);
      setRejectConfirmId(null);
    }
  };

  const handleResolveOpen = (id) => {
    setResolveTicketId(id);
    setResolveData({ cost: '', notes: '' });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setResolveLoading(true);
    try {
      const res = await api.patch(`/maintenance/${resolveTicketId}/resolve`, resolveData);
      if (res.data.success) {
        toast.success('Ticket resolved successfully');
        setResolveTicketId(null);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resolve operation failed');
    } finally {
      setResolveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.delete(`/maintenance/${id}`);
      if (res.data.success) {
        toast.success('Ticket deleted');
        setDeleteConfirmId(null);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setActionLoadingId(null);
      setDeleteConfirmId(null);
    }
  };

  const activeTickets = tickets.filter(t => t.status === 'Pending' || t.status === 'Approved');
  const historyTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Rejected');

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const approvedCount = tickets.filter((t) => t.status === 'Approved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const totalCost = tickets.reduce((sum, t) => sum + (t.cost || 0), 0);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: 
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const renderTable = (data) => {
    if (loading) {
      return (
        <div className="p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <EmptyState 
          icon={<PenTool className="w-8 h-8" />}
          title="No tickets found"
          description="There are no maintenance tickets in this queue."
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Details</TableHead>
              <TableHead>Issue / Title</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((t) => {
              const isSelected = selectedTicketId === t._id;
              
              return (
                <TableRow
                  key={t._id}
                  onClick={() => setSelectedTicketId(isSelected ? null : t._id)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-muted/50' : ''}`}
                >
                  <TableCell>
                    <div className="font-medium">{t.asset?.name}</div>
                    <div className="text-xs text-muted-foreground">S/N: {t.asset?.serialNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">{t.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityStyle(t.priority)}`}>
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.reportedBy?.name}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      t.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      t.status === 'Rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2 items-center">
                      {t.status === 'Pending' && isPrivileged && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(t._id)}
                            disabled={actionLoadingId === t._id}
                            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent hover:text-emerald-500 h-8 text-xs"
                          >
                            {actionLoadingId === t._id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectConfirmId(t._id)}
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-transparent h-8 text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {t.status === 'Approved' && isPrivileged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveOpen(t._id)}
                          className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent hover:text-primary h-8 text-xs"
                        >
                          Resolve
                        </Button>
                      )}

                      {isPrivileged && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(t._id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Maintenance Center" 
        description="Submit tickets, monitor hardware repairs, and audit maintenance history log files."
        actions={
          <Button onClick={handleOpenForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Raise Request
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Requests</span>
          </div>
          <h3 className="text-3xl font-bold text-amber-500">{pendingCount}</h3>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Under Repair</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-500">{approvedCount}</h3>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resolved Issues</span>
          </div>
          <h3 className="text-3xl font-bold text-emerald-500">{resolvedCount}</h3>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Total Expenditure</span>
          <h3 className="text-3xl font-bold text-foreground">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <Tabs defaultValue="active" onValueChange={() => setSelectedTicketId(null)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Queue (Pending / Repair)</TabsTrigger>
          <TabsTrigger value="history">History Archive (Resolved / Rejected)</TabsTrigger>
        </TabsList>

        <div className={`grid gap-6 ${selectedTicketId ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} transition-all duration-300`}>
          <div className={`bg-card border rounded-lg shadow-sm overflow-hidden ${selectedTicketId ? 'lg:col-span-2' : ''}`}>
            <TabsContent value="active" className="m-0 border-0 p-0">
              {renderTable(activeTickets)}
            </TabsContent>
            <TabsContent value="history" className="m-0 border-0 p-0">
              {renderTable(historyTickets)}
            </TabsContent>
          </div>

          {selectedTicketId && (
            <div className="bg-card border rounded-lg shadow-sm p-6 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-300">
              {(() => {
                const ticket = tickets.find((t) => t._id === selectedTicketId);
                if (!ticket) return null;
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-foreground">Ticket Details</h3>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTicketId(null)} className="h-8 w-8">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-sm flex flex-col gap-3 pb-6 border-b">
                      <div><strong className="text-foreground">Asset Resource:</strong> <span className="text-muted-foreground">{ticket.asset?.name} ({ticket.asset?.serialNumber})</span></div>
                      <div><strong className="text-foreground">Priority Level:</strong> <span className="text-muted-foreground">{ticket.priority}</span></div>
                      <div><strong className="text-foreground">Reported:</strong> <span className="text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</span></div>
                      {ticket.status === 'Resolved' && (
                        <>
                          <div><strong className="text-foreground">Expenditure cost:</strong> <span className="font-semibold text-emerald-500">${ticket.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                          <div><strong className="text-foreground">Resolved:</strong> <span className="text-muted-foreground">{new Date(ticket.resolvedAt).toLocaleString()}</span></div>
                        </>
                      )}
                    </div>

                    <div className="py-2">
                      <MaintenanceTimeline status={ticket.status} />
                    </div>

                    {ticket.notes && (
                      <div className="pt-4 border-t">
                        <strong className="block text-sm font-medium text-foreground mb-2">Resolution Comments</strong>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ticket.notes}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report Issue / Raise Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            {formError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Target Asset <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.asset} 
                onValueChange={(val) => setFormData({ ...formData, asset: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Asset Item" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a._id} value={a._id}>{a.name} (S/N: {a.serialNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Issue Title <span className="text-destructive">*</span></Label>
              <Input
                name="title"
                placeholder="e.g. Cracked screen, Broken battery..."
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description of Issue</Label>
              <Textarea
                name="description"
                placeholder="Explain issue details..."
                value={formData.description}
                onChange={handleInputChange}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(val) => setFormData({ ...formData, priority: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resolveTicketId} onOpenChange={(open) => !open && setResolveTicketId(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Resolve Maintenance Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResolveSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Repair Cost ($)</Label>
              <Input
                type="number"
                placeholder="e.g. 120.00"
                value={resolveData.cost}
                onChange={(e) => setResolveData({ ...resolveData, cost: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Notes about repair, replaced parts..."
                value={resolveData.notes}
                onChange={(e) => setResolveData({ ...resolveData, notes: e.target.value })}
                className="resize-none"
                rows={4}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setResolveTicketId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resolveLoading}>
                {resolveLoading ? 'Resolving...' : 'Confirm Resolved'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!rejectConfirmId} onOpenChange={(open) => !open && setRejectConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this request? The status will update to Rejected and the asset remains Available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleReject(rejectConfirmId)} 
              disabled={actionLoadingId === rejectConfirmId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this maintenance ticket from records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(deleteConfirmId)} 
              disabled={actionLoadingId === deleteConfirmId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

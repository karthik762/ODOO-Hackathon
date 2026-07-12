import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingCalendar from '../components/BookingCalendar';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarIcon, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Bookings() {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings list');
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenBooking = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCreateBooking = async (formData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await api.post('/bookings', formData);
      if (res.data.success) {
        toast.success('Resource booked successfully');
        setIsModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Booking conflict or server error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const res = await api.patch(`/bookings/${id}/cancel`);
      if (res.data.success) {
        toast.success('Booking cancelled');
        setCancelConfirmId(null);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel operation failed');
    } finally {
      setCancelConfirmId(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      const res = await api.delete(`/bookings/${id}`);
      if (res.data.success) {
        toast.success('Booking deleted');
        setDeleteConfirmId(null);
        fetchBookings();
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
        title="Resource Reservations" 
        description="Reserve Meeting Rooms, Vehicles, and Projector devices without booking conflicts."
        actions={
          <Button onClick={handleOpenBooking} className="gap-2">
            <Plus className="w-4 h-4" />
            Book Resource
          </Button>
        }
      />

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Resource Schedule</TabsTrigger>
          <TabsTrigger value="history">Booking History List</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {loading ? (
            <div className="p-8 space-y-4 bg-card border rounded-lg">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <div className="bg-card border rounded-lg shadow-sm p-4">
              <BookingCalendar bookings={bookings} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState 
                icon={<CalendarIcon className="w-8 h-8" />}
                title="No reservations found"
                description="There are currently no bookings in the system."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource / Asset</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Booked By</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => {
                      const isOwner = b.bookedBy?._id === user?._id;
                      const canCancel = b.status === 'Approved' && (isOwner || isPrivileged);
                      const canDelete = isPrivileged;

                      return (
                        <TableRow key={b._id} className="group">
                          <TableCell>
                            <div className="font-medium">{b.asset?.name}</div>
                            <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                              {b.asset?.category?.name || 'Asset'}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            <div><span className="font-medium text-foreground">Start:</span> {new Date(b.startDate).toLocaleString()}</div>
                            <div><span className="font-medium text-foreground">End:</span> {new Date(b.endDate).toLocaleString()}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="font-medium text-foreground">{b.bookedBy?.name}</div>
                            <div className="text-xs">{b.bookedBy?.email}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {b.purpose}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                              b.status === 'Approved' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                              {b.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canCancel && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setCancelConfirmId(b._id)}
                                >
                                  <X className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                              )}
                              {canDelete && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setDeleteConfirmId(b._id)}
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
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Asset Resource</DialogTitle>
          </DialogHeader>
          <BookingForm onSubmit={handleCreateBooking} loading={formLoading} error={formError} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelConfirmId} onOpenChange={(open) => !open && setCancelConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this resource booking? The time slot will be made immediately available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleCancelBooking(cancelConfirmId)} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking log from records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteBooking(deleteConfirmId)} 
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

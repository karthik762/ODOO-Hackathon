import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, User, FileText } from 'lucide-react';
import { EmptyState } from './common/EmptyState';

export default function BookingCalendar({ bookings }) {
  const [filter, setFilter] = useState('upcoming'); 

  const getLocalDateString = (dateObj) => new Date(dateObj).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const getLocalTimeString = (dateObj) => new Date(dateObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const todayStr = new Date().toLocaleDateString();

  const filteredBookings = bookings.filter((b) => {
    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);
    const now = new Date();

    if (filter === 'today') {
      return bStart.toLocaleDateString() === todayStr;
    } else if (filter === 'upcoming') {
      return bEnd >= now;
    }
    return true; 
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState 
          icon={<CalendarIcon className="w-8 h-8" />}
          title="No reservations listed"
          description="There are no reservations for the selected filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((b) => {
            const isCancelled = b.status === 'Cancelled';
            
            return (
              <Card key={b._id} className={`${isCancelled ? 'opacity-60' : ''} transition-all hover:shadow-md border-border/50 bg-card`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 rounded-md">
                      {b.asset?.category?.name || 'Asset'}
                    </Badge>
                    <Badge variant={b.status === 'Approved' ? 'success' : 'destructive'} className="rounded-md capitalize">
                      {b.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-2 truncate" title={b.asset?.name}>
                    {b.asset?.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    S/N: {b.asset?.serialNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{getLocalDateString(b.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{getLocalTimeString(b.startDate)} - {getLocalTimeString(b.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{b.bookedBy?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="line-clamp-2">{b.purpose}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

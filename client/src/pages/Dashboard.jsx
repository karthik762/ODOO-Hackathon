import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Box, CalendarDays, Wrench, IndianRupee, Activity, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportCSV = async (type) => {
    try {
      const response = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type} report exported successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export CSV report.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load dashboard</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchStats}>Retry Connection</Button>
      </div>
    );
  }

  if (isPrivileged) {
    const { assets, bookings, maintenance, activityFeed } = stats;
    const assetStatus = assets.statusBreakdown || {};

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-8">
        <PageHeader 
          title="Control Center" 
          description="Real-time enterprise statistics, department asset allocation, and audit reports."
          actions={
            <>
              <Button variant="outline" onClick={() => handleExportCSV('assets')} className="gap-2">
                <Download className="w-4 h-4" />
                Assets CSV
              </Button>
              <Button variant="outline" onClick={() => handleExportCSV('bookings')} className="gap-2">
                <Download className="w-4 h-4" />
                Bookings CSV
              </Button>
            </>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Capital Assets" 
            value={assets.total} 
            icon={<Box className="w-4 h-4" />} 
          />
          <StatCard 
            title="Capital Value" 
            value={`₹${assets.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
            icon={<IndianRupee className="w-4 h-4" />} 
          />
          <StatCard 
            title="Total Reservations" 
            value={bookings.total} 
            icon={<CalendarDays className="w-4 h-4" />} 
            trend="up"
            trendValue="+4%"
            description="from last month"
          />
          <StatCard 
            title="Maintenance Cost" 
            value={`₹${maintenance.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
            icon={<Wrench className="w-4 h-4 text-destructive" />} 
          />
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Status Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { label: 'Available', value: assetStatus.Available || 0, color: 'bg-emerald-500' },
                  { label: 'Assigned', value: assetStatus.Assigned || 0, color: 'bg-primary' },
                  { label: 'Maintenance', value: assetStatus.Maintenance || 0, color: 'bg-amber-500' },
                  { label: 'Retired', value: assetStatus.Retired || 0, color: 'bg-destructive' }
                ].map((item) => {
                  const pct = assets.total > 0 ? (item.value / assets.total) * 100 : 0;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500 ease-out`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Allocation by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.departmentBreakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground py-12">
                  No assets assigned to departments.
                </div>
              ) : (
                <div className="space-y-6">
                  {assets.departmentBreakdown.map((d, index) => {
                    const maxCount = Math.max(...assets.departmentBreakdown.map((x) => x.count));
                    const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{d.department}</span>
                          <span className="text-muted-foreground">{d.count} items</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Enterprise Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent activity records.</p>
            ) : (
              <div className="relative space-y-6 border-l border-border ml-3 pl-6 pb-2 pt-2">
                {activityFeed.map((a, i) => {
                  const isBooking = a.type === 'booking';
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[35px] top-1 w-7 h-7 rounded-full border-4 border-background flex items-center justify-center ${isBooking ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-600'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isBooking ? 'bg-primary' : 'bg-amber-500'}`} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-foreground">{a.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap bg-secondary px-2 py-1 rounded-md">
                          {new Date(a.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- STANDARD STAFF VIEWS ---
  const { assets, bookings, maintenance, activityFeed, notifications } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <PageHeader 
        title={`Welcome Back, ${user?.name}`} 
        description="Overview of your assigned hardware workspace, reservation schedules, and reported tickets."
      />

      {notifications && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${
                n.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
                  : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
              }`}
            >
              <div className="mt-0.5">{n.type === 'success' ? '🎉' : '🔔'}</div>
              <div className="flex-1">{n.message}</div>
              <div className="text-xs opacity-70 whitespace-nowrap">{new Date(n.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Assigned Hardware" 
          value={assets.total} 
          icon={<Box className="w-4 h-4" />} 
        />
        <StatCard 
          title="My Bookings" 
          value={bookings.total} 
          icon={<CalendarDays className="w-4 h-4" />} 
        />
        <StatCard 
          title="Reported Issues" 
          value={maintenance.total} 
          icon={<Wrench className="w-4 h-4" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">My Workspace Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.list.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No assets assigned to your workspace.</p>
            ) : (
              <div className="space-y-3">
                {assets.list.map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                    <div>
                      <h5 className="font-medium text-sm text-foreground">{a.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">S/N: {a.serialNumber}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">My Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent schedules or tickets logs.</p>
            ) : (
              <div className="relative space-y-6 border-l border-border ml-3 pl-6 pb-2 pt-2">
                {activityFeed.map((a, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.date).toLocaleDateString()}
                      </span>
                      <p className="font-medium text-sm text-foreground">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Box, 
  Tags, 
  Building2, 
  Users as UsersIcon, 
  CalendarDays, 
  Wrench,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getNavItems = (userRole) => {
  const items = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Assets', path: '/assets', icon: Box },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Bookings', path: '/bookings', icon: CalendarDays },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  ];

  if (userRole === 'Admin') {
    items.splice(4, 0, { name: 'Users', path: '/users', icon: UsersIcon });
  }

  return items;
};

export default function Sidebar() {
  const { user } = useAuth();
  const navItems = getNavItems(user?.role);

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-full flex flex-col transition-all duration-300 ease-in-out shrink-0">
      <div className="h-[70px] flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Box className="w-5 h-5 text-primary-foreground" />
          </div>
          <span>AssetFlow</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5 transition-colors duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

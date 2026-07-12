import { Badge } from "@/components/ui/badge"

const statusConfig = {
  Available: { variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  Allocated: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" },
  Reserved: { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" },
  Maintenance: { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  Completed: { variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  Pending: { variant: "outline", className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20" },
  Rejected: { variant: "outline", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" },
  Retired: { variant: "outline", className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20" },
  Disposed: { variant: "outline", className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20" },
}

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { variant: "outline", className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20" }
  
  return (
    <Badge variant={config.variant} className={`${config.className} font-medium ${className || ""}`}>
      {status}
    </Badge>
  )
}

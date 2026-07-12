import Asset from '../models/assetModel.js';
import Booking from '../models/bookingModel.js';
import Maintenance from '../models/maintenanceModel.js';
import Department from '../models/departmentModel.js';

/**
 * Get Dashboard Statistics (Role-Based Aggregations)
 * GET /api/reports/dashboard
 */
export const getDashboardStats = async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const isPrivileged = userRole === 'Admin' || userRole === 'AssetManager';

  try {
    if (isPrivileged) {
      // System-wide statistics for privileged accounts
      const totalAssets = await Asset.countDocuments();
      const assetsList = await Asset.find().populate('department', 'name');

      // Asset Status counts & costs
      const statusCounts = { Available: 0, Assigned: 0, Maintenance: 0, Retired: 0 };
      let totalAssetCost = 0;
      const deptCountsMap = {};

      assetsList.forEach((asset) => {
        if (statusCounts[asset.status] !== undefined) {
          statusCounts[asset.status]++;
        }
        totalAssetCost += asset.cost || 0;

        if (asset.department) {
          const deptName = asset.department.name;
          deptCountsMap[deptName] = (deptCountsMap[deptName] || 0) + 1;
        }
      });

      const departmentStats = Object.keys(deptCountsMap).map((key) => ({
        department: key,
        count: deptCountsMap[key]
      }));

      // Booking stats
      const totalBookings = await Booking.countDocuments();
      const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
      const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

      // Maintenance stats
      const totalTickets = await Maintenance.countDocuments();
      const pendingTickets = await Maintenance.countDocuments({ status: 'Pending' });
      const approvedTickets = await Maintenance.countDocuments({ status: 'Approved' });
      const resolvedTickets = await Maintenance.countDocuments({ status: 'Resolved' });
      
      const resolvedTicketsList = await Maintenance.find({ status: 'Resolved' });
      const totalMaintenanceCost = resolvedTicketsList.reduce((sum, t) => sum + (t.cost || 0), 0);

      // Recent Activity timeline (combines bookings and maintenance)
      const recentBookings = await Booking.find()
        .populate('asset', 'name')
        .populate('bookedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentTickets = await Maintenance.find()
        .populate('asset', 'name')
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      const activityFeed = [];
      recentBookings.forEach((b) => {
        activityFeed.push({
          type: 'booking',
          title: `Resource reservation for '${b.asset?.name || 'Resource'}'`,
          description: `Booked by ${b.bookedBy?.name || 'User'} - ${b.purpose}`,
          status: b.status,
          date: b.createdAt
        });
      });

      recentTickets.forEach((t) => {
        activityFeed.push({
          type: 'maintenance',
          title: `Maintenance ticket raised for '${t.asset?.name || 'Asset'}'`,
          description: `Reported by ${t.reportedBy?.name || 'User'}: ${t.title}`,
          status: t.status,
          date: t.createdAt
        });
      });

      // Sort combined activity logs chronologically
      activityFeed.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json({
        success: true,
        stats: {
          assets: {
            total: totalAssets,
            cost: totalAssetCost,
            statusBreakdown: statusCounts,
            departmentBreakdown: departmentStats
          },
          bookings: {
            total: totalBookings,
            approved: approvedBookings,
            cancelled: cancelledBookings
          },
          maintenance: {
            total: totalTickets,
            pending: pendingTickets,
            approved: approvedTickets,
            resolved: resolvedTickets,
            cost: totalMaintenanceCost
          },
          activityFeed: activityFeed.slice(0, 8)
        }
      });
    } else {
      // Personalized self-service statistics for Employee / DepartmentHead
      const myAssignedAssets = await Asset.find({ assignedTo: userId })
        .populate('category', 'name')
        .populate('department', 'name');

      const myBookingsCount = await Booking.countDocuments({ bookedBy: userId });
      const myBookingsList = await Booking.find({ bookedBy: userId })
        .populate('asset', 'name serialNumber')
        .sort({ startDate: 1 });

      const myTicketsCount = await Maintenance.countDocuments({ reportedBy: userId });
      const myTicketsList = await Maintenance.find({ reportedBy: userId })
        .populate('asset', 'name serialNumber')
        .sort({ createdAt: -1 });

      // Generate activity timeline feed
      const activityFeed = [];
      myBookingsList.forEach((b) => {
        activityFeed.push({
          type: 'booking',
          title: `Reservation on '${b.asset?.name || 'Resource'}'`,
          description: `Scheduled: ${new Date(b.startDate).toLocaleString()} to ${new Date(b.endDate).toLocaleString()}`,
          status: b.status,
          date: b.createdAt
        });
      });

      myTicketsList.forEach((t) => {
        activityFeed.push({
          type: 'maintenance',
          title: `Repair Request: ${t.title}`,
          description: `Status is ${t.status} - priority ${t.priority}`,
          status: t.status,
          date: t.createdAt
        });
      });

      activityFeed.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Generate context notifications for the logged-in user
      const notifications = [];
      myBookingsList.slice(0, 3).forEach((b) => {
        notifications.push({
          message: `Booking for ${b.asset?.name} is active (Status: ${b.status})`,
          type: 'info',
          date: b.updatedAt
        });
      });
      myTicketsList.slice(0, 3).forEach((t) => {
        if (t.status === 'Resolved') {
          notifications.push({
            message: `Maintenance request for ${t.asset?.name} has been resolved!`,
            type: 'success',
            date: t.updatedAt
          });
        }
      });

      res.json({
        success: true,
        stats: {
          assets: {
            total: myAssignedAssets.length,
            list: myAssignedAssets
          },
          bookings: {
            total: myBookingsCount,
            list: myBookingsList
          },
          maintenance: {
            total: myTicketsCount,
            list: myTicketsList
          },
          activityFeed: activityFeed.slice(0, 8),
          notifications
        }
      });
    }
  } catch (err) {
    console.error('Get Dashboard Stats Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error generating dashboard statistics'
    });
  }
};

/**
 * Export Assets Inventory to CSV Format
 * GET /api/reports/export/assets
 */
export const exportAssetsCSV = async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('assignedTo', 'name email');

    let csvContent = 'Name,Serial Number,Model,Category,Department,Status,Cost,Assigned To,Purchase Date\n';

    assets.forEach((a) => {
      const name = `"${(a.name || '').replace(/"/g, '""')}"`;
      const serial = `"${(a.serialNumber || '').replace(/"/g, '""')}"`;
      const model = `"${(a.model || '').replace(/"/g, '""')}"`;
      const category = `"${(a.category?.name || '').replace(/"/g, '""')}"`;
      const department = `"${(a.department?.name || '').replace(/"/g, '""')}"`;
      const status = `"${(a.status || '')}"`;
      const cost = a.cost || 0;
      const assigned = `"${(a.assignedTo?.name || 'Unassigned').replace(/"/g, '""')}"`;
      const date = a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : '';

      csvContent += `${name},${serial},${model},${category},${department},${status},${cost},${assigned},${date}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assets-inventory-report.csv');
    res.send(csvContent);
  } catch (err) {
    console.error('Assets CSV Export Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error exporting asset list CSV'
    });
  }
};

/**
 * Export Bookings List to CSV Format
 * GET /api/reports/export/bookings
 */
export const exportBookingsCSV = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('asset', 'name serialNumber')
      .populate('bookedBy', 'name email');

    let csvContent = 'Asset Name,Serial Number,Booked By Name,Booked By Email,Purpose,Start Date,End Date,Status\n';

    bookings.forEach((b) => {
      const assetName = `"${(b.asset?.name || '').replace(/"/g, '""')}"`;
      const serial = `"${(b.asset?.serialNumber || '').replace(/"/g, '""')}"`;
      const bookedByName = `"${(b.bookedBy?.name || '').replace(/"/g, '""')}"`;
      const bookedByEmail = `"${(b.bookedBy?.email || '').replace(/"/g, '""')}"`;
      const purpose = `"${(b.purpose || '').replace(/"/g, '""')}"`;
      const start = b.startDate ? new Date(b.startDate).toISOString() : '';
      const end = b.endDate ? new Date(b.endDate).toISOString() : '';
      const status = `"${(b.status || '')}"`;

      csvContent += `${assetName},${serial},${bookedByName},${bookedByEmail},${purpose},${start},${end},${status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings-reservations-report.csv');
    res.send(csvContent);
  } catch (err) {
    console.error('Bookings CSV Export Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error exporting bookings list CSV'
    });
  }
};

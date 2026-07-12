import Maintenance from '../models/maintenanceModel.js';
import Asset from '../models/assetModel.js';

/**
 * Get All Maintenance Tickets
 * GET /api/maintenance
 */
export const getMaintenanceTickets = async (req, res) => {
  const { asset, reportedBy, status, priority } = req.query;

  try {
    const query = {};
    if (asset) query.asset = asset;
    if (reportedBy) query.reportedBy = reportedBy;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Maintenance.find(query)
      .populate({
        path: 'asset',
        select: 'name serialNumber model category department status',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'department', select: 'name code' }
        ]
      })
      .populate('reportedBy', 'name email role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (err) {
    console.error('Get Maintenance Tickets Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving maintenance tickets'
    });
  }
};

/**
 * Raise Maintenance Request (Any Authenticated User)
 * POST /api/maintenance
 */
export const createMaintenanceTicket = async (req, res) => {
  const { asset, title, description, priority } = req.body;
  const userId = req.user._id;

  try {
    if (!asset || !title) {
      return res.status(400).json({
        success: false,
        message: 'Asset and issue title are required'
      });
    }

    // Verify asset exists
    const assetExists = await Asset.findById(asset);
    if (!assetExists) {
      return res.status(404).json({
        success: false,
        message: 'Asset resource not found'
      });
    }

    const ticket = await Maintenance.create({
      asset,
      reportedBy: userId,
      title,
      description: description || '',
      priority: priority || 'Medium',
      status: 'Pending'
    });

    const populatedTicket = await Maintenance.findById(ticket._id)
      .populate('asset', 'name serialNumber')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      ticket: populatedTicket
    });
  } catch (err) {
    console.error('Create Maintenance Ticket Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error raising maintenance request'
    });
  }
};

/**
 * Approve Maintenance Request (Admin / AssetManager Only)
 * PATCH /api/maintenance/:id/approve
 * Action: Changes ticket status to 'Approved' and sets associated Asset status to 'Maintenance'
 */
export const approveMaintenanceTicket = async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found'
      });
    }

    if (ticket.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve ticket that is currently in '${ticket.status}' status`
      });
    }

    ticket.status = 'Approved';
    await ticket.save();

    // Automatic asset status update: change status to 'Maintenance'
    await Asset.findByIdAndUpdate(ticket.asset, { status: 'Maintenance' });

    const populatedTicket = await Maintenance.findById(ticket._id)
      .populate('asset', 'name serialNumber status')
      .populate('reportedBy', 'name email');

    res.json({
      success: true,
      message: 'Ticket approved successfully. Asset status set to Maintenance.',
      ticket: populatedTicket
    });
  } catch (err) {
    console.error('Approve Ticket Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error approving maintenance request'
    });
  }
};

/**
 * Reject Maintenance Request (Admin / AssetManager Only)
 * PATCH /api/maintenance/:id/reject
 * Action: Changes ticket status to 'Rejected' and reverts associated Asset status to 'Available'
 */
export const rejectMaintenanceTicket = async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found'
      });
    }

    if (ticket.status !== 'Pending' && ticket.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject ticket that is currently in '${ticket.status}' status`
      });
    }

    ticket.status = 'Rejected';
    await ticket.save();

    // Automatic asset status update: revert status back to 'Available'
    await Asset.findByIdAndUpdate(ticket.asset, { status: 'Available' });

    const populatedTicket = await Maintenance.findById(ticket._id)
      .populate('asset', 'name serialNumber status')
      .populate('reportedBy', 'name email');

    res.json({
      success: true,
      message: 'Ticket rejected successfully. Asset status set to Available.',
      ticket: populatedTicket
    });
  } catch (err) {
    console.error('Reject Ticket Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting maintenance request'
    });
  }
};

/**
 * Resolve Maintenance Request (Admin / AssetManager Only)
 * PATCH /api/maintenance/:id/resolve
 * Action: Changes ticket status to 'Resolved' and reverts associated Asset status to 'Available'
 */
export const resolveMaintenanceTicket = async (req, res) => {
  const { cost, notes } = req.body;

  try {
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found'
      });
    }

    if (ticket.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot resolve a ticket that is not yet Approved'
      });
    }

    ticket.status = 'Resolved';
    ticket.cost = cost ? parseFloat(cost) : 0;
    ticket.notes = notes || '';
    ticket.resolvedAt = Date.now();
    await ticket.save();

    // Automatic asset status update: revert status back to 'Available'
    await Asset.findByIdAndUpdate(ticket.asset, { status: 'Available' });

    const populatedTicket = await Maintenance.findById(ticket._id)
      .populate('asset', 'name serialNumber status')
      .populate('reportedBy', 'name email');

    res.json({
      success: true,
      message: 'Ticket resolved successfully. Asset status set to Available.',
      ticket: populatedTicket
    });
  } catch (err) {
    console.error('Resolve Ticket Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error resolving maintenance request'
    });
  }
};

/**
 * Delete Maintenance Request (Admin / AssetManager Only)
 * DELETE /api/maintenance/:id
 */
export const deleteMaintenanceTicket = async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found'
      });
    }

    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Maintenance ticket deleted successfully from database'
    });
  } catch (err) {
    console.error('Delete Ticket Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting maintenance record'
    });
  }
};

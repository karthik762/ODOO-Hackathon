import Booking from '../models/bookingModel.js';
import Asset from '../models/assetModel.js';

/**
 * Get All Bookings
 * GET /api/bookings
 */
export const getBookings = async (req, res) => {
  const { asset, bookedBy, status } = req.query;

  try {
    const query = {};
    if (asset) query.asset = asset;
    if (bookedBy) query.bookedBy = bookedBy;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate({
        path: 'asset',
        select: 'name serialNumber model category department',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'department', select: 'name code' }
        ]
      })
      .populate('bookedBy', 'name email role department')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    console.error('Get Bookings Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving bookings list'
    });
  }
};

/**
 * Create Booking (With Overlap Conflict Detection)
 * POST /api/bookings
 */
export const createBooking = async (req, res) => {
  const { asset, purpose, startDate, endDate } = req.body;
  const userId = req.user._id;

  try {
    if (!asset || !purpose || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Asset, purpose, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date or end date format'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date/time must be after the start date/time'
      });
    }

    // Verify asset exists and is available
    const assetExists = await Asset.findById(asset);
    if (!assetExists) {
      return res.status(404).json({
        success: false,
        message: 'Target asset resource not found'
      });
    }

    if (assetExists.status === 'Retired') {
      return res.status(400).json({
        success: false,
        message: 'This asset is retired and cannot be booked'
      });
    }

    // Conflict detection: overlapping booking check
    // Overlap exists if: (existingStart < proposedEnd) AND (existingEnd > proposedStart)
    const conflict = await Booking.findOne({
      asset,
      status: 'Approved',
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Conflict detected: This resource is already reserved for the selected time slot'
      });
    }

    const booking = await Booking.create({
      asset,
      bookedBy: userId,
      purpose,
      startDate: start,
      endDate: end,
      status: 'Approved'
    });

    // Populate created booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('asset', 'name serialNumber')
      .populate('bookedBy', 'name email');

    res.status(201).json({
      success: true,
      booking: populatedBooking
    });
  } catch (err) {
    console.error('Create Booking Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error processing booking reservation'
    });
  }
};

/**
 * Update Booking (With Overlap Conflict Detection)
 * PUT /api/bookings/:id
 */
export const updateBooking = async (req, res) => {
  const { purpose, startDate, endDate, status } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Authorization: User can only edit their own booking, Admins/AssetManagers can edit any
    const isOwner = booking.bookedBy.toString() === userId.toString();
    const isPrivileged = userRole === 'Admin' || userRole === 'AssetManager';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this booking'
      });
    }

    if (purpose) booking.purpose = purpose;
    if (status) booking.status = status;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(booking.startDate);
      const end = endDate ? new Date(endDate) : new Date(booking.endDate);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End date/time must be after the start date/time'
        });
      }

      // Conflict detection: overlapping booking check (excluding the current booking record itself)
      const conflict = await Booking.findOne({
        _id: { $ne: req.params.id },
        asset: booking.asset,
        status: 'Approved',
        startDate: { $lt: end },
        endDate: { $gt: start }
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Conflict detected: This resource is already reserved for the selected time slot'
        });
      }

      booking.startDate = start;
      booking.endDate = end;
    }

    const updatedBooking = await booking.save();
    const populatedBooking = await Booking.findById(updatedBooking._id)
      .populate('asset', 'name serialNumber')
      .populate('bookedBy', 'name email');

    res.json({
      success: true,
      booking: populatedBooking
    });
  } catch (err) {
    console.error('Update Booking Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking reservation'
    });
  }
};

/**
 * Cancel Booking
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Authorization: User can cancel their own, Admins/Managers can cancel any
    const isOwner = booking.bookedBy.toString() === userId.toString();
    const isPrivileged = userRole === 'Admin' || userRole === 'AssetManager';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (err) {
    console.error('Cancel Booking Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking reservation'
    });
  }
};

/**
 * Delete Booking (Admin & AssetManager Only)
 * DELETE /api/bookings/:id
 */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Booking deleted successfully from records'
    });
  } catch (err) {
    console.error('Delete Booking Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting booking record'
    });
  }
};

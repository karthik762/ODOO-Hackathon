import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date/time is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date/time is required']
  },
  status: {
    type: String,
    enum: ['Approved', 'Cancelled'],
    default: 'Approved'
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

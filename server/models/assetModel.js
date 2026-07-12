import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  model: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Asset category is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Asset department is required']
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Maintenance', 'Retired'],
    default: 'Available'
  },
  image: {
    type: String, // Path to the uploaded image file relative to backend root
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

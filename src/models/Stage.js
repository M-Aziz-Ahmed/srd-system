import mongoose from 'mongoose';

const StageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    default: '#6B7280', // Default gray color
  },
  icon: {
    type: String,
    default: 'Circle', // Lucide icon name
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Departments that this stage applies to
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  }],
  // Whether this stage can be set by users or is auto-calculated
  isAutomatic: {
    type: Boolean,
    default: false,
  },
  // Rules for automatic stage transitions
  rules: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
StageSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Stage || mongoose.model('Stage', StageSchema);

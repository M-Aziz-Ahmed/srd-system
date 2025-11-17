import mongoose from 'mongoose';

const ProductionStageSchema = new mongoose.Schema({
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
    default: '#6B7280',
  },
  icon: {
    type: String,
    default: 'Package',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Estimated duration in days
  estimatedDuration: {
    type: Number,
    default: 0,
  },
  // Requirements or checklist for this stage
  requirements: [{
    name: String,
    description: String,
    isRequired: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ProductionStageSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.ProductionStage || mongoose.model('ProductionStage', ProductionStageSchema);

import mongoose from 'mongoose';

const ProductionManagerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  email: String,
  permissions: {
    canStartProduction: { type: Boolean, default: true },
    canCompleteStages: { type: Boolean, default: true },
    canReportIssues: { type: Boolean, default: true },
    canViewAllProduction: { type: Boolean, default: true }
  },
  assignedSRDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SRD'
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ProductionManager || mongoose.model('ProductionManager', ProductionManagerSchema);

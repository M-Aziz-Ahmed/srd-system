import mongoose from 'mongoose';

const productionProgressSchema = new mongoose.Schema({
  srdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SRD',
    required: true
  },
  currentStage: {
    type: String,
    required: true
  },
  stages: [{
    stageName: String,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'on-hold'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    issues: [{
      description: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      },
      resolved: {
        type: Boolean,
        default: false
      },
      resolvedAt: Date
    }]
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Delete existing model if it exists
if (mongoose.models.ProductionProgress) {
  delete mongoose.models.ProductionProgress;
}

export default mongoose.model('ProductionProgress', productionProgressSchema);

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganizationUnit', // Doit pointer vers une unité de type PROJECT
    index: true,
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceTask',
    default: null, // Pour la gestion des sous-tâches
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'],
    default: 'TODO',
    index: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  creatorMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceMembership',
  },
  assigneeMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceMembership',
    default: null,
    index: true,
  },
  collaboratorMembershipIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceMembership',
  }],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceTask', // Tâches devant être terminées avant celle-ci
  }],
  checklists: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  }],
}, {
  timestamps: true,
});

TaskSchema.index({ organizationId: 1, unitId: 1, status: 1 });

module.exports = mongoose.model('WorkplaceTask', TaskSchema);

// server/schema/medicalRecord.schema.js
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  recordType: {
    type: String,
    required: true,
    enum: [
      'allergy',
      'condition',
      'surgery',
      'immunization',
      'lab_result',
      'imaging',
      'medication',
      'procedure',
      'vital_signs',
      'family_history',
      'social_history',
      'other'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  endDate: Date, // For conditions that have a duration
  status: {
    type: String,
    enum: ['active', 'inactive', 'resolved', 'chronic'],
    default: 'active'
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', null],
    default: null
  },
  details: mongoose.Schema.Types.Mixed, // For flexible data storage
  files: [{
    url: String,
    name: String,
    type: String, // e.g., 'pdf', 'image', 'lab_report'
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['Doctor', 'Patient']
  }
}, {
  timestamps: true
});

// Indexes for faster querying
medicalRecordSchema.index({ patient: 1, recordType: 1, date: -1 });
medicalRecordSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);
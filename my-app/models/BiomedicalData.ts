import mongoose from 'mongoose'

const compoundInfoSchema = new mongoose.Schema({
  file_name: { type: String, required: true },
  title: { type: String, required: true },
  text_block: { type: String, required: true },
  structure: { type: String },
  identifier: { type: String },
  evidence_description: { type: String, required: true },
  evidence_type: { type: String, required: true },
  disease_targeted: { type: String, required: true },
  mechanism_of_action: { type: String },
  references: { type: String },
  confidence_score: { type: String },
  manual_validation: { type: String }
})

const biomedicalDataSchema = new mongoose.Schema({
  compound_name: { type: String, required: true },
  compounds_info: [compoundInfoSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Add text index for search
biomedicalDataSchema.index({ 
  compound_name: 'text',
  'compounds_info.title': 'text',
  'compounds_info.text_block': 'text',
  'compounds_info.evidence_description': 'text',
  'compounds_info.disease_targeted': 'text'
})

// Add compound_name index for faster sorting
biomedicalDataSchema.index({ compound_name: 1 })

// Use the sanya-data collection name
export const BiomedicalData = mongoose.models.BiomedicalData || mongoose.model('BiomedicalData', biomedicalDataSchema, 'sanya-data') 
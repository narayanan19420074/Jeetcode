import mongoose from 'mongoose';

// Shared stimulus for data-interpretation / reasoning / comprehension
// questions ("Refer to the table below ..."). Questions point at it with
// AptitudeQuestion.setId. One doc per (pattern, setId).
const aptitudeSetSchema = new mongoose.Schema(
  {
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudePattern', required: true, index: true },
    setId: { type: String, required: true },
    type: { type: String, enum: ['text', 'table', 'bar', 'line', 'pie'], required: true },
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    table: { type: mongoose.Schema.Types.Mixed, default: null }, // { columns: [], rows: [[]] }
    chart: { type: mongoose.Schema.Types.Mixed, default: null }, // { xLabel, yLabel, series: [{ name, data: [{label,value}] }] }
  },
  { timestamps: true }
);

aptitudeSetSchema.index({ pattern: 1, setId: 1 }, { unique: true });

export const AptitudeSet = mongoose.model('AptitudeSet', aptitudeSetSchema);

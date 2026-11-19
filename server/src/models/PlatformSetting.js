import mongoose from 'mongoose';

const { Schema } = mongoose;

// Single-document store for platform-wide switches that an admin changes at
// runtime (no redeploy, no env var edit). The fixed `key` keeps it a
// singleton: every read and write targets the one 'global' document.
const platformSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },

    // When true, every signed-in user gets Pro access regardless of their own
    // subscription or license. Stays on until an admin switches it off.
    proForEveryone: { type: Boolean, default: false },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IIKDBaselineProfile extends Document {
    userId: mongoose.Types.ObjectId;
    baseline_mean: number;
    baseline_std: number;
    baseline_p25: number;
    baseline_p75: number;
    calculatedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const ikdBaselineProfileSchema = new Schema<IIKDBaselineProfile>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    baseline_mean: {
        type: Number,
        required: true
    },
    baseline_std: {
        type: Number,
        required: true
    },
    baseline_p25: {
        type: Number,
        required: true
    },
    baseline_p75: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const IKDBaselineProfile = mongoose.model<IIKDBaselineProfile>('IKDBaselineProfile', ikdBaselineProfileSchema);
export default IKDBaselineProfile;

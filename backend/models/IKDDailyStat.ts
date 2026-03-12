import mongoose, { Document, Schema } from 'mongoose';

export interface IIKDDailyStat extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    eventCount: number;
    mean_ikd: number;
    median_ikd: number;
    std_dev: number;
    p25: number;
    p75: number;
    is_baseline_day: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ikdDailyStatSchema = new Schema<IIKDDailyStat>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    eventCount: {
        type: Number,
        required: true
    },
    mean_ikd: {
        type: Number,
        required: true
    },
    median_ikd: {
        type: Number,
        required: true
    },
    std_dev: {
        type: Number,
        required: true
    },
    p25: {
        type: Number,
        required: true
    },
    p75: {
        type: Number,
        required: true
    },
    is_baseline_day: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true });

// Ensure one stat per user per day
ikdDailyStatSchema.index({ userId: 1, date: 1 }, { unique: true });

const IKDDailyStat = mongoose.model<IIKDDailyStat>('IKDDailyStat', ikdDailyStatSchema);
export default IKDDailyStat;

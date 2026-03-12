import mongoose, { Document, Schema } from 'mongoose';

export interface IIKDDailyAnalysis extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    today_mean: number | null;
    z_score: number | null;
    percentage_change: number | null;
    status: 'normal' | 'mild deviation' | 'significant deviation' | 'insufficient data';
    createdAt?: Date;
    updatedAt?: Date;
}

const ikdDailyAnalysisSchema = new Schema<IIKDDailyAnalysis>({
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
    today_mean: {
        type: Number,
        default: null
    },
    z_score: {
        type: Number,
        default: null
    },
    percentage_change: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['normal', 'mild deviation', 'significant deviation', 'insufficient data'],
        required: true
    }
}, { timestamps: true });

// Ensure one analysis per user per day
ikdDailyAnalysisSchema.index({ userId: 1, date: 1 }, { unique: true });

const IKDDailyAnalysis = mongoose.model<IIKDDailyAnalysis>('IKDDailyAnalysis', ikdDailyAnalysisSchema);
export default IKDDailyAnalysis;

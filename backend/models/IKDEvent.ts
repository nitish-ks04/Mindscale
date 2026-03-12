import mongoose, { Document, Schema } from 'mongoose';

export interface IIKDEvent extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId: string;
    timestamp: number;
    ikd: number;
    createdAt?: Date;
    updatedAt?: Date;
    key?: string;
    character?: string;
    text?: string;
}

const ikdEventSchema = new Schema<IIKDEvent>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    ikd: {
        type: Number,
        required: true,
        min: 20,
        max: 2000
    }
}, { timestamps: true });

// Add compound index for high-performance chronologically-bounded aggregation
ikdEventSchema.index({ userId: 1, createdAt: 1 });

// Prevent storing raw key data
ikdEventSchema.pre('save', function (next) {
    if ((this as IIKDEvent).key || (this as IIKDEvent).character || (this as IIKDEvent).text) {
        return next(new Error('Payload cannot contain raw keystroke characters (key, character, text)'));
    }
    next();
});

const IKDEvent = mongoose.model<IIKDEvent>('IKDEvent', ikdEventSchema);
export default IKDEvent;

import mongoose, { Schema, models, model } from 'mongoose';

export interface IApplication extends mongoose.Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  resumeUrl: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'interviewing' | 'offered' | 'rejected';
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    coverLetter: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interviewing', 'offered', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure users can only apply once per job
ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Application = models.Application || model<IApplication>('Application', ApplicationSchema);

export default Application;
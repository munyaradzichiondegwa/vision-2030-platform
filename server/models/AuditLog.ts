import mongoose, { Document, Schema } from "mongoose";

export enum AuditLogAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  ROLE_CHANGED = "ROLE_CHANGED",
}

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: AuditLogAction;
  metadata: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditLogAction),
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Create index for efficient querying
AuditLogSchema.index({ user: 1, action: 1, createdAt: -1 });

const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;

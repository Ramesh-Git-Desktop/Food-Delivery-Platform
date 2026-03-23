const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    actorModel: {
      type: String,
      enum: ["Admin", "RestaurantAdmin", "Rider", "User", null],
      default: null,
    },
    actorRole: {
      type: String,
      default: "system",
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entityModel: {
      type: String,
      default: null,
      trim: true,
    },
    entityLabel: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    request: {
      method: {
        type: String,
        default: "",
      },
      path: {
        type: String,
        default: "",
      },
      ip: {
        type: String,
        default: "",
      },
      userAgent: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ entityModel: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actorRole: 1, createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

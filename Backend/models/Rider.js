const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^[6-9]\d{9}$/;

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      match: [
        passwordRegex,
        "Password must contain at least 8 characters, one uppercase letter, and one number",
      ],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [phoneRegex, "Please enter a valid 10-digit Indian phone number"],
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle"],
      required: [true, "Vehicle type is required"],
    },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
    },
    role: {
      type: String,
      default: "rider",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
      
    },
    suspensionReason: {
      type: String,
      default: "",
      

    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    documents: {
      drivingLicense: { type: String, default: "" },
      aadharCard: { type: String, default: "" },
      vehicleRC: { type: String, default: "" },
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
riderSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
riderSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

riderSchema.methods.refreshSuspensionStatus = async function () {
  if (
    this.status === "suspended" &&
    this.suspendedUntil &&
    this.suspendedUntil <= new Date()
  ) {
    this.status = "approved";
    this.suspensionReason = "";
    this.suspendedAt = null;
    this.suspendedUntil = null;
    await this.save();
  }

  return this;
};

riderSchema.index({ status: 1, isAvailable: 1 });

module.exports = mongoose.models.Rider || mongoose.model("Rider", riderSchema);

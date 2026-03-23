const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OTP_EXPIRY_MS } = require("../config/constants");

const PHONE_VALIDATORS = {
  IN: {
    regex: /^[6-9]\d{9}$/,
    message: "Please enter a valid 10-digit Indian phone number"
  },
  US: {
    regex: /^[2-9]\d{9}$/,
    message: "Please enter a valid 10-digit US phone number"
  },
  E164: {
    regex: /^\+?[1-9]\d{6,14}$/,
    message: "Please enter a valid phone number with country code"
  }
};

const PHONE_COUNTRY = (process.env.PHONE_COUNTRY || "IN").toUpperCase();
const phoneValidator = PHONE_VALIDATORS[PHONE_COUNTRY] || PHONE_VALIDATORS.E164;
const phoneMatch = [phoneValidator.regex, phoneValidator.message];

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [30, "Name must be less than 30 characters"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address"
    ]
  },

  phone: {
    type: String,
    trim: true,
    match: phoneMatch
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    match: [
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
    "Password must contain at least 1 uppercase letter, 1 number, and 1 special character"
  ],
    select: false
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  addresses: [
    {
      user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User", 
          required: true 
        },
        label: { 
          type: String, 
          enum: ["home", "work", "other"], 
          required: true 
        },
        name: { 
          type: String, 
          required: true 
        },
        phone: { 
          type: String, 
          required: true 
        },
        street: { 
          type: String, 
          required: true 
        },
        city: { 
          type: String, 
          required: true 
        },
        state: { 
          type: String, 
          required: true 
        },
        zipCode: { 
          type: String, 
          required: true 
        },
        country: { 
          type: String, 
          required: true 
        },
        isDefault: { 
          type: Boolean, 
          default: false 
        },
    }
  ],

  // Email verification
  isVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationToken: String,
  emailVerificationExpire: Date,

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // OTP verification flag (for reset password flow)
  isOtpVerified: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);



// ================= PASSWORD HASHING =================
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});



// ================= COMPARE PASSWORD =================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



// ================= EMAIL VERIFICATION OTP =================
userSchema.methods.generateEmailVerificationOTP = function () {

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.emailVerificationExpire = Date.now() + OTP_EXPIRY_MS;

  return otp;
};



// ================= CLEAR EMAIL VERIFICATION =================
userSchema.methods.clearVerificationFields = function () {

  this.emailVerificationToken = undefined;
  this.emailVerificationExpire = undefined;

};



// ================= PASSWORD RESET OTP =================
userSchema.methods.generateResetPasswordOTP = function () {

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + OTP_EXPIRY_MS;

  this.isOtpVerified = false;

  return otp;
};



// ================= CLEAR RESET PASSWORD =================
userSchema.methods.clearResetFields = function () {

  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
  this.isOtpVerified = false;

};



module.exports = mongoose.model("User", userSchema);

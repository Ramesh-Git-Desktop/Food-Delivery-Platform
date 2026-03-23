const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * MINUTE_IN_MS;

const RATE_LIMITS = {
  login: {
    windowMs: 15 * MINUTE_IN_MS,
    max: 5,
  },
  register: {
    windowMs: HOUR_IN_MS,
    max: 10,
  },
  otp: {
    windowMs: OTP_EXPIRY_MS,
    max: 3,
  },
  forgotPassword: {
    windowMs: 15 * MINUTE_IN_MS,
    max: 3,
  },
};

const ORDER_DEFAULTS = {
  deliveryFee: 40,
  taxRate: 0.05,
  pageLimit: 5,
};

const RIDER_EARNINGS_FILTERS = {
  "last-week": 7,
  "last-30-days": 30,
  "last-60-days": 60,
};

const RIDER_AUTH = {
  tokenExpiry: "7d",
  cookieMaxAgeMs: 7 * DAY_IN_MS,
};

const RESTAURANT_REGISTRATION_UPLOAD_LIMITS = Object.freeze({
  restaurantLogo: 1,
  restaurantImages: 5,
  fssaiLicense: 1,
  gstCertificate: 1,
  panCard: 1,
});

module.exports = {
  MINUTE_IN_MS,
  HOUR_IN_MS,
  DAY_IN_MS,
  OTP_EXPIRY_MINUTES,
  OTP_EXPIRY_MS,
  RATE_LIMITS,
  ORDER_DEFAULTS,
  RIDER_EARNINGS_FILTERS,
  RIDER_AUTH,
  RESTAURANT_REGISTRATION_UPLOAD_LIMITS,
};

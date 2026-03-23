const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/apiError");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter — allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only images (jpeg, jpg, png, gif, webp) and PDFs are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Pre-configured upload middlewares
const uploadSingle = (fieldName) => upload.single(fieldName);

const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);

const uploadFields = (fields) => upload.fields(fields);

module.exports = { upload, uploadSingle, uploadMultiple, uploadFields };

const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Upload a single file to Cloudinary.
 * @param {string} filePath - Local file path (from multer)
 * @param {string} folder - Cloudinary folder name (e.g., "restaurants/logos")
 * @returns {Object} { url, public_id }
 */
const uploadToCloudinary = async (filePath, folder = "food-order") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // auto-detect image, pdf, etc.
      transformation: [
        { quality: "auto", fetch_format: "auto" }, // optimize quality & format
      ],
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Clean up local file on error too
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple files to Cloudinary.
 * @param {Array} files - Array of file objects from multer (each has .path)
 * @param {string} folder - Cloudinary folder name
 * @returns {Array} Array of { url, public_id }
 */
const uploadMultipleToCloudinary = async (files, folder = "food-order") => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.path, folder)
  );
  return await Promise.all(uploadPromises);
};

/**
 * Delete a file from Cloudinary by public_id.
 * @param {string} publicId - Cloudinary public_id
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Delete multiple files from Cloudinary.
 * @param {Array} publicIds - Array of public_id strings
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  const deletePromises = publicIds.map((id) => deleteFromCloudinary(id));
  return await Promise.all(deletePromises);
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};

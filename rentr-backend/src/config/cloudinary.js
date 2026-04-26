// ============================================
// Cloudinary config + multer factory
// ============================================
// Replaces local disk storage with Cloudinary. Each upload goes
// to a folder like "rentr/avatars" or "rentr/items" so files stay
// organized in your Cloudinary dashboard.

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Read credentials from env (set in .env locally and in Render dashboard)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Factory — returns a multer instance configured to upload to a given Cloudinary folder.
// Usage:  const upload = makeUploader("avatars");
function makeUploader(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `rentr/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto" }], // auto-optimize image size
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  });
}

module.exports = { cloudinary, makeUploader };

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadImage = async (file) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'shopez_products',
      });
      // Delete the temporary file
      try { fs.unlinkSync(file.path); } catch (e) {}
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local storage:', error);
    }
  }

  // Fallback: Store locally
  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const targetDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetPath = path.join(targetDir, filename);
  fs.copyFileSync(file.path, targetPath);
  try { fs.unlinkSync(file.path); } catch (e) {}
  return `/uploads/${filename}`;
};

module.exports = { uploadImage, isCloudinaryConfigured };

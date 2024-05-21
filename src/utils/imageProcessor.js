const fs = require('fs');
const path = require('path');
const multer = require('multer'); // for handling multipart/form-data
const cloudinary = require('cloudinary').v2;
const util = require('util');
const removeFolder = util.promisify(fs.rm);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPublicId = (parentName, imageType, filePath) => {
  parentName = parentName.toLowerCase();
  filePath = filePath.toLowerCase();
  return `${parentName}-${imageType}-${filePath}`;
};

const deleteMulterUpload = async () => {
  return;
  try {
    await removeFolder(path.join(__dirname, 'multerUploads'), { recursive: true, force: true });
    console.log('File deleted successfully.');
  } catch (err) {
    if (err) {
      console.error('Error deleting file:', err);
    }
  }
};

const uploadToCloudinary = async (path, category, parentName, file) => {
  const storedImage = await cloudinary.uploader.upload(file.path, {
    folder: path,
    public_id: createPublicId(parentName, category, file.originalname),
  });
  return storedImage;
};

// Set up multer for handling multipart/form-data (file uploads)
const multerUploader = multer(); // temporary destination for uploaded files

module.exports = {
  createPublicId,
  multerUploader,
  cloudinary,
  deleteMulterUpload,
  uploadToCloudinary,
};

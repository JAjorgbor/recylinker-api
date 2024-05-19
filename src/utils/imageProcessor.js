const fs = require('fs');
const multer = require('multer'); // for handling multipart/form-data
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPublicId = (productName, imageType, filePath) => {
  productName = productName.toLowerCase();
  filePath = filePath.toLowerCase();
  return `${productName}-${imageType}-${filePath}`;
};

const deleteMulterUpload = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully.');
    }
  });
};

// Set up multer for handling multipart/form-data (file uploads)
const multerUploader = multer({ dest: 'multerUploads' }); // temporary destination for uploaded files

module.exports = {
  createPublicId,
  multerUploader,
  cloudinary,
  deleteMulterUpload,
};

const fs = require('fs');
const { formidable } = require('formidable');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const util = require('util');
const removeFolder = util.promisify(fs.rm);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPublicId = (parentName, imageType, filepath) => {
  try {
    parentName = parentName.toLowerCase();
    filepath = filepath.toLowerCase();
    return `${parentName}-${imageType}-${filepath}`;
  } catch (error) {
    console.log(error);
  }
};

const uploadToCloudinary = async (folder, category, parentName, file) => {
  const storedImage = await cloudinary.uploader.upload(file.filepath, {
    timeout: 60000,
    folder: folder,
    public_id: createPublicId(parentName, category, file.name),
  });
  return storedImage;
};

// Set up multer for handling multipart/form-data (file uploads)
// const multerUploader = multer(); // temporary destination for uploaded files

const parseMultipartForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve([fields, files]);
    });
  });
};

const cleanFields = (fields) => {
  const parseNestedKeys = (fields) => {
    const result = {};
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        const nestedKeys = key.split(/\[|\]/).filter(Boolean); // Split by '[' or ']' and filter out empty strings
        let currentObj = result;
        for (let i = 0; i < nestedKeys.length; i++) {
          const nestedKey = nestedKeys[i];
          if (!currentObj[nestedKey]) {
            if (i === nestedKeys.length - 1) {
              currentObj[nestedKey] = parseValue(value);
            } else {
              currentObj[nestedKey] = Array.isArray(parseValue(value)) ? parseValue(value) : {};
            }
          } else if (Array.isArray(currentObj[nestedKey]) && i === nestedKeys.length - 1) {
            // If the current key already exists and is an array and it's the last key, push the value
            currentObj[nestedKey].push(parseValue(value));
          }
          currentObj = currentObj[nestedKey];
        }
      }
    }
    return result;
  };

  const parseValue = (value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; // If it's not a valid JSON string, return the original value
      }
    } else if (Array.isArray(value)) {
      return value.map((item) => parseValue(item));
    } else if (typeof value === 'object') {
      return parseNestedKeys(value);
    }
    return value;
  };

  const parseNestedJSON = (value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; // If it's not a valid JSON string, return the original value
      }
    }
    return value;
  };
  if (fields) {
    for (const [key, val] of Object.entries(fields)) {
      // Set key to first value in multipart array
      fields[key] = val[0];

      // Delete entries with empty val
      if (!fields[key]) {
        delete fields[key];
        continue;
      }

      // Parse nested JSON strings
      fields[key] = parseNestedJSON(fields[key]);
    }
    // Parse nested keys and values
    const result = parseNestedKeys(fields);

    return result;
  }
};

const cleanFiles = (rawFiles) => {
  const files = [];
  if (rawFiles) {
    for (const [key, val] of Object.entries(rawFiles)) {
      rawFiles[key] = val[0];
      const originalFilename = rawFiles[key].originalFilename;
      files.push({
        name: key,
        filename: `${key}.${originalFilename.substr(originalFilename.lastIndexOf('.') + 1, originalFilename.length)}`,
        filepath: rawFiles[key].filepath,
      });
    }
  }
  return files;
};

module.exports = {
  createPublicId,
  parseMultipartForm,
  cleanFiles,
  cleanFields,
  cloudinary,
  uploadToCloudinary,
};

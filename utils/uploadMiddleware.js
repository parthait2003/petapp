const multer = require('multer');

// Configure storage options for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/imageupload'); // Path to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // File naming convention
  },
});

// Create the multer upload instance
const upload = multer({ storage });

// Middleware to handle single file upload
const uploadMiddleware = upload.single('image');

// Utility function to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

module.exports = {
  uploadMiddleware,
  runMiddleware,
};

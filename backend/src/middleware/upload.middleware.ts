import multer from 'multer';

// Use memory storage to avoid writing files to your server disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB per image
  },
  fileFilter: (req, file, cb) => {
    // Only accept standard image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});
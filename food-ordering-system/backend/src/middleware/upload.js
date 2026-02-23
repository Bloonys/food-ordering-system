const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
//use multer to handle file uploads, store in 'uploads/' directory with unique filenames, limit to 5MB and only allow images (jpeg, png, gif)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = uuidv4() + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

module.exports = upload;
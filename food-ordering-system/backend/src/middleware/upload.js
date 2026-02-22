const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 获取后缀
    const filename = uuidv4() + ext;              // uuid + 后缀
    cb(null, filename);
  }
});

// 文件过滤（只允许图片）
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'));
  }
};

// multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadDocument, getDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

// Multer storage config (temp local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/', protect, getDocuments);

module.exports = router;

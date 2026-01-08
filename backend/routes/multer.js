const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'insta-uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'avif', 'webp'],
  },
});

const upload = multer({ storage: storage });
module.exports = upload;

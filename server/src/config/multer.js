const multer = require('multer');

// Set storage engine for Multer
const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({ storage: storage });

module.exports = upload;

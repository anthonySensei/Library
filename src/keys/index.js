const fs = require('fs');
const path = require('path');
require('dotenv').config();
fs.writeFile(path.resolve(__dirname, process.env.STORAGE_FILE_NAME), process.env.STORAGE_KEY_FILE, (err) => {});

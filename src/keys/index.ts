import { writeFile } from 'fs';
import { config } from 'dotenv';
import path from 'path';

config();

const filePath = path.resolve(__dirname, process.env.STORAGE_FILE_NAME as string);
writeFile(filePath, process.env.STORAGE_KEY_FILE, (err) => {});

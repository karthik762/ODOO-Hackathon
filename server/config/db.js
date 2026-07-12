import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve root directory and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assetflow_db';

mongoose.connect(mongoURI)
  .then((conn) => {
    console.log(`✅ Connected to MongoDB Database: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.error(`❌ MongoDB Connection Failed: ${err.message}`);
  });

export default mongoose;

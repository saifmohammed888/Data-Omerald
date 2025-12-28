/**
 * List Users Script
 * 
 * Displays a table of users with their phone numbers
 * 
 * Usage:
 *   npx tsx list-users.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../omeraldDiagnostic-v3/.env.local') });
dotenv.config({ path: path.join(__dirname, '../../omeraldDiagnostic-v3/.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI or MONGODB_URI environment variable is not set');
  process.exit(1);
}

const listUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Fetch users with test phone numbers
    const users = await db.collection('users')
      .find({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0150)$/ } })
      .sort({ phoneNumber: 1 })
      .toArray();

    if (users.length === 0) {
      console.log('⚠️  No users found with test phone numbers');
      await mongoose.disconnect();
      return;
    }

    console.log(`📋 Found ${users.length} users\n`);
    console.log('='.repeat(80));
    console.log('USERNAME'.padEnd(40) + ' | ' + 'PHONE NUMBER');
    console.log('='.repeat(80));

    for (const user of users) {
      const userName = (user.userName || 'N/A').padEnd(40);
      const phoneNumber = user.phoneNumber || 'N/A';
      console.log(`${userName} | ${phoneNumber}`);
    }

    console.log('='.repeat(80));
    console.log(`\n✅ Total users: ${users.length}\n`);

    // Also output as markdown table
    console.log('\n📊 Markdown Table Format:\n');
    console.log('| Username | Phone Number |');
    console.log('|----------|--------------|');
    for (const user of users) {
      const userName = (user.userName || 'N/A').replace(/\|/g, '\\|');
      const phoneNumber = user.phoneNumber || 'N/A';
      console.log(`| ${userName} | ${phoneNumber} |`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the script
listUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  });



/**
 * Clear Test Data Script for Omerald Admin
 * 
 * Removes all generated test data from the database:
 * - Users with phone numbers matching test range (+1555 555 0101 to +1555 555 0200)
 * - All Activities
 * - All Reports
 * - All Parameters
 * - All Samples
 * - All Diagnosed Conditions
 * - All Vaccines
 * - All Doses
 * - All Durations
 * - UserSettings and DiagnosticSettings
 * 
 * Note: This script does NOT delete users from Clerk. You'll need to manually delete them from Clerk dashboard if needed.
 * 
 * Usage:
 *   tsx clear-data.ts
 *   or
 *   npx ts-node clear-data.ts
 * 
 * Environment Variables:
 *   MONGO_URI - MongoDB connection string
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import models from admin app
const adminModelsPath = path.join(__dirname, '../../omeraldAdmin/src/api/models');
const User = (await import(path.join(adminModelsPath, 'User.ts'))).default;
const Report = (await import(path.join(adminModelsPath, 'reports/report.ts'))).default;
const Parameter = (await import(path.join(adminModelsPath, 'reports/parameter.ts'))).default;
const Sample = (await import(path.join(adminModelsPath, 'reports/sample.ts'))).default;
const DiagnosedCondition = (await import(path.join(adminModelsPath, 'diagnosedCondition.ts'))).default;
const Vaccine = (await import(path.join(adminModelsPath, 'vaccine/vaccine.ts'))).default;
const Dose = (await import(path.join(adminModelsPath, 'vaccine/dose.ts'))).default;
const Duration = (await import(path.join(adminModelsPath, 'vaccine/duration.ts'))).default;
const Activity = (await import(path.join(adminModelsPath, 'Activity.ts'))).default;
const UserSetting = (await import(path.join(adminModelsPath, 'userSetting.ts'))).default;
const DiagnosticSetting = (await import(path.join(adminModelsPath, 'diagnosticSetting.ts'))).default;

// Database connection
const mongoURI = process.env.MONGO_URI || '';
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI environment variable is not set');
  process.exit(1);
}

// Clear all test data
const clearData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    // Wait for connection to be ready
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Verify connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    // Get database reference for native operations
    const db = mongoose.connection.db;

    console.log('🧹 Starting data cleanup...\n');

    // Clear Users (only test phone numbers: +15555550101 to +15555550200)
    console.log('👥 Clearing test Users...');
    const userResult = await db.collection('users').deleteMany({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0200)$/ } });
    console.log(`   ✅ Deleted ${userResult.deletedCount} users\n`);

    // Clear Activities
    console.log('📋 Clearing Activities...');
    const activityResult = await db.collection('activities').deleteMany({});
    console.log(`   ✅ Deleted ${activityResult.deletedCount} activities\n`);

    // Clear Reports
    console.log('📄 Clearing Reports...');
    const reportResult = await db.collection('reports').deleteMany({});
    console.log(`   ✅ Deleted ${reportResult.deletedCount} reports\n`);

    // Clear Parameters
    console.log('📊 Clearing Parameters...');
    const parameterResult = await db.collection('parameters').deleteMany({});
    console.log(`   ✅ Deleted ${parameterResult.deletedCount} parameters\n`);

    // Clear Samples
    console.log('🧪 Clearing Samples...');
    const sampleResult = await db.collection('samples').deleteMany({});
    console.log(`   ✅ Deleted ${sampleResult.deletedCount} samples\n`);

    // Clear Diagnosed Conditions
    console.log('🏥 Clearing Diagnosed Conditions...');
    const conditionResult = await db.collection('diagnosedconditions').deleteMany({});
    console.log(`   ✅ Deleted ${conditionResult.deletedCount} diagnosed conditions\n`);

    // Clear Doses
    console.log('💊 Clearing Doses...');
    const doseResult = await db.collection('doses').deleteMany({});
    console.log(`   ✅ Deleted ${doseResult.deletedCount} doses\n`);

    // Clear Vaccines
    console.log('💉 Clearing Vaccines...');
    const vaccineResult = await db.collection('vaccines').deleteMany({});
    console.log(`   ✅ Deleted ${vaccineResult.deletedCount} vaccines\n`);

    // Clear Durations
    console.log('📝 Clearing Durations...');
    const durationResult = await db.collection('dosedurations').deleteMany({});
    console.log(`   ✅ Deleted ${durationResult.deletedCount} durations\n`);

    // Clear Settings
    console.log('⚙️  Clearing Settings...');
    const userSettingResult = await db.collection('usersettings').deleteMany({});
    const diagnosticSettingResult = await db.collection('diagnosticsettings').deleteMany({});
    console.log(`   ✅ Deleted ${userSettingResult.deletedCount} user settings`);
    console.log(`   ✅ Deleted ${diagnosticSettingResult.deletedCount} diagnostic settings\n`);

    console.log('✅ Data cleanup completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users deleted: ${userResult.deletedCount}`);
    console.log(`   - Activities deleted: ${activityResult.deletedCount}`);
    console.log(`   - Reports deleted: ${reportResult.deletedCount}`);
    console.log(`   - Parameters deleted: ${parameterResult.deletedCount}`);
    console.log(`   - Samples deleted: ${sampleResult.deletedCount}`);
    console.log(`   - Diagnosed Conditions deleted: ${conditionResult.deletedCount}`);
    console.log(`   - Doses deleted: ${doseResult.deletedCount}`);
    console.log(`   - Vaccines deleted: ${vaccineResult.deletedCount}`);
    console.log(`   - Durations deleted: ${durationResult.deletedCount}`);
    console.log(`   - Settings deleted: ${userSettingResult.deletedCount + diagnosticSettingResult.deletedCount}\n`);

    console.log('⚠️  Note: This script does NOT delete users from Clerk.');
    console.log('   If you created users in Clerk, please delete them manually from the Clerk dashboard.\n');

  } catch (error) {
    console.error('❌ Error during data cleanup:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
clearData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  });

export { clearData };


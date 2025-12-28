/**
 * Export Data to Excel Script for Omerald Admin
 * 
 * Exports all generated test data to an Excel file with multiple sheets:
 * - Users
 * - Durations
 * - Vaccines
 * - Doses
 * - Samples
 * - Parameters
 * - Diagnosed Conditions
 * - Reports
 * - Activities
 * - Settings
 * 
 * Usage:
 *   npx tsx export-to-excel.ts
 * 
 * Environment Variables:
 *   MONGO_URI - MongoDB connection string
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGO_URI || '';
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI environment variable is not set');
  process.exit(1);
}

// Export data to Excel
const exportToExcel = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    // Wait for connection to be ready
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const workbook = XLSX.utils.book_new();

    console.log('📊 Exporting data to Excel...\n');

    // 1. Export Users
    console.log('👥 Exporting Users...');
    const users = await db.collection('users')
      .find({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0200)$/ } })
      .sort({ phoneNumber: 1 })
      .toArray();
    
    const usersData = users.map(user => ({
      'Phone Number': user.phoneNumber,
      'User Name': user.userName,
      'Role': user.role,
      'Created At': user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      'Deleted At': user.deletedAt ? new Date(user.deletedAt).toISOString().split('T')[0] : '',
      'User ID': user._id.toString(),
    }));
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');
    console.log(`   ✅ Exported ${users.length} users`);

    // 2. Export Durations
    console.log('📝 Exporting Durations...');
    const durations = await db.collection('dosedurations').find({}).toArray();
    const durationsData = durations.map(d => ({
      'Duration': d.duration,
      'Type': d.type,
      'ID': d._id.toString(),
    }));
    const durationsSheet = XLSX.utils.json_to_sheet(durationsData);
    XLSX.utils.book_append_sheet(workbook, durationsSheet, 'Durations');
    console.log(`   ✅ Exported ${durations.length} durations`);

    // 3. Export Vaccines
    console.log('💉 Exporting Vaccines...');
    const vaccines = await db.collection('vaccines').find({}).toArray();
    const vaccinesData = vaccines.map(v => ({
      'Name': v.name,
      'ID': v._id.toString(),
    }));
    const vaccinesSheet = XLSX.utils.json_to_sheet(vaccinesData);
    XLSX.utils.book_append_sheet(workbook, vaccinesSheet, 'Vaccines');
    console.log(`   ✅ Exported ${vaccines.length} vaccines`);

    // 4. Export Doses
    console.log('💊 Exporting Doses...');
    const doses = await db.collection('doses').find({}).toArray();
    const dosesData = doses.map(d => ({
      'Name': d.name,
      'Vaccine ID': d.vaccine?.toString() || '',
      'Dose Duration ID': d.doseDuration?.toString() || '',
      'Dose Type': d.doseType || '',
      'ID': d._id.toString(),
    }));
    const dosesSheet = XLSX.utils.json_to_sheet(dosesData);
    XLSX.utils.book_append_sheet(workbook, dosesSheet, 'Doses');
    console.log(`   ✅ Exported ${doses.length} doses`);

    // 5. Export Samples
    console.log('🧪 Exporting Samples...');
    const samples = await db.collection('samples').find({}).toArray();
    const samplesData = samples.map(s => ({
      'Name': s.name,
      'Description': s.description || '',
      'Validity': s.validity || '',
      'Is Active': s.isActive ? 'Yes' : 'No',
      'ID': s._id.toString(),
    }));
    const samplesSheet = XLSX.utils.json_to_sheet(samplesData);
    XLSX.utils.book_append_sheet(workbook, samplesSheet, 'Samples');
    console.log(`   ✅ Exported ${samples.length} samples`);

    // 6. Export Parameters
    console.log('📊 Exporting Parameters...');
    const parameters = await db.collection('parameters').find({}).toArray();
    const parametersData = parameters.map(p => ({
      'Parameter': p.parameter,
      'Description': p.description || '',
      'Unit': p.unit || '',
      'Alias': Array.isArray(p.alias) ? p.alias.join(', ') : (p.alias || ''),
      'Remedy': p.remedy || '',
      'Is Active': p.isActive ? 'Yes' : 'No',
      'ID': p._id.toString(),
    }));
    const parametersSheet = XLSX.utils.json_to_sheet(parametersData);
    XLSX.utils.book_append_sheet(workbook, parametersSheet, 'Parameters');
    console.log(`   ✅ Exported ${parameters.length} parameters`);

    // 7. Export Diagnosed Conditions
    console.log('🏥 Exporting Diagnosed Conditions...');
    const conditions = await db.collection('diagnosedconditions').find({}).toArray();
    const conditionsData = conditions.map(c => ({
      'Name': c.name,
      'Description': c.description || '',
      'Aliases': Array.isArray(c.aliases) ? c.aliases.join(', ') : (c.aliases || ''),
      'Status': c.status || '',
      'Parameter IDs': Array.isArray(c.params) ? c.params.join(', ') : (c.params || ''),
      'ID': c._id.toString(),
    }));
    const conditionsSheet = XLSX.utils.json_to_sheet(conditionsData);
    XLSX.utils.book_append_sheet(workbook, conditionsSheet, 'Diagnosed Conditions');
    console.log(`   ✅ Exported ${conditions.length} diagnosed conditions`);

    // 8. Export Reports
    console.log('📄 Exporting Reports...');
    const reports = await db.collection('reports').find({}).toArray();
    const reportsData = reports.map(r => ({
      'Test Name': r.testName,
      'Sample Name': r.sampleName,
      'Parameters Count': Array.isArray(r.parameters) ? r.parameters.length : 0,
      'Is Active': r.isActive ? 'Yes' : 'No',
      'Components Count': Array.isArray(r.components) ? r.components.length : 0,
      'Created At': r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
      'Updated At': r.updatedAt ? new Date(r.updatedAt).toISOString().split('T')[0] : '',
      'ID': r._id.toString(),
    }));
    const reportsSheet = XLSX.utils.json_to_sheet(reportsData);
    XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Reports');
    console.log(`   ✅ Exported ${reports.length} reports`);

    // 9. Export Activities (sample first 1000 for Excel size limits)
    console.log('📋 Exporting Activities...');
    const activities = await db.collection('activities')
      .find({})
      .sort({ timeStamp: -1 })
      .limit(1000)
      .toArray();
    const activitiesData = activities.map(a => ({
      'Title': a.title,
      'Description': a.description || '',
      'User Name': a.user?.userName || '',
      'User ID': a.user?._id?.toString() || '',
      'Action': a.action || '',
      'Timestamp': a.timeStamp ? new Date(a.timeStamp).toISOString() : '',
      'ID': a._id.toString(),
    }));
    const activitiesSheet = XLSX.utils.json_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(workbook, activitiesSheet, 'Activities');
    console.log(`   ✅ Exported ${activities.length} activities (limited to 1000 most recent)`);

    // 10. Export Settings
    console.log('⚙️  Exporting Settings...');
    const userSettings = await db.collection('usersettings').find({}).toArray();
    const diagnosticSettings = await db.collection('diagnosticsettings').find({}).toArray();
    
    const settingsData = [
      ...userSettings.map(s => ({
        'Type': 'User Settings',
        'FAQs': s.FAQs ? 'Yes' : 'No',
        'Privacy Policy': s.Privacy_Policy ? 'Yes' : 'No',
        'Terms of Service': s.Terms_Of_Service ? 'Yes' : 'No',
        'Platform Consent': s.Platform_Consent ? 'Yes' : 'No',
        'Disclaimer': s.Disclaimer ? 'Yes' : 'No',
        'Customer Support': s.Customer_Support || '',
        'ID': s._id.toString(),
      })),
      ...diagnosticSettings.map(s => ({
        'Type': 'Diagnostic Settings',
        'FAQs': s.FAQs ? 'Yes' : 'No',
        'Privacy Policy': s.Privacy_Policy ? 'Yes' : 'No',
        'Terms of Service': s.Terms_Of_Service ? 'Yes' : 'No',
        'Platform Consent': s.Platform_Consent ? 'Yes' : 'No',
        'Disclaimer': s.Disclaimer ? 'Yes' : 'No',
        'Customer Support': s.Customer_Support || '',
        'Ad Banners': Array.isArray(s.Ad_Banner) ? s.Ad_Banner.length : 0,
        'Customer Logos': Array.isArray(s.Customer_Logo) ? s.Customer_Logo.length : 0,
        'Testimonials': Array.isArray(s.Testimonials) ? s.Testimonials.length : 0,
        'ID': s._id.toString(),
      })),
    ];
    const settingsSheet = XLSX.utils.json_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');
    console.log(`   ✅ Exported ${userSettings.length + diagnosticSettings.length} settings documents`);

    // Write Excel file
    const excelPath = path.join(__dirname, 'omerald-admin-data.xlsx');
    XLSX.writeFile(workbook, excelPath);
    
    console.log(`\n✅ Excel file created successfully!`);
    console.log(`   📁 Location: ${excelPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Durations: ${durations.length}`);
    console.log(`   - Vaccines: ${vaccines.length}`);
    console.log(`   - Doses: ${doses.length}`);
    console.log(`   - Samples: ${samples.length}`);
    console.log(`   - Parameters: ${parameters.length}`);
    console.log(`   - Diagnosed Conditions: ${conditions.length}`);
    console.log(`   - Reports: ${reports.length}`);
    console.log(`   - Activities: ${activities.length} (of ${await db.collection('activities').countDocuments()} total)`);
    console.log(`   - Settings: ${userSettings.length + diagnosticSettings.length}`);

  } catch (error) {
    console.error('❌ Error during export:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the script
exportToExcel()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  });


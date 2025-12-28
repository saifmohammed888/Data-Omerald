/**
 * Export All DC Data to Excel
 * 
 * Creates a comprehensive Excel file with all data needed for manual flow checking
 * from onboarding to end, including:
 * - Users
 * - Diagnostic Centers
 * - Branches
 * - User-DC-Branch Relationships
 * - Tests (Sample Types)
 * - Reports
 * - Pathologists
 * 
 * Usage:
 *   npx tsx export-to-excel.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

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

const exportToExcel = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const workbook = XLSX.utils.book_new();

    console.log('📊 Fetching data from MongoDB...\n');

    // 1. USERS SHEET
    console.log('📋 Sheet 1: Users...');
    const users = await db.collection('users')
      .find({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0150)$/ } })
      .toArray();
    
    const usersData = users.map(user => ({
      'User ID': String(user._id),
      'User Name': user.userName || '',
      'Phone Number': user.phoneNumber || '',
      'Total DCs': user.diagnosticCenters?.length || 0,
      'DC IDs': user.diagnosticCenters?.map((dc: any) => String(dc.diagnostic)).join(', ') || '',
    }));
    
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');

    // 2. DIAGNOSTIC CENTERS SHEET
    console.log('📋 Sheet 2: Diagnostic Centers...');
    const profiles = await db.collection('profiles').find({}).toArray();
    
    // Get owner names
    const ownerIds = [...new Set(profiles.map(p => String(p.ownerId)))];
    const ownerUsers = await db.collection('users')
      .find({ _id: { $in: ownerIds.map(id => new mongoose.Types.ObjectId(id)) } })
      .toArray();
    const ownerMap = new Map(ownerUsers.map(u => [String(u._id), u.userName]));
    
    const dcData = profiles.map(dc => ({
      'DC ID': String(dc._id),
      'Center Name': dc.centerName || '',
      'Email': dc.email || '',
      'Phone Number': dc.phoneNumber || '',
      'Owner Name': ownerMap.get(String(dc.ownerId)) || 'N/A',
      'Owner ID': String(dc.ownerId),
      'Total Branches': dc.branches?.length || 0,
      'Total Tests': dc.tests?.length || 0,
      'Logo URL': dc.brandingInfo?.logoUrl || '',
      'Banner URL': dc.brandingInfo?.bannerUrl || '',
    }));
    
    const dcSheet = XLSX.utils.json_to_sheet(dcData);
    XLSX.utils.book_append_sheet(workbook, dcSheet, 'Diagnostic Centers');

    // 3. BRANCHES SHEET
    console.log('📋 Sheet 3: Branches...');
    const branches = await db.collection('branches').find({}).toArray();
    
    // Map branch IDs to DC IDs
    const branchToDC = new Map<string, string>();
    profiles.forEach(dc => {
      (dc.branches || []).forEach((branchId: any) => {
        branchToDC.set(String(branchId), String(dc._id));
      });
    });
    
    const branchesData = branches.map(branch => {
      const dcId = branchToDC.get(String(branch._id));
      const dc = profiles.find(p => String(p._id) === dcId);
      const pathologist = branch.pathologistDetail?.[0];
      
      return {
        'Branch ID': String(branch._id),
        'Branch Name': branch.branchName || '',
        'DC Name': dc?.centerName || 'N/A',
        'DC ID': dcId || 'N/A',
        'Email': branch.branchEmail || '',
        'Address': branch.branchAddress || '',
        'Contact': branch.branchContact || '',
        'Status': branch.branchStatus || '',
        'Logo URL': branch.branchLogo || '',
        'Total Operators': branch.branchOperator?.length || 0,
        'Total Reports': branch.reports?.length || 0,
        'Pathologist Name': pathologist?.name || 'N/A',
        'Pathologist Designation': pathologist?.designation || 'N/A',
        'Pathologist Signature URL': pathologist?.signature || 'N/A',
      };
    });
    
    const branchesSheet = XLSX.utils.json_to_sheet(branchesData);
    XLSX.utils.book_append_sheet(workbook, branchesSheet, 'Branches');

    // 4. USER-DC-BRANCH RELATIONSHIPS SHEET
    console.log('📋 Sheet 4: User-DC-Branch Relationships...');
    const relationshipsData: any[] = [];
    
    users.forEach(user => {
      (user.diagnosticCenters || []).forEach((dcEntry: any) => {
        const dc = profiles.find(p => String(p._id) === String(dcEntry.diagnostic));
        (dcEntry.branches || []).forEach((branchEntry: any) => {
          const branch = branches.find(b => String(b._id) === String(branchEntry.branchId));
          relationshipsData.push({
            'User Name': user.userName || '',
            'User Phone': user.phoneNumber || '',
            'User ID': String(user._id),
            'DC Name': dc?.centerName || 'N/A',
            'DC ID': String(dcEntry.diagnostic),
            'Branch Name': branch?.branchName || 'N/A',
            'Branch ID': String(branchEntry.branchId),
            'Role': branchEntry.roleName || 'N/A',
          });
        });
      });
    });
    
    const relationshipsSheet = XLSX.utils.json_to_sheet(relationshipsData);
    XLSX.utils.book_append_sheet(workbook, relationshipsSheet, 'User-DC-Branch Roles');

    // 5. TESTS SHEET
    console.log('📋 Sheet 5: Tests (Sample Types)...');
    const tests = await db.collection('tests').find({}).toArray();
    
    const testsData = tests.map(test => {
      const branch = branches.find(b => String(b._id) === String(test.branchId));
      const dcId = branchToDC.get(String(test.branchId));
      const dc = profiles.find(p => String(p._id) === dcId);
      const parametersCount = (test.parameters || []).length;
      
      return {
        'Test ID': String(test._id),
        'Test Name': test.testName || '',
        'Sample Type': test.sampleName || '',
        'DC Name': dc?.centerName || 'N/A',
        'DC ID': dcId || 'N/A',
        'Branch Name': branch?.branchName || 'N/A',
        'Branch ID': String(test.branchId),
        'Parameters Count': parametersCount,
        'Is Active': test.isActive ? 'Yes' : 'No',
        'Created At': test.createdAt ? new Date(test.createdAt).toLocaleString() : 'N/A',
      };
    });
    
    const testsSheet = XLSX.utils.json_to_sheet(testsData);
    XLSX.utils.book_append_sheet(workbook, testsSheet, 'Tests');

    // 6. REPORTS SHEET
    console.log('📋 Sheet 6: Reports...');
    const reports = await db.collection('reports').find({}).toArray();
    
    const reportsData = reports.map(report => {
      const dcId = String(report.diagnosticCenter?.diagnostic);
      const dc = profiles.find(p => String(p._id) === dcId);
      const branchId = report.diagnosticCenter?.branch;
      const branch = branches.find(b => String(b._id) === String(branchId));
      const testId = report.reportData?.parsedData?.test;
      const sharedDetails = report.sharedReportDetails?.[0];
      
      return {
        'Report ID': String(report._id),
        'Patient Name': report.patient?.name || '',
        'Patient DOB': report.patient?.dob || '',
        'Patient Gender': report.patient?.gender || '',
        'Patient Phone': report.patient?.contact?.phone || '',
        'Patient Email': report.patient?.contact?.email || '',
        'DC Name': dc?.centerName || 'N/A',
        'DC ID': dcId || 'N/A',
        'Branch Name': branch?.branchName || 'N/A',
        'Branch ID': String(branchId) || 'N/A',
        'Report Name': report.reportData?.reportName || '',
        'Test ID': testId ? String(testId) : 'N/A',
        'Report Date': report.reportData?.reportDate ? new Date(report.reportData.reportDate).toLocaleString() : 'N/A',
        'Pathologist Name': report.pathologist?.name || 'N/A',
        'Pathologist ID': report.pathologist?.id || 'N/A',
        'Shared With': sharedDetails?.userContact || 'N/A',
        'Shared Status': sharedDetails?.accepted ? 'Accepted' : sharedDetails?.rejected ? 'Rejected' : 'Pending',
        'Shared At': sharedDetails?.sharedAt ? new Date(sharedDetails.sharedAt).toLocaleString() : 'N/A',
      };
    });
    
    const reportsSheet = XLSX.utils.json_to_sheet(reportsData);
    XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Reports');

    // 7. ONBOARDING FLOW SHEET (Step-by-step guide)
    console.log('📋 Sheet 7: Onboarding Flow Guide...');
    const onboardingData = [
      { 'Step': 1, 'Action': 'Create User in Clerk', 'Details': 'Register user with phone number (+15555550101 onwards)', 'Example': 'User: Ramya Gandhi, Phone: +15555550101' },
      { 'Step': 2, 'Action': 'Create Diagnostic Center', 'Details': 'DC owner creates a new diagnostic center', 'Example': `DC: ${profiles[0]?.centerName || 'BLK Labs'}, Owner: ${ownerMap.get(String(profiles[0]?.ownerId)) || 'Owner Name'}` },
      { 'Step': 3, 'Action': 'Add Branches to DC', 'Details': 'Add branches to the diagnostic center (2 branches per DC)', 'Example': `Branch: ${branches[0]?.branchName || 'Main Branch'}, DC: ${profiles[0]?.centerName || 'DC Name'}` },
      { 'Step': 4, 'Action': 'Assign Users to Branches', 'Details': 'Assign users with roles (owner, admin, manager, spoc, operator)', 'Example': `User: ${users[0]?.userName || 'User'}, Role: owner, Branch: ${branches[0]?.branchName || 'Branch'}` },
      { 'Step': 5, 'Action': 'Add Pathologists', 'Details': 'Add pathologists to branches with signature', 'Example': `Pathologist: ${branches[0]?.pathologistDetail?.[0]?.name || 'Dr. Name'}, Branch: ${branches[0]?.branchName || 'Branch'}` },
      { 'Step': 6, 'Action': 'Create Tests', 'Details': 'Create test templates with parameters (51 sample types available)', 'Example': `Test: ${tests[0]?.testName || 'CBC'}, Sample: ${tests[0]?.sampleName || 'Whole Blood'}, Branch: ${branches[0]?.branchName || 'Branch'}` },
      { 'Step': 7, 'Action': 'Generate Reports', 'Details': 'Create reports for patients with test results', 'Example': `Report: ${reports[0]?.reportData?.reportName || 'Test Report'}, Patient: ${reports[0]?.patient?.name || 'Patient Name'}, Branch: ${branches[0]?.branchName || 'Branch'}` },
      { 'Step': 8, 'Action': 'Share Reports', 'Details': 'Share reports with patients via phone/email', 'Example': `Report ID: ${reports[0]?._id || 'Report ID'}, Shared with: ${reports[0]?.sharedReportDetails?.[0]?.userContact || 'Phone'}` },
    ];
    
    const onboardingSheet = XLSX.utils.json_to_sheet(onboardingData);
    XLSX.utils.book_append_sheet(workbook, onboardingSheet, 'Onboarding Flow');

    // 8. SUMMARY SHEET
    console.log('📋 Sheet 8: Summary Statistics...');
    const summaryData = [
      { 'Metric': 'Total Users', 'Count': users.length, 'Details': 'Users with phone numbers +15555550101 to +15555550150' },
      { 'Metric': 'Total Diagnostic Centers', 'Count': profiles.length, 'Details': '5 DCs (1 user owns 3 DCs, 1 user owns 2 DCs)' },
      { 'Metric': 'Total Branches', 'Count': branches.length, 'Details': '10 branches (2 per DC)' },
      { 'Metric': 'Total Tests', 'Count': tests.length, 'Details': `${tests.length} unique sample types` },
      { 'Metric': 'Total Reports', 'Count': reports.length, 'Details': `${Math.floor(reports.length / branches.length)} reports per branch` },
      { 'Metric': 'Total Pathologists', 'Count': branches.reduce((sum, b) => sum + (b.pathologistDetail?.length || 0), 0), 'Details': '1 pathologist per branch' },
      { 'Metric': 'Total User-DC-Branch Relationships', 'Count': relationshipsData.length, 'Details': 'Role assignments across all DCs and branches' },
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Write the Excel file
    const outputPath = path.join(__dirname, 'dc-data-manual-flow.xlsx');
    XLSX.writeFile(workbook, outputPath);
    
    console.log(`\n✅ Excel file created successfully!`);
    console.log(`📄 File location: ${outputPath}`);
    console.log(`\n📊 Sheets created:`);
    console.log(`   1. Users (${users.length} users)`);
    console.log(`   2. Diagnostic Centers (${profiles.length} DCs)`);
    console.log(`   3. Branches (${branches.length} branches)`);
    console.log(`   4. User-DC-Branch Roles (${relationshipsData.length} relationships)`);
    console.log(`   5. Tests (${tests.length} tests)`);
    console.log(`   6. Reports (${reports.length} reports)`);
    console.log(`   7. Onboarding Flow (8 steps)`);
    console.log(`   8. Summary (${summaryData.length} metrics)`);

  } catch (error) {
    console.error('❌ Error:', error);
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


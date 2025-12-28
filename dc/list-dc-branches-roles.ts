/**
 * List DCs, Branches, and User Roles Script
 * 
 * Displays a table of Diagnostic Centers, Branches, and User Roles
 * 
 * Usage:
 *   npx tsx list-dc-branches-roles.ts
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

const listDCBranchesRoles = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Fetch all DCs (profiles)
    const profiles = await db.collection('profiles')
      .find({})
      .toArray();

    if (profiles.length === 0) {
      console.log('⚠️  No diagnostic centers found');
      await mongoose.disconnect();
      return;
    }

    console.log(`📋 Found ${profiles.length} Diagnostic Centers\n`);
    console.log('='.repeat(100));

    // Fetch all branches
    const allBranches = await db.collection('branches')
      .find({})
      .toArray();

    // Fetch all users
    const allUsers = await db.collection('users')
      .find({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0150)$/ } })
      .toArray();

    // Create maps for quick lookup
    const branchMap = new Map();
    allBranches.forEach(branch => {
      branchMap.set(String(branch._id), branch);
    });

    const userMap = new Map();
    allUsers.forEach(user => {
      userMap.set(String(user._id), user);
    });

    // Display DCs with branches and roles
    for (let dcIdx = 0; dcIdx < profiles.length; dcIdx++) {
      const dc = profiles[dcIdx];
      console.log(`\n${'='.repeat(100)}`);
      console.log(`🏥 DIAGNOSTIC CENTER #${dcIdx + 1}: ${dc.centerName}`);
      console.log(`   Email: ${dc.email || 'N/A'}`);
      console.log(`   Phone: ${dc.phoneNumber || 'N/A'}`);
      console.log(`   Owner ID: ${dc.ownerId || 'N/A'}`);
      
      const owner = userMap.get(String(dc.ownerId));
      if (owner) {
        console.log(`   Owner: ${owner.userName || 'N/A'} (${owner.phoneNumber || 'N/A'})`);
      }

      const branchIds = dc.branches || [];
      console.log(`\n   📍 BRANCHES (${branchIds.length}):`);
      console.log('   ' + '-'.repeat(96));

      for (let branchIdx = 0; branchIdx < branchIds.length; branchIdx++) {
        const branchId = branchIds[branchIdx];
        const branch = branchMap.get(String(branchId));
        
        if (!branch) {
          console.log(`   Branch ${branchIdx + 1}: Not found (ID: ${branchId})`);
          continue;
        }

        console.log(`\n   📍 Branch ${branchIdx + 1}: ${branch.branchName}`);
        console.log(`      Address: ${branch.branchAddress || 'N/A'}`);
        console.log(`      Email: ${branch.branchEmail || 'N/A'}`);
        console.log(`      Contact: ${branch.branchContact || 'N/A'}`);
        console.log(`      Status: ${branch.branchStatus || 'N/A'}`);

        // Get users in this branch
        const operators = branch.branchOperator || [];
        console.log(`\n      👥 USERS (${operators.length}):`);

        // Find users with roles in this branch/DC
        const usersInBranch: Array<{ user: any; role: string }> = [];
        
        for (const user of allUsers) {
          if (!user.diagnosticCenters) continue;
          
          for (const dcEntry of user.diagnosticCenters) {
            if (String(dcEntry.diagnostic) === String(dc._id)) {
              if (dcEntry.branches) {
                for (const branchEntry of dcEntry.branches) {
                  if (String(branchEntry.branchId) === String(branchId)) {
                    usersInBranch.push({
                      user,
                      role: branchEntry.roleName || 'N/A',
                    });
                  }
                }
              }
            }
          }
        }

        if (usersInBranch.length > 0) {
          console.log(`      ${'Username'.padEnd(35)} | ${'Phone Number'.padEnd(18)} | Role`);
          console.log(`      ${'-'.repeat(35)} | ${'-'.repeat(18)} | ${'-'.repeat(10)}`);
          
          for (const { user, role } of usersInBranch) {
            const userName = (user.userName || 'N/A').padEnd(35);
            const phone = (user.phoneNumber || 'N/A').padEnd(18);
            console.log(`      ${userName} | ${phone} | ${role}`);
          }
        } else {
          console.log(`      No users assigned to this branch`);
        }

        // Show pathologists
        const pathologists = branch.pathologistDetail || [];
        if (pathologists.length > 0) {
          console.log(`\n      👨‍⚕️  PATHOLOGISTS (${pathologists.length}):`);
          for (const patho of pathologists) {
            console.log(`         • ${patho.name || 'N/A'} - ${patho.designation || 'N/A'}`);
          }
        }
      }
    }

    console.log(`\n${'='.repeat(100)}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Diagnostic Centers: ${profiles.length}`);
    console.log(`   - Total Branches: ${allBranches.length}`);
    console.log(`   - Total Users: ${allUsers.length}`);
    console.log('');

    // Create markdown summary
    console.log('\n📋 Markdown Format:\n');
    console.log('## Diagnostic Centers, Branches, and User Roles\n');
    
    for (let dcIdx = 0; dcIdx < profiles.length; dcIdx++) {
      const dc = profiles[dcIdx];
      const owner = userMap.get(String(dc.ownerId));
      
      console.log(`### ${dcIdx + 1}. ${dc.centerName}`);
      console.log(`- **Email:** ${dc.email || 'N/A'}`);
      console.log(`- **Phone:** ${dc.phoneNumber || 'N/A'}`);
      if (owner) {
        console.log(`- **Owner:** ${owner.userName || 'N/A'} (${owner.phoneNumber || 'N/A'})`);
      }
      console.log('');

      const branchIds = dc.branches || [];
      for (let branchIdx = 0; branchIdx < branchIds.length; branchIdx++) {
        const branchId = branchIds[branchIdx];
        const branch = branchMap.get(String(branchId));
        
        if (!branch) continue;

        console.log(`#### Branch ${branchIdx + 1}: ${branch.branchName}`);
        console.log(`- **Address:** ${branch.branchAddress || 'N/A'}`);
        console.log(`- **Email:** ${branch.branchEmail || 'N/A'}`);
        console.log(`- **Contact:** ${branch.branchContact || 'N/A'}`);
        console.log('');

        // Find users with roles in this branch/DC
        const usersInBranch: Array<{ user: any; role: string }> = [];
        
        for (const user of allUsers) {
          if (!user.diagnosticCenters) continue;
          
          for (const dcEntry of user.diagnosticCenters) {
            if (String(dcEntry.diagnostic) === String(dc._id)) {
              if (dcEntry.branches) {
                for (const branchEntry of dcEntry.branches) {
                  if (String(branchEntry.branchId) === String(branchId)) {
                    usersInBranch.push({
                      user,
                      role: branchEntry.roleName || 'N/A',
                    });
                  }
                }
              }
            }
          }
        }

        if (usersInBranch.length > 0) {
          console.log('| Username | Phone Number | Role |');
          console.log('|----------|--------------|------|');
          for (const { user, role } of usersInBranch) {
            const userName = (user.userName || 'N/A').replace(/\|/g, '\\|');
            const phone = user.phoneNumber || 'N/A';
            console.log(`| ${userName} | ${phone} | ${role} |`);
          }
          console.log('');
        }
      }
      console.log('');
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
listDCBranchesRoles()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  });



# Omerald Admin - Test Data Generation Scripts

This directory contains scripts for generating and managing test data for the Omerald Admin application.

## Overview

These scripts generate a year's worth of realistic backdated sample data including:
- **100 Users** (25 per role: admin, manager, sme, legal)
- **Reports** with parameters and components
- **Parameters** with bio reference ranges
- **Samples**, **Vaccines**, **Doses**, **Durations**
- **Diagnosed Conditions**
- **Activities** (aligned with entity creation dates)
- **Settings** (User & Diagnostic)
- **~10 manual validation users** with easy-to-remember names

## Prerequisites

1. **Node.js** (v18 or higher)
2. **TypeScript** (`npm install -g typescript tsx` or `npm install -g ts-node`)
3. **MongoDB** connection string
4. **(Optional)** Clerk secret key for user registration

## Installation

1. Install dependencies in the admin app:
   ```bash
   cd ../../omeraldAdmin
   npm install
   ```

2. Install Clerk SDK (optional, only if you want to register users in Clerk):
   ```bash
   cd ../../omeraldAdmin
   npm install @clerk/clerk-sdk-node
   ```

3. Set up environment variables (see below)

## Environment Variables

Create a `.env` file in this directory or set environment variables in your shell:

```bash
# Required
MONGO_URI=mongodb://localhost:27017/omerald-admin
# or
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/omerald-admin

# Optional - Only needed if you want to register users in Clerk
CLERK_SECRET_KEY=sk_test_...
```

Alternatively, the script will also check for `.env.local` and `.env` files in the `omeraldAdmin` directory.

## Usage

### Generate Data

```bash
# Using tsx (recommended - faster)
npx tsx generate-data.ts

# Or using ts-node
npx ts-node generate-data.ts
```

The script will:
1. Connect to MongoDB
2. Clear existing test data (users with phone numbers +1555 555 XXXX)
3. Generate and insert all data with backdated timestamps
4. Optionally create users in Clerk (if CLERK_SECRET_KEY is provided)
5. Display a summary of created data

### Clear Data

```bash
# Using tsx (recommended)
npx tsx clear-data.ts

# Or using ts-node
npx ts-node clear-data.ts
```

The script will:
1. Connect to MongoDB
2. Delete all test users (phone numbers +1555 555 XXXX)
3. Delete all activities, reports, parameters, samples, conditions, vaccines, doses, durations
4. Delete settings
5. Display a summary of deleted data

**Note:** The clear script does NOT delete users from Clerk. You'll need to manually delete them from the Clerk dashboard if needed.

## Phone Numbers

Test data uses phone numbers in the range:
- **Start**: `+15555550101` (displayed as `+1555 555 0101`)
- **End**: `+15555550200` (displayed as `+1555 555 0200`)
- **Total**: 100 users
- **Format**: Stored without spaces (`+15555550101`) for Clerk and MongoDB compatibility

### Role Distribution

- **admin**: Phone numbers ending 0101-0125 (25 users)
- **manager**: Phone numbers ending 0126-0150 (25 users)
- **sme**: Phone numbers ending 0151-0175 (25 users)
- **legal**: Phone numbers ending 0176-0200 (25 users)

### Manual Validation Users (First 10)

Easy-to-remember users for manual testing:

1. Admin User (+15555550101) - admin
2. Manager User (+15555550126) - manager
3. SME User (+15555550151) - sme
4. Legal User (+15555550176) - legal
5. John Doe (+15555550105) - admin
6. Jane Smith (+15555550130) - manager
7. Bob Johnson (+15555550155) - sme
8. Alice Williams (+15555550180) - legal
9. Charlie Brown (+15555550109) - admin
10. Diana Davis (+15555550134) - manager

**Note**: Phone numbers are stored without spaces in the database. When logging in with Clerk, use the format: `+15555550101`

## Clerk Integration

### Automatic User Registration

If `CLERK_SECRET_KEY` is provided, the script will automatically:
1. Create users in Clerk with matching phone numbers
2. Extract first and last names from `userName` field
3. Use phone-based authentication (no email required)

### Manual Clerk User Deletion

If you need to delete Clerk users after clearing database data:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users
3. Search for phone numbers matching `+15555550XXX` (no spaces)
4. Delete users individually or use bulk delete

Alternatively, you can use Clerk API:
```bash
# List users
curl -X GET "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer sk_test_..."

# Delete user
curl -X DELETE "https://api.clerk.com/v1/users/{user_id}" \
  -H "Authorization: Bearer sk_test_..."
```

**Note**: When searching in Clerk dashboard, use the format without spaces: `+15555550101`

## Data Characteristics

### Time Range
- **Start Date**: January 1st, 1 year ago
- **End Date**: Today
- All timestamps are backdated within this range

### User Creation Distribution
- More recent dates have more users (realistic distribution)
- User creation dates are evenly distributed across the year

### Activities
- 5-20 activities per user
- Activities are aligned with related entity creation/update dates
- Mixed actions: added, updated, deleted

### Reports
- 15 different test types
- 5-15 parameters per report
- 2 components per report (Overview, Interpretation)
- Realistic bio reference ranges

## Troubleshooting

### MongoDB Connection Error

```
❌ Error: MONGO_URI environment variable is not set
```

**Solution**: Set the `MONGO_URI` environment variable or create a `.env` file.

### Clerk User Creation Fails

```
⚠️  Clerk user creation failed: ...
```

**Solutions**:
1. Check that `CLERK_SECRET_KEY` is correct
2. Ensure Clerk SDK is installed: `npm install @clerk/clerk-sdk-node`
3. Verify phone numbers are valid format
4. Check Clerk dashboard for rate limits

### TypeScript/Module Errors

```
Cannot find module '...'
```

**Solutions**:
1. Ensure you're running from the correct directory
2. Install dependencies in the admin app: `cd ../../omeraldAdmin && npm install`
3. Use `tsx` instead of `ts-node` for better ES module support

### Duplicate Key Errors

If you see duplicate key errors, the script should have cleared existing data first. Try running the clear script manually:

```bash
npx tsx clear-data.ts
```

Then run the generate script again.

## File Structure

```
data/admin/
├── README.md                   # This file
├── SCHEMA_DOCUMENTATION.md     # Detailed schema documentation
├── generate-data.ts            # Data generation script
├── clear-data.ts               # Data cleanup script
└── .env                        # Environment variables (create this)
```

## Schema Documentation

For detailed schema information, see [SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md).

## Support

For issues or questions:
1. Check the schema documentation
2. Review error messages carefully
3. Verify environment variables are set correctly
4. Check MongoDB connection and permissions
5. Verify Clerk credentials if using Clerk integration

## Notes

- The scripts use ES modules (import/export) - use `tsx` or `ts-node` with ES module support
- Phone numbers are stored without spaces: `+15555550101` (Clerk and MongoDB format)
- All dates are backdated for realistic historical data
- Users are created with realistic first and last names
- Activities are aligned with entity creation dates for consistency
- Settings are created as single document instances
- Clerk SDK (`@clerk/clerk-sdk-node`) must be installed separately if using Clerk integration


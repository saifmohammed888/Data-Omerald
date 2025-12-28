# Omerald User App - Test Data Generation

This directory contains scripts to generate comprehensive test data for the Omerald User App with **different combinations** for thorough testing.

## Overview

The scripts generate **10 users with varying data combinations**:
- **Varying numbers of family members** (0-5 per user)
- **Varying numbers of user-uploaded reports** (0-10+ per user)
- **Varying numbers of member reports** (0-10 per user)
- **Varying numbers of DC shared reports** (pending and accepted)
- **User-shared reports** (reports shared between users)
- **Complete member data**: BMI, MUAC, Anthropometric, IAP Growth Charts, Food Allergies, Diagnosed Conditions
- **Pediatric members** with complete pediatric-specific data
- **All data backdated over 1 year** for realistic testing
- **Real PDF reports** uploaded to S3
- **Actual DC reports** from diagnostic centers

## User Combinations

Each of the 10 users has a different data configuration:

| User | Members | User Reports | Member Reports | DC Pending | DC Accepted | User Shared |
|------|---------|--------------|----------------|------------|-------------|-------------|
| 1    | 0       | 5            | 0              | 0          | 0           | 0           |
| 2    | 3       | 0            | 6              | 2          | 0           | 0           |
| 3    | 5       | 3            | 10             | 2          | 2           | 1           |
| 4    | 2       | 1            | 4              | 1          | 1           | 0           |
| 5    | 0       | 0            | 0              | 3          | 0           | 0           |
| 6    | 1       | 10           | 2              | 0          | 3           | 2           |
| 7    | 4       | 2            | 8              | 0          | 0           | 1           |
| 8    | 3       | 4            | 6              | 1          | 2           | 0           |
| 9    | 5       | 0            | 0              | 0          | 0           | 0           |
| 10   | 2       | 8            | 4              | 2          | 1           | 1           |

## Prerequisites

1. **MongoDB Connection**: Set `MONGO_URI` or `MONGODB_URI` environment variable
2. **AWS S3 Configuration** (for PDF uploads):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME`
   - `AWS_REGION`
3. **DC Data**: Ensure DC data is generated first (`data/dc/generate-data.ts`) for shared reports integration

## Installation

```bash
npm install
```

## Usage

### Generate Data

```bash
npx tsx generate-data.ts
```

This will:
1. Clear existing test data
2. Create 10 users with different combinations
3. Add family members (0-5 per user) with complete data
4. Generate and upload PDF reports to S3 for users and members
5. Link DC shared reports from actual diagnostic centers
6. Create user-shared reports between users
7. Generate all member health data (BMI, MUAC, etc.)

### Clear Data

```bash
npx tsx clear-data.ts
```

This will:
1. Delete all profiles with phone numbers +15555550101 to +15555550170
2. Delete all user reports
3. Note: DC reports are NOT deleted (they belong to the DC app)

## Data Structure

### Users
- Phone numbers: +15555550101 to +15555550120
- Telugu Indian names
- Full profile data (DOB, gender, blood group, address, etc.)
- Primary user type
- **BMI data** (3-6 records backdated over 1 year)
- **Food Allergies** (0-3 allergies)
- **Diagnosed Conditions** (0-2 conditions)

### Family Members
- Phone numbers: +15555550121 onwards
- Varying numbers per user (0-5)
- Relations: Father, Mother, Son, Daughter, Brother, Sister
- Appropriate DOB ranges based on relation
- Member user type
- Linked to primary user via `members` array

#### Member Health Data (All Members)
- **BMI**: 3-6 records with height, weight, BMI calculations (backdated over 1 year)
- **Food Allergies**: 0-3 food allergies
- **Diagnosed Conditions**: 0-2 medical conditions

#### Pediatric Members (Son/Daughter)
- **MUAC** (Mid-Upper Arm Circumference): 2-4 records (backdated over 1 year)
- **Anthropometric**: 2-4 records (head/chest circumference, etc.)
- **IAP Growth Charts**: 4-8 records with age, weight, height tracking (backdated over 1 year)
- All pediatric-specific measurements are age-appropriate

### Reports

#### User-Uploaded Reports
- Stored in `reports` collection
- Have `userId` field
- PDF files uploaded to S3
- Status: 'accepted'
- Linked to user profile via `reports` array
- All reports are backdated over 1 year

#### Member Reports
- Same structure as user reports
- Linked to member profiles
- Created by primary user

#### DC Shared Reports (Pending)
- DC reports with `sharedReportDetails` containing user's phone number
- `accepted: false`
- `userId: null`
- Accessible via DC API
- From actual diagnostic centers

#### DC Shared Reports (Accepted)
- DC reports with `sharedReportDetails` containing user's phone number
- `accepted: true`
- `userId: <profile_id>`
- Accessible via DC API
- From actual diagnostic centers

#### User-Shared Reports
- Reports shared from one user to another
- Stored in `sharedWith` array of report document
- Added to target user's `sharedReports` array in profile
- Shared dates backdated over 1 year

## Data Backdating

All data is backdated over a **1 year period**:
- User creation dates: Random dates over past year
- Report dates: Random dates over past year
- BMI/MUAC/Anthropometric records: Distributed over past year
- IAP Growth Charts: Multiple records over past year
- Food allergies: Random dates over past year
- Diagnosed conditions: Random dates over past year
- DC shared reports: Random dates over past year
- User-shared reports: Random dates over past year

## DC Integration

The script attempts to link DC reports by:
1. Finding DC reports with `diagnosticCenter` and `sharedReportDetails` fields
2. Adding user phone numbers to `sharedReportDetails` array
3. Setting appropriate `accepted` status (pending or accepted)
4. Using actual DC reports from the diagnostic center database

**Note**: If DC reports are not found, ensure:
1. DC data has been generated (`data/dc/generate-data.ts`)
2. DC reports are in the same MongoDB database
3. DC reports have `diagnosticCenter` field (not `userId` field)

## Environment Variables

Create a `.env` file or set environment variables:

```env
MONGO_URI=mongodb://localhost:27017/your-database
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
```

## Output Summary

The script generates:
- **10 Users** with complete profiles and varying data combinations
- **~25 Family Members** (varying per user, 0-5 each)
- **~50 User-uploaded Reports** (varying per user, 0-10 each)
- **~50 Member Reports** (varying per user, 0-10 each)
- **~20 DC Shared Reports** (pending and accepted, from actual DCs)
- **~5 User-shared Reports** (shared between users)
- **All health data**: BMI, MUAC, Anthropometric, IAP Growth Charts, Food Allergies, Diagnosed Conditions
- **All data backdated** over 1 year period

All PDF reports are uploaded to S3 and URLs are stored in the database.

## Testing Scenarios Covered

1. **User with no members, only reports** (User 1)
2. **User with members, no user reports** (User 2, 9)
3. **User with full setup** (User 3)
4. **User with minimal data** (User 4)
5. **User with only DC pending reports** (User 5)
6. **User with many reports and accepted DC reports** (User 6)
7. **User with no DC reports** (User 7)
8. **User with mixed data** (User 8)
9. **User with many user reports** (User 10)
10. **Pediatric members** with complete pediatric data (Sons/Daughters)

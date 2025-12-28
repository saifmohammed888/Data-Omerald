# Omerald User App - Test Data Generation

This directory contains scripts to generate comprehensive test data for the Omerald User App.

## Overview

The scripts generate:
- **10 Users** (phone numbers +15555550101 to +15555550120) with Telugu Indian names
- **5 Family Members per user** (Father, Mother, Son, Brother, Sister) with appropriate relationships
- **User-uploaded Reports** (3 per user, 2 per member) - Real PDF reports uploaded to S3
- **DC Shared Reports** (pending and accepted) - Integrated with Diagnostic Center data
- **Manual Test Records** (3-5 records) - For manual validation
- **Real PDF Reports** - Generated with realistic medical data and uploaded to S3

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
2. Create 10 users with profiles
3. Add 5 family members per user
4. Generate and upload PDF reports to S3 for users and members
5. Link DC shared reports (if DC data exists)
6. Create manual test records

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

### Family Members
- Phone numbers: +15555550121 onwards
- 5 members per user (Father, Mother, Son, Brother, Sister)
- Appropriate DOB ranges based on relation
- Member user type
- Linked to primary user via `members` array

### Reports

#### User-Uploaded Reports
- Stored in `reports` collection
- Have `userId` field
- PDF files uploaded to S3
- Status: 'accepted'
- Linked to user profile via `reports` array

#### DC Shared Reports (Pending)
- DC reports with `sharedReportDetails` containing user's phone number
- `accepted: false`
- `userId: null`
- Accessible via DC API

#### DC Shared Reports (Accepted)
- DC reports with `sharedReportDetails` containing user's phone number
- `accepted: true`
- `userId: <profile_id>`
- Accessible via DC API

## Manual Test Records

3 records are created for the first 3 users with recent dates for easy manual testing.

## DC Integration

The script attempts to link DC reports by:
1. Finding DC reports with `diagnosticCenter` and `sharedReportDetails` fields
2. Adding user phone numbers to `sharedReportDetails` array
3. Setting appropriate `accepted` status (pending or accepted)

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

## Output

The script generates:
- **10 Users** with complete profiles
- **50 Family Members** (5 per user)
- **130 User-uploaded Reports** (3 per user + 2 per member)
- **40 DC Shared Reports** (20 pending + 20 accepted, if DC data exists)
- **3 Manual Test Records**

All PDF reports are uploaded to S3 and URLs are stored in the database.


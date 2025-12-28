# Omerald Diagnostic Center (DC) - Test Data Generation

This directory contains scripts to generate and manage test data for the `omeraldDiagnostic-v3` application.

## Scripts

- `generate-data.ts` - Generates comprehensive test data with Indian Telugu names, multiple DC scenarios, users with all roles, reports, tests, and more
- `clear-data.ts` - Clears all generated test data from the database

## Features

### Generated Data

- **50 Users** (phone numbers: +15555550101 to +15555550150)
  - Indian Telugu names
  - All roles: owner, admin, spoc, operator, manager
  - Complex relationships: users in multiple branches, multiple DCs with different roles

- **Diagnostic Centers (DCs)**
  - Indian names and addresses
  - Real logos from valid sources
  - Three scenarios:
    1. Single owner with multiple DCs
    2. Single DC (one branch)
    3. Multi-branch DCs

- **Branches**
  - Realistic Indian addresses
  - Branch logos
  - Operators, pathologists, activities

- **50 Tests** (Sample report types)
  - Comprehensive test templates
  - Parameters with bio-reference ranges
  - Components with descriptions

- **50 Reports**
  - Real health industry data
  - Reused parameters across tests
  - PDF generation (with GPT support)
  - Pathologist signatures

- **Pathologists**
  - Real Telugu names
  - Signature images (GPT generated, uploaded to S3)
  - Designations

## Requirements

- Node.js 18+
- MongoDB connection (MONGO_URI)
- AWS S3 credentials (for signature uploads)
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_S3_BUCKET_NAME
  - AWS_REGION

## Usage

### Generate Data

```bash
cd "/Users/mohammedsaif/Documents/Final Apps/data/dc"
npx tsx generate-data.ts
```

### Clear Data

```bash
cd "/Users/mohammedsaif/Documents/Final Apps/data/dc"
npx tsx clear-data.ts
```

### Clear and Regenerate

```bash
cd "/Users/mohammedsaif/Documents/Final Apps/data/dc"
npx tsx clear-data.ts && npx tsx generate-data.ts
```

## Data Scenarios

### Scenario 1: Single Owner Multiple DCs
- One user owns multiple diagnostic centers
- Different branches under each DC

### Scenario 2: Single DC
- One diagnostic center with a single branch
- Multiple users with various roles

### Scenario 3: Multi-Branch DCs
- Diagnostic centers with multiple branches
- Users assigned to different branches with different roles
- Users may be part of multiple branches and DCs

## User Roles

- **owner**: Full access, can manage branches
- **admin**: Administrative access
- **manager**: Can manage tests and reports
- **spoc**: Single Point of Contact
- **operator**: Basic operations, can create reports

## Notes

- All users have Indian Telugu names
- DC names and addresses are realistic Indian locations
- Logo URLs point to real diagnostic center logos
- Pathologist signatures are generated using GPT and uploaded to S3
- Reports use realistic health industry parameters
- Parameters are reused across different tests for consistency


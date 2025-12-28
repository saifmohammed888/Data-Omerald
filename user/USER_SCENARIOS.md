# User Test Data Scenarios

## Complete User Table

| # | Phone Number | Name | Members | User Reports | Member Reports | DC Pending | DC Accepted | User Shared | Scenario Description |
|---|--------------|------|---------|--------------|---------------|-----------|-------------|-------------|---------------------|
| 1 | +15555550101 | Arjun Rao | 0 | 5 | 0 | 0 | 0 | 0 | **Reports Only** - No family members, only user-uploaded reports |
| 2 | +15555550102 | Karthik Rao | 3 | 0 | 6 | 2 | 0 | 0 | **Members Only** - Family members with reports, pending DC shares |
| 3 | +15555550103 | Rahul Rao | 5 | 3 | 10 | 2 | 2 | 1 | **Full Setup** - Complete profile with all features |
| 4 | +15555550104 | Vikram Rao | 2 | 1 | 4 | 1 | 1 | 0 | **Minimal** - Small family, few reports, mixed DC status |
| 5 | +15555550105 | Sai Rao | 0 | 0 | 0 | 3 | 0 | 0 | **DC Pending Only** - No members/reports, only pending DC shares |
| 6 | +15555550106 | Pranav Rao | 1 | 10 | 2 | 0 | 3 | 2 | **Many Reports** - Heavy user with many reports, accepted DC shares |
| 7 | +15555550107 | Aditya Rao | 4 | 2 | 8 | 0 | 0 | 1 | **No DC Reports** - Large family, no diagnostic center reports |
| 8 | +15555550108 | Rohit Rao | 3 | 4 | 6 | 1 | 2 | 0 | **Mixed** - Balanced profile with various report types |
| 9 | +15555550109 | Suresh Rao | 5 | 0 | 0 | 0 | 0 | 0 | **Members Only** - Large family, no reports at all |
| 10 | +15555550110 | Rajesh Rao | 2 | 8 | 4 | 2 | 1 | 1 | **Many User Reports** - Focus on user-uploaded reports |

## Quick Reference by Scenario

### Testing User Reports Only
- **User 1** (+15555550101) - Arjun Rao
  - 5 user-uploaded reports
  - No members
  - Use for: Testing report upload, viewing, sharing

### Testing Family Members
- **User 2** (+15555550102) - Karthik Rao
  - 3 members with 6 reports total
  - 2 pending DC reports
  - Use for: Testing member management, member reports

- **User 9** (+15555550109) - Suresh Rao
  - 5 members, no reports
  - Use for: Testing member profiles, health data (BMI, allergies, etc.)

### Testing Complete Features
- **User 3** (+15555550103) - Rahul Rao
  - 5 members, 3 user reports, 10 member reports
  - 2 pending + 2 accepted DC reports
  - 1 user-shared report
  - Use for: Full feature testing, all scenarios

### Testing DC Shared Reports
- **User 5** (+15555550105) - Sai Rao
  - 3 pending DC reports only
  - No members or user reports
  - Use for: Testing DC report acceptance flow

- **User 6** (+15555550106) - Pranav Rao
  - 3 accepted DC reports
  - Use for: Testing accepted DC reports display

### Testing Report Sharing
- **User 6** (+15555550106) - Pranav Rao
  - 2 user-shared reports
  - Use for: Testing report sharing between users

- **User 7** (+15555550107) - Aditya Rao
  - 1 user-shared report
  - Use for: Testing shared reports viewing

### Testing Minimal Data
- **User 4** (+15555550104) - Vikram Rao
  - 2 members, 1 user report, 4 member reports
  - Use for: Testing with minimal data

### Testing Heavy Usage
- **User 6** (+15555550106) - Pranav Rao
  - 10 user reports, 2 member reports
  - Use for: Testing performance with many reports

- **User 10** (+15555550110) - Rajesh Rao
  - 8 user reports, 4 member reports
  - Use for: Testing report list pagination, filtering

## Health Data Available

All users and members have:
- ✅ **BMI Data**: 2-3 records backdated over 1 year
- ✅ **Food Allergies**: 0-3 allergies
- ✅ **Diagnosed Conditions**: 0-2 conditions

Pediatric members (Sons/Daughters) additionally have:
- ✅ **MUAC**: 1-2 records
- ✅ **Anthropometric**: 1-2 records
- ✅ **IAP Growth Charts**: 2-4 records

## Data Backdating

All data is backdated over **1 year period**:
- User creation dates
- Report dates
- Health data records (BMI, MUAC, etc.)
- DC shared report dates
- User-shared report dates

## Notes

- **DC Reports**: Users 2, 3, 4, 5, 6, 8, 10 have DC shared reports (pending/accepted)
  - Note: DC reports need to be generated first using `data/dc/generate-data.ts`
  - If DC data doesn't exist, these will show 0 DC reports

- **User-Shared Reports**: Users 3, 6, 7, 10 have reports shared from other users
  - These appear in the `sharedReports` array in user profiles

- **Phone Numbers**: All users follow pattern +15555550101 to +15555550110
  - Members start from +15555550121 onwards

## Testing Scenarios

### Scenario 1: New User Onboarding
- Use **User 1** or **User 5** (minimal/no data)
- Test: First-time user experience

### Scenario 2: Family Management
- Use **User 3** or **User 9** (many members)
- Test: Adding/editing members, viewing member profiles

### Scenario 3: Report Management
- Use **User 6** or **User 10** (many reports)
- Test: Report upload, viewing, filtering, pagination

### Scenario 4: DC Integration
- Use **User 3** or **User 6** (accepted DC reports)
- Test: Viewing DC reports, accepting pending reports

### Scenario 5: Report Sharing
- Use **User 6** or **User 7** (shared reports)
- Test: Sharing reports, viewing shared reports

### Scenario 6: Pediatric Features
- Use **User 3** (has Sons/Daughters)
- Test: Pediatric-specific tabs (MUAC, IAP Growth Charts, Anthropometric)

### Scenario 7: Health Tracking
- Use any user with members
- Test: BMI tracking, food allergies, diagnosed conditions

### Scenario 8: Empty States
- Use **User 5** (no members, no reports)
- Test: Empty state UI, onboarding flows


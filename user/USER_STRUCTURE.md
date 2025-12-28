# User Test Data - Simple Reference

## Test Users

| Name | Phone Number | Scenario |
|------|--------------|----------|
| Arjun Rao | +15555550101 | Reports Only, No Members (Premium) |
| Priya Reddy | +15555550102 | Members Only, Pending DC Reports (Premium) |
| Karthik Naidu | +15555550103 | Full Setup (All Features) |
| Lakshmi Kumar | +15555550104 | DC Pending Only |
| Rahul Sharma | +15555550105 | Many Reports, Accepted DC |

## Scenarios Explained

- **Reports Only, No Members**: User with 5 self-uploaded reports, no family members, 2 DC pending + 3 DC accepted reports
- **Members Only, Pending DC Reports**: User with 3 family members (Father, Mother, Son), 6 member reports, 2 DC pending + 3 DC accepted reports
- **Full Setup (All Features)**: Complete testing - 5 family members, 3 user reports, 10 member reports, 2 DC pending + 3 DC accepted reports, 1 user-shared report
- **DC Pending Only**: User with no personal reports, only 2 DC pending + 3 DC accepted reports
- **Many Reports, Accepted DC**: User with 10 self-uploaded reports, 1 family member, 2 member reports, 2 DC pending + 3 DC accepted reports, 2 user-shared reports

## Notes

- **Phone Number Format**: `+15555550101` (stored format)
- **Display Format**: `+1 555 555 0101` (for login/display)
- **Premium Users**: Users 0101 and 0102 have Premium subscription
- All users have health data (BMI, MUAC, Food Allergies, Diagnosed Conditions)
- Pediatric members have additional data (Anthropometric, IAP Growth Charts)
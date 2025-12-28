# Admin Test Data - Simple Reference

## Test Users

| Name | Phone Number | Role | Scenario |
|------|--------------|------|----------|
| Arjun Rao | +15555550101 | admin | Full Access - All Features |
| Priya Reddy | +15555550102 | manager | Limited Access - No Settings |
| Karthik Naidu | +15555550103 | sme | Reports & Conditions Only |
| Lakshmi Kumar | +15555550104 | legal | Settings Access Only |
| Rahul Sharma | +15555550105 | admin | Full Access - All Features |
| Kavya Prasad | +15555550106 | manager | Limited Access - No Settings |
| Vikram Murthy | +15555550107 | sme | Reports & Conditions Only |
| Sneha Raju | +15555550108 | legal | Settings Access Only |
| Sai Krishna | +15555550109 | admin | Full Access - All Features |
| Divya Swamy | +15555550110 | manager | Limited Access - No Settings |

## Roles Explained

- **admin**: Full access to all features, user management, settings
- **manager**: Most features, limited user management, no settings access
- **sme**: Reports, diagnosed conditions, vaccines management
- **legal**: Settings access only (legal documents)
- **user**: No dashboard access (redirected to no-access page)

## Notes

- **Phone Number Format**: `+15555550101` (stored format)
- **Display Format**: `+1 555 555 0101` (for login/display)
- **Total Users**: 10 users (3 admin, 3 manager, 2 sme, 2 legal)
- **Phone Number Range**: `+15555550101` to `+15555550110`
- All users have Indian Telugu names for consistency
- User creation dates are backdated over the past year for realistic testing
- Users must be registered in Clerk with matching phone numbers


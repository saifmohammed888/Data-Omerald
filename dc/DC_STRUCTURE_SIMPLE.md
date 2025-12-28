# Diagnostic Center Test Data - Simple Reference

## Test Users

| Name | Phone Number | Role | Scenario |
|------|--------------|------|----------|
| Venkat Rao | +15555550101 | owner | Multi-DC Owner (3 DCs) |
| Ishaan Yadav | +15555550104 | owner | Multi-DC Owner (2 DCs) |
| Ajay Raju | +15555550112 | admin | Single Branch Admin |
| Arjun Prasad | +15555550113 | manager | Single Branch Manager |
| Sindhu Bhatt | +15555550114 | admin | Single Branch Admin |
| Sneha Kapoor | +15555550115 | manager | Single Branch Manager |
| Vidya Patnaik | +15555550118 | admin | Single Branch Admin |
| Shilpa Rathore | +15555550119 | manager | Single Branch Manager |

## Diagnostic Centers

| DC Name | Owner | Branches | Users |
|---------|-------|----------|-------|
| Aster Labs Ahmedabad | Venkat Rao | 2 | Owner + Admin/Manager |
| Dr. Lal PathLabs Ahmedabad | Venkat Rao | 2 | Owner + Admin/Manager |
| Care Hospitals Lab Mumbai | Ishaan Yadav | 2 | Owner + Admin/Manager |

## Roles Explained

- **owner**: Full access, can manage branches, create/edit DCs
- **admin**: Administrative access, can manage tests, reports, users (except owner)
- **manager**: Can manage tests and reports, view analytics
- **spoc**: Single Point of Contact, can handle customer queries
- **operator**: Basic operations, can create reports, view assigned tests

## Notes

- **Phone Number Format**: `+15555550101` (stored format)
- **Display Format**: `+1 555 555 0101` (for login/display)
- **Total Users**: 50 users (phone range +15555550101 to +15555550150)
- **Total DCs**: 5 diagnostic centers
- **User Type**: Must be `primary` for DC users
- **Owner Access**: Owner has access to all branches of their DC(s)
- All users have Indian Telugu names for consistency
- User creation dates are backdated over the past year for realistic testing


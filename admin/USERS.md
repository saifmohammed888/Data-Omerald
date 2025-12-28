# Admin Users Reference & Manual Data Insertion Guide

This document lists all test users and provides sample data for manual insertion into the admin app.

## Test Users Table

| # | Name | Phone Number | Role | Display Format |
|---|------|--------------|------|----------------|
| 1 | Arjun Rao | +15555550101 | admin | +1 555 555 0101 |
| 2 | Priya Reddy | +15555550102 | manager | +1 555 555 0102 |
| 3 | Karthik Naidu | +15555550103 | sme | +1 555 555 0103 |
| 4 | Lakshmi Kumar | +15555550104 | legal | +1 555 555 0104 |
| 5 | Rahul Sharma | +15555550105 | admin | +1 555 555 0105 |
| 6 | Kavya Prasad | +15555550106 | manager | +1 555 555 0106 |
| 7 | Vikram Murthy | +15555550107 | sme | +1 555 555 0107 |
| 8 | Sneha Raju | +15555550108 | legal | +1 555 555 0108 |
| 9 | Sai Krishna | +15555550109 | admin | +1 555 555 0109 |
| 10 | Divya Swamy | +15555550110 | manager | +1 555 555 0110 |
| **11** | **Test User** | **+15555550111** | **admin** | **+1 555 555 0111** |

## Manual Data Insertion Reference

Use the following sample data for manual insertion into the admin app. User **+15555550111** should be used as the reference user.

### User

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Phone Number | +15555550111 | +15555550112 | +15555550113 |
| User Name | Test User | Demo Admin | Sample Manager |
| Role | admin | manager | sme |

### Vaccine

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Name | Hepatitis B | BCG | DPT |

### Duration

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Duration | 0 | 1 | 2 |
| Type | day | month | month |

### Sample

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Name | Blood | Serum | Urine |
| Description | Whole blood sample | Blood serum sample | Urine sample |
| Validity Value | 7 | 7 | 2 |
| Validity Unit | day | day | day |
| Is Active | true | true | true |

### Parameter

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Parameter | Hemoglobin | Blood Glucose (Fasting) | Total Cholesterol |
| Unit | g/dL | mg/dL | mg/dL |
| Basic Range Min | 12 | 70 | 0 |
| Basic Range Max | 18 | 100 | 200 |
| Is Active | true | true | true |

### Diagnosed Condition

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Name | Anemia | Diabetes Type 2 | Hypertension |
| Description | Low red blood cell count | High blood sugar levels | High blood pressure |
| Aliases | Low Hemoglobin, Iron Deficiency | Type 2 DM, T2DM | High BP, HTN |
| Status | true | true | true |

### Report/Test Name

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Test Name | Complete Blood Count (CBC) | Liver Function Test (LFT) | Kidney Function Test (KFT) |

### Dose

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Name | Hepatitis B - Dose 1 | BCG - Dose 1 | DPT - Dose 1 |
| Vaccine | [Select: Hepatitis B] | [Select: BCG] | [Select: DPT] |
| Dose Duration | [Select: 0 day] | [Select: 1 month] | [Select: 2 month] |
| Dose Type | Recommended | Recommended | Catch-up |

## Role Distribution

| Role | Count | Users |
|------|-------|-------|
| admin | 3 | Arjun Rao, Rahul Sharma, Sai Krishna |
| manager | 3 | Priya Reddy, Kavya Prasad, Divya Swamy |
| sme | 2 | Karthik Naidu, Vikram Murthy |
| legal | 2 | Lakshmi Kumar, Sneha Raju |

## Quick Reference

### Admin Users
- Arjun Rao (+15555550101)
- Rahul Sharma (+15555550105)
- Sai Krishna (+15555550109)
- **Test User (+15555550111)** ← Use for manual insertion

### Manager Users
- Priya Reddy (+15555550102)
- Kavya Prasad (+15555550106)
- Divya Swamy (+15555550110)

### SME Users
- Karthik Naidu (+15555550103)
- Vikram Murthy (+15555550107)

### Legal Users
- Lakshmi Kumar (+15555550104)
- Sneha Raju (+15555550108)

## Notes

- **Total Users**: 10 (generated) + 1 (manual test user)
- **Phone Number Range**: +15555550101 to +15555550111
- **Format**: Phone numbers are stored without spaces in the database (e.g., `+15555550111`)
- **Display Format**: For login/display purposes, format as `+1 555 555 XXXX`
- **Manual Insertion**: Use user +15555550111 as the reference user for all manual data entries
- All users have Indian Telugu names for consistency
- User creation dates are backdated over the past year for realistic testing

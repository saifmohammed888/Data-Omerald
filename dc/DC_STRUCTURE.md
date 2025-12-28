# Diagnostic Center Structure & Manual Data Insertion Guide

This document shows the DC → Branches → Users hierarchy and provides sample data for manual insertion.

## DC Structure Overview

### 3 Diagnostic Centers with Branches and Users (from Database)

#### DC 1: Aster Labs Ahmedabad

```
Aster Labs Ahmedabad
├── Branch 1: Main Branch
│   ├── Owner: Venkat Rao (+15555550101) - owner
│   └── Admin: Ajay Raju (+15555550112) - admin
└── Branch 2: Secondary Branch
    ├── Owner: Venkat Rao (+15555550101) - owner
    └── Manager: Arjun Prasad (+15555550113) - manager
```

#### DC 2: Dr. Lal PathLabs Ahmedabad

```
Dr. Lal PathLabs Ahmedabad
├── Branch 1: Main Branch
│   ├── Owner: Venkat Rao (+15555550101) - owner
│   └── Admin: Sindhu Bhatt (+15555550114) - admin
└── Branch 2: Secondary Branch
    ├── Owner: Venkat Rao (+15555550101) - owner
    └── Manager: Sneha Kapoor (+15555550115) - manager
```

#### DC 3: Care Hospitals Lab Mumbai

```
Care Hospitals Lab Mumbai
├── Branch 1: Main Branch
│   ├── Owner: Ishaan Yadav (+15555550104) - owner
│   └── Admin: Vidya Patnaik (+15555550118) - admin
└── Branch 2: Secondary Branch
    ├── Owner: Ishaan Yadav (+15555550104) - owner
    └── Manager: Shilpa Rathore (+15555550119) - manager
```

**Note**: DCs 1 and 2 share the same owner (Venkat Rao +15555550101). DC 3 has a different owner (Ishaan Yadav +15555550104). Each DC has 2 branches with different users assigned to each branch with various roles.

## Test Users for Manual Entry

| # | Name | Phone Number | Role | Display Format |
|---|------|--------------|------|----------------|
| **101** | **Venkat Rao** | **+15555550101** | **owner** | **+1 555 555 0101** |
| **104** | **Ishaan Yadav** | **+15555550104** | **owner** | **+1 555 555 0104** |
| **112** | **Ajay Raju** | **+15555550112** | **admin** | **+1 555 555 0112** |
| **113** | **Arjun Prasad** | **+15555550113** | **manager** | **+1 555 555 0113** |
| **114** | **Sindhu Bhatt** | **+15555550114** | **admin** | **+1 555 555 0114** |
| **115** | **Sneha Kapoor** | **+15555550115** | **manager** | **+1 555 555 0115** |
| **118** | **Vidya Patnaik** | **+15555550118** | **admin** | **+1 555 555 0118** |
| **119** | **Shilpa Rathore** | **+15555550119** | **manager** | **+1 555 555 0119** |

## Manual Data Insertion Reference

Use the following sample data for manual insertion into the DC app. User **Venkat Rao (+15555550101)** should be used as the reference owner user.

### User

| Field | Value |
|-------|-------|
| Phone Number | +15555550101 |
| User Name | Venkat Rao |
| User Type | primary |

### Diagnostic Center (DC)

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Center Name | Aster Labs Ahmedabad | Dr. Lal PathLabs Ahmedabad | Care Hospitals Lab Mumbai |
| Email | asterlabsahmedabad@example.com | dr.lalpathlabsahmedabad@example.com | carehospitalslab0@example.com |
| Phone Number | +15555550101 | +15555550104 | +15555550110 |
| Address | 63, Howrah Street, Kolkata, West Bengal 700001 | 65, OMR Lane, Chennai, Tamil Nadu 600001 | 30, Andheri Road, Mumbai, Maharashtra 400001 |
| Logo URL | https://example.com/logos/aster.png | https://example.com/logos/lal.png | https://example.com/logos/care.png |
| Banner URL | https://example.com/banners/aster-banner.jpg | https://example.com/banners/lal-banner.jpg | https://example.com/banners/care-banner.jpg |

### Branch

| Field | Value 1 | Value 2 | Value 3 |
|-------|---------|---------|---------|
| Branch Name | Main Branch | Secondary Branch | Main Branch |
| Branch Email | main@asterlabsahmedabad.com | secondary@asterlabsahmedabad.com | main@carehospitalslab.com |
| Branch Address | 63, Howrah Street, Kolkata, West Bengal 700001 | 25, New Town Road, Kolkata, West Bengal 700001 | 30, Andheri Road, Mumbai, Maharashtra 400001 |
| Branch Contact | +15555550102 | +15555550103 | +15555550111 |
| Branch Logo | https://example.com/logos/aster-main.png | https://example.com/logos/aster-secondary.png | https://example.com/logos/care-main.png |
| Diagnostic Center | [Select: Aster Labs Ahmedabad] | [Select: Aster Labs Ahmedabad] | [Select: Care Hospitals Lab Mumbai] |

### User Role Assignment (DC → Branch)

| Field | Value |
|-------|-------|
| User | [Select: Venkat Rao (+15555550101)] |
| Diagnostic Center | [Select: Aster Labs Ahmedabad] |
| Branch | [Select: Main Branch] |
| Role | owner |

### Test

| Field | Value |
|-------|-------|
| Test Name | Complete Blood Count (CBC) |
| Sample Type | Whole Blood |
| Parameters | [See Parameter section below] |

### Parameter (for Test)

| Field | Value |
|-------|-------|
| Name | Hemoglobin |
| Sub Text | Hb |
| Units | g/dL |
| Basic Range Min | 12.0 |
| Basic Range Max | 16.0 |
| Basic Range Unit | g/dL |
| Is Active | true |

### Report

| Field | Value |
|-------|-------|
| Patient Name | Ramesh Patel |
| Patient Phone | +15555551001 |
| Test Name | [Select: Complete Blood Count (CBC)] |
| Branch | [Select: Main Branch] |
| Diagnostic Center | [Select: Aster Labs Ahmedabad] |
| Report Date | [Current Date] |
| Status | completed |

### Pathologist

| Field | Value |
|-------|-------|
| Name | Dr. Venkat Rao |
| Designation | Senior Pathologist |
| Signature URL | https://example.com/signatures/venkat-rao.png |
| Branch | [Select: Main Branch] |

## User Roles in DC

| Role | Description | Permissions |
|------|-------------|------------|
| **owner** | Full access, can manage branches | Can create/edit DCs, branches, manage all users |
| **admin** | Administrative access | Can manage tests, reports, users (except owner) |
| **manager** | Can manage tests and reports | Can create/edit tests, reports, view analytics |
| **spoc** | Single Point of Contact | Can handle customer queries, manage reports |
| **operator** | Basic operations | Can create reports, view assigned tests |

## Complete DC Structure

### All 3 Diagnostic Centers

```
Owner 1: Venkat Rao (+15555550101)

├── DC 1: Aster Labs Ahmedabad
│   ├── Branch 1: Main Branch
│   │   ├── Owner: Venkat Rao (+15555550101) - owner
│   │   └── Admin: Ajay Raju (+15555550112) - admin
│   └── Branch 2: Secondary Branch
│       ├── Owner: Venkat Rao (+15555550101) - owner
│       └── Manager: Arjun Prasad (+15555550113) - manager
│
├── DC 2: Dr. Lal PathLabs Ahmedabad
│   ├── Branch 1: Main Branch
│   │   ├── Owner: Venkat Rao (+15555550101) - owner
│   │   └── Admin: Sindhu Bhatt (+15555550114) - admin
│   └── Branch 2: Secondary Branch
│       ├── Owner: Venkat Rao (+15555550101) - owner
│       └── Manager: Sneha Kapoor (+15555550115) - manager
│
└── DC 3: Manipal Hospitals Lab Ahmedabad
    ├── Branch 1: Main Branch
    │   ├── Owner: Venkat Rao (+15555550101) - owner
    │   └── Admin: Vivek Yadav (+15555550116) - admin
    └── Branch 2: Secondary Branch
        ├── Owner: Venkat Rao (+15555550101) - owner
        └── Manager: Harshith Tiwari (+15555550117) - manager

Owner 2: Ishaan Yadav (+15555550104)

├── DC 4: Care Hospitals Lab Mumbai
│   ├── Branch 1: Main Branch
│   │   ├── Owner: Ishaan Yadav (+15555550104) - owner
│   │   └── Admin: Vidya Patnaik (+15555550118) - admin
│   └── Branch 2: Secondary Branch
│       ├── Owner: Ishaan Yadav (+15555550104) - owner
│       └── Manager: Shilpa Rathore (+15555550119) - manager
│
└── DC 5: Global Hospitals Lab Mumbai
    ├── Branch 1: Main Branch
    │   ├── Owner: Ishaan Yadav (+15555550104) - owner
    │   └── Admin: Vivek Singh (+15555550120) - admin
    └── Branch 2: Secondary Branch
        ├── Owner: Ishaan Yadav (+15555550104) - owner
        └── Manager: Sandhya Bhatt (+15555550121) - manager
```

## Notes

- **Phone Number Format**: Stored without spaces (e.g., `+15555550151`)
- **Display Format**: For login/display, format as `+1 555 555 0151`
- **User Type**: Must be `primary` for DC users
- **Owner Access**: Owner has access to all branches of their DC(s)
- **Multi-Branch Users**: Users can be assigned to multiple branches with different roles
- **Test Parameters**: Each test requires at least one parameter with bio-reference ranges
- **Reports**: Must be associated with a branch and diagnostic center
- **Pathologists**: Can be assigned to specific branches for report signing


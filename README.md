# Omerald Test Data - Complete Reference

This repository contains test data generation scripts and documentation for all Omerald applications.

## 🌐 Application URLs

- **User App**: [https://www.omerald.com/](https://www.omerald.com/)
- **Diagnostic Center (DC) App**: [https://diagnostic.omerald.com/](https://diagnostic.omerald.com/)
- **Admin App**: [https://admin.omerald.com/](https://admin.omerald.com/)

## 📋 Quick Navigation

- [Test Users](#test-users)
  - [User App](#user-app-test-users)
  - [Diagnostic Center (DC) App](#diagnostic-center-dc-app-test-users)
  - [Admin App](#admin-app-test-users)
- [Sample Data Entries](#sample-data-entries)
  - [User App](#user-app-sample-data)
  - [Diagnostic Center App](#diagnostic-center-app-sample-data)
  - [Admin App](#admin-app-sample-data)

---

## Test Users

### User App Test Users

| # | Name | Phone Number | Display Format | Scenario | Subscription |
|---|------|--------------|----------------|----------|--------------|
| 1 | Arjun Rao | +15555550101 | +1 555 555 0101 | Reports Only, No Members | Premium |
| 2 | Karthik Rao | +15555550102 | +1 555 555 0102 | Members Only, Pending DC Reports | Premium |
| 3 | Rahul Rao | +15555550103 | +1 555 555 0103 | Full Setup (All Features) | Free |
| 4 | Vikram Rao | +15555550104 | +1 555 555 0104 | DC Pending Only | Free |
| 5 | Sai Rao | +15555550105 | +1 555 555 0105 | Many Reports, Accepted DC | Free |

**Scenarios Explained:**
- **Reports Only, No Members**: 5 self-uploaded reports, no family members, 2 DC pending + 3 DC accepted reports
- **Members Only, Pending DC Reports**: 3 family members (Father, Mother, Son), 6 member reports, 2 DC pending + 3 DC accepted reports
- **Full Setup (All Features)**: 5 family members, 3 user reports, 10 member reports, 2 DC pending + 3 DC accepted reports, 1 user-shared report
- **DC Pending Only**: No personal reports, only 2 DC pending + 3 DC accepted reports
- **Many Reports, Accepted DC**: 10 self-uploaded reports, 1 family member, 2 member reports, 2 DC pending + 3 DC accepted reports, 2 user-shared reports

---

### Diagnostic Center (DC) App Test Users

| # | Name | Phone Number | Display Format | Role | Scenario |
|---|------|--------------|----------------|------|----------|
| 1 | Venkat Rao | +15555550101 | +1 555 555 0101 | owner | Multi-DC Owner (3 DCs) |
| 2 | Ishaan Yadav | +15555550104 | +1 555 555 0104 | owner | Multi-DC Owner (2 DCs) |
| 3 | Ajay Raju | +15555550112 | +1 555 555 0112 | admin | Single Branch Admin |
| 4 | Arjun Prasad | +15555550113 | +1 555 555 0113 | manager | Single Branch Manager |
| 5 | Sindhu Bhatt | +15555550114 | +1 555 555 0114 | admin | Single Branch Admin |
| 6 | Sneha Kapoor | +15555550115 | +1 555 555 0115 | manager | Single Branch Manager |
| 7 | Vidya Patnaik | +15555550118 | +1 555 555 0118 | admin | Single Branch Admin |
| 8 | Shilpa Rathore | +15555550119 | +1 555 555 0119 | manager | Single Branch Manager |

**Diagnostic Centers:**
- **Aster Labs Ahmedabad** - Owner: Venkat Rao, 2 Branches
- **Dr. Lal PathLabs Ahmedabad** - Owner: Venkat Rao, 2 Branches
- **Care Hospitals Lab Mumbai** - Owner: Ishaan Yadav, 2 Branches

**Roles Explained:**
- **owner**: Full access, can manage branches, create/edit DCs
- **admin**: Administrative access, can manage tests, reports, users (except owner)
- **manager**: Can manage tests and reports, view analytics
- **spoc**: Single Point of Contact, can handle customer queries
- **operator**: Basic operations, can create reports, view assigned tests

---

### Admin App Test Users

| # | Name | Phone Number | Display Format | Role | Scenario |
|---|------|--------------|----------------|------|----------|
| 1 | Arjun Rao | +15555550101 | +1 555 555 0101 | admin | Full Access - All Features |
| 2 | Priya Reddy | +15555550102 | +1 555 555 0102 | manager | Limited Access - No Settings |
| 3 | Karthik Naidu | +15555550103 | +1 555 555 0103 | sme | Reports & Conditions Only |
| 4 | Lakshmi Kumar | +15555550104 | +1 555 555 0104 | legal | Settings Access Only |
| 5 | Rahul Sharma | +15555550105 | +1 555 555 0105 | admin | Full Access - All Features |
| 6 | Kavya Prasad | +15555550106 | +1 555 555 0106 | manager | Limited Access - No Settings |
| 7 | Vikram Murthy | +15555550107 | +1 555 555 0107 | sme | Reports & Conditions Only |
| 8 | Sneha Raju | +15555550108 | +1 555 555 0108 | legal | Settings Access Only |
| 9 | Sai Krishna | +15555550109 | +1 555 555 0109 | admin | Full Access - All Features |
| 10 | Divya Swamy | +15555550110 | +1 555 555 0110 | manager | Limited Access - No Settings |

**Roles Explained:**
- **admin**: Full access to all features, user management, settings
- **manager**: Most features, limited user management, no settings access
- **sme**: Reports, diagnosed conditions, vaccines management
- **legal**: Settings access only (legal documents)
- **user**: No dashboard access (redirected to no-access page)

---

## Sample Data Entries

### User App Sample Data

<details>
<summary><strong>📝 User Profile</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Phone Number | +15555550101 |
| First Name | Arjun |
| Last Name | Rao |
| Email | arjun.rao1@example.com |
| Gender | male |
| Blood Group | A+ |
| Date of Birth | 1985-06-15 |
| Address | 123, MG Road, Hyderabad, Telangana 500001 |
| Subscription | Premium |
| User Type | Primary |

</details>

<details>
<summary><strong>👨‍👩‍👧‍👦 Family Member</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Phone Number | +15555550121 |
| First Name | Ramesh |
| Last Name | Rao |
| Relation | Father |
| Gender | male |
| Blood Group | O+ |
| Date of Birth | 1960-03-20 |
| Address | 123, MG Road, Hyderabad, Telangana 500001 |

</details>

<details>
<summary><strong>📄 User Report</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Report ID | RPT-1234567890-abc123 |
| Report Name | Complete Blood Count (CBC) |
| Report Type | Blood Report |
| Report Date | 2024-01-15 |
| Upload Date | 2024-01-15 |
| Status | accepted |
| Report URL | [S3 Signed URL] |
| Description | User-uploaded CBC report |

</details>

<details>
<summary><strong>🏥 Health Data - BMI</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Height | 175 cm |
| Weight | 75.5 kg |
| BMI | 24.7 |
| Updated Date | 2024-01-10 |

</details>

<details>
<summary><strong>🚫 Food Allergies</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Food Item | Peanuts |
| Updated Date | 2023-12-01 |

</details>

<details>
<summary><strong>🩺 Diagnosed Conditions</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Condition | Diabetes Type 2 |
| Date | 2023-11-15 |

</details>

---

### Diagnostic Center App Sample Data

<details>
<summary><strong>👤 User (DC)</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Phone Number | +15555550101 |
| User Name | Venkat Rao |
| User Type | primary |

</details>

<details>
<summary><strong>🏥 Diagnostic Center</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Center Name | Aster Labs Ahmedabad | Dr. Lal PathLabs Ahmedabad | Care Hospitals Lab Mumbai |
| Email | asterlabsahmedabad@example.com | dr.lalpathlabsahmedabad@example.com | carehospitalslab0@example.com |
| Phone Number | +15555550101 | +15555550104 | +15555550110 |
| Address | 63, Howrah Street, Kolkata, West Bengal 700001 | 65, OMR Lane, Chennai, Tamil Nadu 600001 | 30, Andheri Road, Mumbai, Maharashtra 400001 |
| Logo URL | https://example.com/logos/aster.png | https://example.com/logos/lal.png | https://example.com/logos/care.png |
| Banner URL | https://example.com/banners/aster-banner.jpg | https://example.com/banners/lal-banner.jpg | https://example.com/banners/care-banner.jpg |

</details>

<details>
<summary><strong>🏢 Branch</strong></summary>

| Field | Sample Value 1 | Sample Value 2 |
|-------|----------------|----------------|
| Branch Name | Main Branch | Secondary Branch |
| Branch Email | main@asterlabsahmedabad.com | secondary@asterlabsahmedabad.com |
| Branch Address | 63, Howrah Street, Kolkata, West Bengal 700001 | 25, New Town Road, Kolkata, West Bengal 700001 |
| Branch Contact | +15555550102 | +15555550103 |
| Branch Logo | https://example.com/logos/aster-main.png | https://example.com/logos/aster-secondary.png |
| Diagnostic Center | [Select: Aster Labs Ahmedabad] | [Select: Aster Labs Ahmedabad] |

</details>

<details>
<summary><strong>👥 User Role Assignment</strong></summary>

| Field | Sample Value |
|-------|--------------|
| User | [Select: Venkat Rao (+15555550101)] |
| Diagnostic Center | [Select: Aster Labs Ahmedabad] |
| Branch | [Select: Main Branch] |
| Role | owner |

</details>

<details>
<summary><strong>🧪 Test</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Test Name | Complete Blood Count (CBC) |
| Sample Type | Whole Blood |
| Parameters | [See Parameter section below] |

</details>

<details>
<summary><strong>📊 Parameter (for Test)</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Name | Hemoglobin |
| Sub Text | Hb |
| Units | g/dL |
| Basic Range Min | 12.0 |
| Basic Range Max | 16.0 |
| Basic Range Unit | g/dL |
| Is Active | true |

</details>

<details>
<summary><strong>📋 Report</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Patient Name | Ramesh Patel |
| Patient Phone | +15555551001 |
| Test Name | [Select: Complete Blood Count (CBC)] |
| Branch | [Select: Main Branch] |
| Diagnostic Center | [Select: Aster Labs Ahmedabad] |
| Report Date | [Current Date] |
| Status | completed |

</details>

<details>
<summary><strong>👨‍⚕️ Pathologist</strong></summary>

| Field | Sample Value |
|-------|--------------|
| Name | Dr. Venkat Rao |
| Designation | Senior Pathologist |
| Signature URL | https://example.com/signatures/venkat-rao.png |
| Branch | [Select: Main Branch] |

</details>

---

### Admin App Sample Data

<details>
<summary><strong>👤 User (Admin)</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Phone Number | +15555550111 | +15555550112 | +15555550113 |
| User Name | Test User | Demo Admin | Sample Manager |
| Role | admin | manager | sme |

**Reference User:** Use **+15555550111** (Test User) as the reference user for manual data insertion.

</details>

<details>
<summary><strong>💉 Vaccine</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Name | Hepatitis B | BCG | DPT |

</details>

<details>
<summary><strong>⏱️ Duration</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Duration | 0 | 1 | 2 |
| Type | day | month | month |

</details>

<details>
<summary><strong>🧪 Sample</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Name | Blood | Serum | Urine |
| Description | Whole blood sample | Blood serum sample | Urine sample |
| Validity Value | 7 | 7 | 2 |
| Validity Unit | day | day | day |
| Is Active | true | true | true |

</details>

<details>
<summary><strong>📊 Parameter</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Parameter | Hemoglobin | Blood Glucose (Fasting) | Total Cholesterol |
| Unit | g/dL | mg/dL | mg/dL |
| Basic Range Min | 12 | 70 | 0 |
| Basic Range Max | 18 | 100 | 200 |
| Is Active | true | true | true |

</details>

<details>
<summary><strong>🩺 Diagnosed Condition</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Name | Anemia | Diabetes Type 2 | Hypertension |
| Description | Low red blood cell count | High blood sugar levels | High blood pressure |
| Aliases | Low Hemoglobin, Iron Deficiency | Type 2 DM, T2DM | High BP, HTN |
| Status | true | true | true |

</details>

<details>
<summary><strong>📄 Report/Test Name</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Test Name | Complete Blood Count (CBC) | Liver Function Test (LFT) | Kidney Function Test (KFT) |

</details>

<details>
<summary><strong>💉 Dose</strong></summary>

| Field | Sample Value 1 | Sample Value 2 | Sample Value 3 |
|-------|----------------|----------------|----------------|
| Name | Hepatitis B - Dose 1 | BCG - Dose 1 | DPT - Dose 1 |
| Vaccine | [Select: Hepatitis B] | [Select: BCG] | [Select: DPT] |
| Dose Duration | [Select: 0 day] | [Select: 1 month] | [Select: 2 month] |
| Dose Type | Recommended | Recommended | Catch-up |

</details>

---

## 📝 Notes

### Phone Number Format
- **Stored Format**: `+15555550101` (no spaces)
- **Display Format**: `+1 555 555 0101` (with spaces for login/display)

### Data Generation
- All data is backdated over **1 year period** for realistic testing
- User creation dates are distributed across the past year
- Reports, health data, and other records have realistic backdated timestamps

### User App Specific
- **Premium Users**: Phone numbers ending in 0101 and 0102 have Premium subscription
- All users have health data (BMI, MUAC, Food Allergies, Diagnosed Conditions)
- Pediatric members have additional data (Anthropometric, IAP Growth Charts)

### DC App Specific
- **User Type**: Must be `primary` for DC users
- **Owner Access**: Owner has access to all branches of their DC(s)
- Users can be assigned to multiple branches with different roles

### Admin App Specific
- Users must be registered in **Clerk** with matching phone numbers
- Use first and last name from `userName` field for Clerk registration
- Phone number range: `+15555550101` to `+15555550110` (10 users)

---

## 🚀 Quick Start

### Generate User App Data
```bash
cd user
npm install
npm run generate
```

### Generate DC App Data
```bash
cd dc
npm install
npm run generate
```

### Generate Admin App Data
```bash
cd admin
npm install
npm run generate
```

### Clear Test Data
Each app has a `clear-data.ts` script to remove generated test data:
```bash
npm run clear
```

---

## 📚 Additional Documentation

- [User App Structure](./user/USER_STRUCTURE.md)
- [User App Scenarios](./user/USER_SCENARIOS.md)
- [DC App Structure](./dc/DC_STRUCTURE.md)
- [DC App Simple Reference](./dc/DC_STRUCTURE_SIMPLE.md)
- [Admin App Structure](./admin/ADMIN_STRUCTURE.md)
- [Admin App Users](./admin/USERS.md)
- [Admin App Schema](./admin/SCHEMA_DOCUMENTATION.md)

---

**Last Updated**: December 2024


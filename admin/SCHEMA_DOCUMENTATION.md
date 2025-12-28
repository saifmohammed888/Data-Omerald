# Omerald Admin App - Schema Documentation

## Overview

This document describes the database schema and data requirements for the Omerald Admin application. The application uses MongoDB with Mongoose ODM.

## Collections & Models

### 1. Users (`User`)

Stores admin users with role-based access control.

**Schema:**
```typescript
{
  role: 'admin' | 'manager' | 'sme' | 'legal' | 'user',  // Required, enum
  userName: string,                                        // Required, trimmed
  phoneNumber: string,                                     // Required, unique, format: /^\+d{10,14}$/
  createdAt: Date,                                         // Default: Date.now
  deletedAt: Date | null                                   // Default: null (soft delete)
}
```

**Relationships:**
- Referenced by: `Activity.user`

**Constraints:**
- `phoneNumber` must be unique
- `phoneNumber` must match format: `+` followed by 10-14 digits (no spaces)
- Phone numbers for test data: `+15555550101` to `+15555550200` (100 users total)
- Display format (with spaces): `+1555 555 0101` to `+1555 555 0200`

**Roles:**
- `admin`: Full access to all features, user management, settings
- `manager`: Most features, limited user management, no settings access
- `sme`: Reports, diagnosed conditions, vaccines management
- `legal`: Settings access only (legal documents)
- `user`: No dashboard access (redirected to no-access page)

**Clerk Integration:**
- Users must be registered in Clerk with matching phone numbers
- Use first and last name from `userName` for Clerk user creation
- This ensures parity between database and authentication system

---

### 2. Reports (`report`)

Diagnostic test reports with parameters and components.

**Schema:**
```typescript
{
  testName: string,                      // Required
  sampleName: string,                    // Required, default: ''
  parameters: Parameter[],               // Array of embedded parameter documents
  isActive: boolean,                     // Default: false
  components: Component[],               // Array of component documents
  createdAt: Date,                       // Auto-generated timestamp
  updatedAt: Date                        // Auto-generated timestamp
}
```

**Parameter Sub-document:**
```typescript
{
  name: string,                          // Required
  subText?: string,
  adminParamId?: string,
  description?: string,
  aliases?: string[],
  units?: string,
  bioRefRange?: {
    basicRange: { min: number; max: number; unit: string }[],
    advanceRange: {
      ageRange: {
        ageRangeType: 'pediatric' | 'senior' | 'adult' | 'senior citizen',
        unit: string,
        min: number,
        max: number
      }[],
      genderRange: {
        genderRangeType: 'male' | 'female' | 'other' | 'others',
        unit: string,
        min: number,
        max: number,
        details: {
          prePuberty: boolean,
          menopause: boolean,
          pregnant: boolean,
          trimester: 'first' | 'second' | 'third' | 'none'
        }
      }[],
      customRange: BioRefSubCategory[]
    }
  },
  remedy?: string[],
  isActive?: boolean,
  deletedAt?: Date | null,
  diagnosedConditions?: object
}
```

**Component Sub-document:**
```typescript
{
  title: string,                         // Required
  content: string,                       // Required
  isDynamic: boolean,                    // Default: false
  images: string[]                       // Array of image URLs
}
```

**Relationships:**
- Parameters reference: `Parameter` (via adminParamId or embedded)
- Components are embedded documents

---

### 3. Parameters (`parameter`)

Laboratory parameters with reference ranges.

**Schema:**
```typescript
{
  parameter: string,                     // Required, unique
  description?: string,
  remedy?: string,
  unit?: string,
  alias?: string[],
  bioRef: {
    basicRange: {
      min: number,
      max: number,
      unit: string
    },
    advanceRange: {
      ageRange: {
        ageRangeType: 'pediatric' | 'senior' | 'adult',  // Required
        unit: string,
        min: number,
        max: number
      }[],
      genderRange: {
        genderRangeType: 'male' | 'female' | 'other',    // Required
        unit: string,
        min: number,
        max: number,
        details: {
          prePuberty: boolean,
          menopause: boolean,
          pregnant: boolean,
          trimester: 'first' | 'second' | 'third' | 'none'
        }
      }[]
    }
  },
  isActive?: boolean
}
```

**Relationships:**
- Referenced by: `DiagnosedCondition.params` (array of parameter IDs)
- Referenced by: `Report.parameters` (embedded or via adminParamId)

---

### 4. Samples (`sample`)

Laboratory sample types with validity periods.

**Schema:**
```typescript
{
  name: string,                          // Required, unique
  description?: string,
  isActive?: boolean,
  validity: {
    value: number,
    unit: 'day' | 'week' | 'month' | 'year'  // Required, enum
  }
}
```

**Relationships:**
- Referenced by: `Report.sampleName` (string reference)

---

### 5. Diagnosed Conditions (`diagnosedCondition`)

Medical conditions that can be diagnosed based on parameters.

**Schema:**
```typescript
{
  name: string,                          // Required, unique
  description?: string,
  aliases?: string[],
  status: boolean,                       // Default: false
  params?: string[]                      // Array of parameter ObjectIds
}
```

**Relationships:**
- `params` references: `Parameter._id` (array)

---

### 6. Vaccines (`vaccine`)

Vaccine master data.

**Schema:**
```typescript
{
  name: string                           // Required, unique
}
```

**Relationships:**
- Referenced by: `Dose.vaccine`

---

### 7. Doses (`dose`)

Vaccine doses with duration and type.

**Schema:**
```typescript
{
  name: string,                          // Required, unique
  doseDuration: ObjectId,                // Required, ref: 'doseDuration'
  vaccine: ObjectId,                     // Required, ref: 'vaccine'
  doseType: string                       // Required
}
```

**Relationships:**
- `doseDuration` references: `Duration._id`
- `vaccine` references: `Vaccine._id`

---

### 8. Durations (`doseDuration`)

Duration configurations for vaccine doses.

**Schema:**
```typescript
{
  duration: number,                      // Required
  type: string,                          // Required
  // Compound unique index on (duration, type)
}
```

**Relationships:**
- Referenced by: `Dose.doseDuration`

---

### 9. Activities (`Activity`)

User activity logs for audit trail.

**Schema:**
```typescript
{
  title: string,                         // Required
  description: string,                   // Required
  user: {
    _id: ObjectId,
    userName: string,
    phoneNumber: string
  },
  timeStamp: Date,                       // Default: Date.now
  action?: 'added' | 'updated' | 'deleted'  // Enum
}
```

**Relationships:**
- `user` references: `User` document (embedded user info)

**Timestamps:**
- Activities should be backdated to match related entity creation/update dates

---

### 10. User Settings (`UserSetting`)

Settings for the user-facing application.

**Schema:**
```typescript
{
  FAQs: string,
  Privacy_Policy: string,
  Terms_Of_Service: string,
  Platform_Consent: string,
  Disclaimer: string,
  Customer_Support: string
}
```

**Note:** Single document instance expected in collection.

---

### 11. Diagnostic Settings (`DiagnosticSetting`)

Settings for diagnostic center application (extends user settings).

**Schema:**
```typescript
{
  FAQs: string,
  Privacy_Policy: string,
  Terms_Of_Service: string,
  Platform_Consent: string,
  Disclaimer: string,
  Customer_Support: string,
  Ad_Banner: {
    title: string,
    url: string,
    alt: string,
    updatedAt: Date
  }[],
  Customer_Logo: {
    title: string,
    url: string,
    alt: string,
    updatedAt: Date
  }[],
  Additional: {
    getStartedUrl: string,
    demoVideoUrl: string
  },
  Testimonials: {
    name: string,
    comment: string,
    rating: number,
    updatedAt: Date
  }[]
}
```

**Note:** Single document instance expected in collection.

---

### 12. Dashboard (`dashboard`)

Aggregated dashboard statistics and data.

**Schema:**
```typescript
{
  cardData: {
    dcCount: number,
    userCount: number,
    reportCount: number,
    vaccineCount: number,
    diagnosedConditionCount: number
  },
  activities: ObjectId[],                // ref: 'Activity'
  lineCharts: {
    userCounts: {
      dcUsers: number,
      omeraldUsers: number
    },
    dcAssetCount: {
      dcReports: number,
      dcTests: number
    }
  },
  donutChart: {
    users: {
      omeraldUsers: number,
      adminUsers: number,
      diagUsers: number
    },
    dcDocs: {
      totalDcReport: number,
      totalDcTests: number
    },
    adminData: {
      vaccineCount: number,
      doseCount: number,
      doseDurationCount: number,
      reportCount: number,
      parameterCount: number,
      sampleCount: number,
      diagnosedConditionCount: number
    }
  }
}
```

---

## Data Requirements for Test Data Generation

### Scope
- **Time Range**: 1 year of backdated data (from 1 year ago to present)
- **Total Users**: 100 users (25 per role: admin, manager, sme, legal)
- **Phone Number Range**: `+1555 555 0101` to `+1555 555 0200`
- **Manual Validation Records**: ~10 users with known data for easy testing

### User Data Requirements

1. **Phone Numbers**: 
   - Format: `+1555 555 XXXX` where XXXX ranges from 0101 to 0200
   - Must be registered in Clerk with matching phone numbers
   - Use first and last name from `userName` field

2. **Role Distribution**:
   - `admin`: 25 users (phone numbers ending 0101-0125)
   - `manager`: 25 users (phone numbers ending 0126-0150)
   - `sme`: 25 users (phone numbers ending 0151-0175)
   - `legal`: 25 users (phone numbers ending 0176-0200)

3. **Created Dates**:
   - Distribute user creation dates evenly across the past year
   - Ensure realistic distribution (more recent = more users)

4. **User Names**:
   - Use realistic first and last names
   - Format: "FirstName LastName"
   - Use same names for Clerk registration

### Report Data Requirements

1. **Test Names**: Common diagnostic tests (CBC, LFT, KFT, Lipid Profile, etc.)
2. **Parameters**: 5-15 parameters per report
3. **Created Dates**: Backdated across the past year
4. **Updated Dates**: Should be >= createdAt
5. **Components**: At least 2 components per report (Overview, Interpretation)

### Parameter Data Requirements

1. **Common Parameters**: Hemoglobin, Blood Glucose, Cholesterol, etc.
2. **Bio Reference Ranges**: Realistic ranges with age and gender variations
3. **Units**: Standard medical units (g/dL, mg/dL, U/L, etc.)

### Activity Data Requirements

1. **Count**: ~500-1000 activities across the year
2. **Distribution**: 
   - More activities in recent months
   - Activities should align with entity creation/update dates
3. **Actions**: Mix of 'added', 'updated', 'deleted'
4. **Users**: Random assignment to existing users
5. **Timestamps**: Backdated to match related entity dates

### Relationship Rules

1. **Activities → Users**: Activity timestamp should be >= user createdAt
2. **Reports → Parameters**: Parameters should exist before being referenced
3. **Doses → Vaccines & Durations**: Dependencies must exist first
4. **Diagnosed Conditions → Parameters**: Parameter IDs must exist

---

## Clerk Integration Requirements

### User Creation

Each user must be registered in Clerk with:
- **Phone Number**: Matching database phoneNumber
- **First Name**: Extracted from userName (first word)
- **Last Name**: Extracted from userName (remaining words)
- **Skip Email**: Use phone-based authentication only

### Clerk API Usage

```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';

await clerkClient.users.createUser({
  phoneNumbers: [phoneNumber],
  firstName: firstName,
  lastName: lastName,
  skipPasswordChecks: true,  // For test users
  skipPasswordRequirement: true
});
```

### Error Handling

- If Clerk user creation fails, log error but continue with database user creation
- Option to skip Clerk registration if credentials not provided
- Track which users were successfully created in Clerk

---

## Manual Validation Records

For easy manual testing, create ~10 users with:
- Known, easy-to-remember names
- Documented phone numbers and roles
- Pre-determined data for reports, activities
- Clear documentation for testers

Example manual validation users:
1. `admin` - Admin User (+1555 555 0101)
2. `manager` - Manager User (+1555 555 0126)
3. `sme` - SME User (+1555 555 0151)
4. `legal` - Legal User (+1555 555 0176)
5. etc.

---

## Environment Variables Required

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://saifmohammed888_db_user:5zSlbANUHu70vD3F@omerald-admin.nzzdoit.mongodb.net/omerald-admin-dev?appName=OMERALD-ADMIN

# Clerk Integration (Optional)
CLERK_SECRET_KEY=sk_test_...
```

---

## Scripts

1. **generate-data.ts**: Generates and inserts all backdated data
2. **clear-data.ts**: Removes all generated test data
3. **README.md**: Usage instructions and setup guide


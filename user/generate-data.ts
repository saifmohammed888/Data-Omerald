/**
 * Generate Backdated Test Data for Omerald User App
 * 
 * Generates comprehensive test data including:
 * - 10 Users (phone +15555550101 to +15555550120) with Telugu Indian names
 * - 5 Family Members per user (father, mother, son, brother, sister, etc.)
 * - User-uploaded reports (PDFs) for users and members
 * - DC shared reports (pending and accepted) - integrated with DC data
 * - Real PDF reports (blood tests, medical reports) uploaded to S3
 * - Backdated data over the past year
 * - 3-5 manual test records
 * 
 * Usage:
 *   npx tsx generate-data.ts
 * 
 * Environment Variables:
 *   MONGO_URI or MONGODB_URI - MongoDB connection string
 *   AWS_ACCESS_KEY_ID - AWS access key for S3 uploads
 *   AWS_SECRET_ACCESS_KEY - AWS secret key for S3 uploads
 *   AWS_S3_BUCKET_NAME - S3 bucket name
 *   AWS_REGION - AWS region
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../omerald-app-v3F/.env.local') });
dotenv.config({ path: path.join(__dirname, '../../omerald-app-v3F/.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI or MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Import models
const modelsPath = path.join(__dirname, '../../omerald-app-v3F/src/lib/models');
let Profile: any, Reports: any;

// Configuration
const PHONE_START = 101; // +15555550101
const PHONE_END = 120;   // +15555550120
const TOTAL_USERS = 10;
const MEMBERS_PER_USER = 5;
const USER_UPLOADED_REPORTS_PER_USER = 3; // Reports uploaded by user
const USER_UPLOADED_REPORTS_PER_MEMBER = 2; // Reports uploaded for each member
const DC_SHARED_REPORTS_PER_USER = 2; // Pending DC shared reports
const DC_ACCEPTED_REPORTS_PER_USER = 2; // Accepted DC shared reports

// Indian Telugu names
const FIRST_NAMES = [
  'Arjun', 'Karthik', 'Rahul', 'Vikram', 'Sai', 'Pranav', 'Aditya', 'Rohit',
  'Suresh', 'Rajesh', 'Krishna', 'Venkat', 'Nikhil', 'Varun', 'Ravi', 'Siddharth',
  'Harish', 'Manoj', 'Vinod', 'Praveen', 'Anil', 'Gopal', 'Ramesh', 'Srinivas',
  'Charan', 'Raghav', 'Akhil', 'Naveen', 'Kiran', 'Santosh', 'Vijay', 'Ajay',
  'Mahesh', 'Sandeep', 'Dinesh', 'Raju', 'Pavan', 'Yashwanth', 'Teja', 'Vamsi',
  'Shiva', 'Rohan', 'Abhishek', 'Sachin', 'Amrit', 'Bharath', 'Chaitanya', 'Dhanush',
  'Eswar', 'Ganesh', 'Harshith', 'Ishaan', 'Jagan', 'Kaushik', 'Lakshman', 'Mohan',
  'Nagesh', 'Omkar', 'Pradeep', 'Raghu', 'Satish', 'Tarun', 'Uday', 'Vivek',
  'Priya', 'Lakshmi', 'Kavya', 'Sneha', 'Anusha', 'Divya', 'Swathi', 'Sravani',
  'Meghana', 'Ramya', 'Sindhu', 'Keerthi', 'Pooja', 'Shreya', 'Madhuri', 'Aishwarya',
  'Nisha', 'Deepika', 'Ritu', 'Anjali', 'Sandhya', 'Vidya', 'Jyothi', 'Supriya',
  'Radha', 'Sarika', 'Manasa', 'Chandana', 'Harika', 'Sushma', 'Latha', 'Shilpa',
];

const LAST_NAMES = [
  'Rao', 'Reddy', 'Naidu', 'Kumar', 'Sharma', 'Prasad', 'Murthy', 'Krishna',
  'Raju', 'Swamy', 'Iyer', 'Nair', 'Menon', 'Nayak', 'Patel', 'Singh',
  'Varma', 'Devi', 'Acharya', 'Bhatt', 'Chowdary', 'Das', 'Gandhi', 'Gopal',
  'Gupta', 'Joshi', 'Kapoor', 'Malhotra', 'Mehta', 'Mittal', 'Pandey', 'Patnaik',
  'Rathore', 'Saxena', 'Seth', 'Shah', 'Shukla', 'Sinha', 'Tiwari', 'Trivedi',
  'Venkatesh', 'Verma', 'Yadav', 'Agarwal', 'Banerjee', 'Basu', 'Bose', 'Chakraborty',
];

// Family relations
const FAMILY_RELATIONS = [
  'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Spouse',
  'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin',
];

// Blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Test/Report types
const REPORT_TYPES = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Function Test (TFT)',
  'Blood Glucose (Fasting)',
  'HbA1c',
  'Vitamin D',
  'Vitamin B12',
  'Hemoglobin',
  'Complete Metabolic Panel',
  'Lipid Panel',
  'Thyroid Profile',
  'Iron Studies',
  'Calcium & Phosphorus',
  'C-Reactive Protein (CRP)',
  'Prostate Specific Antigen (PSA)',
  'Carcinoembryonic Antigen (CEA)',
  'Urine Analysis',
  'Stool Examination',
];

// Indian cities
const CITIES = [
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
];

// Helper functions
const formatPhoneNumber = (num: number): string => `+1555555${String(num).padStart(3, '0')}`;

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateEmail = (firstName: string, lastName: string, index: number): string => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
};

const generateIndianAddress = (cityData: typeof CITIES[0]): string => {
  const streetNumber = randomInt(1, 999);
  const streetNames = ['MG Road', 'Main Street', 'Park Street', 'Gandhi Road', 'Nehru Street', 'Rajendra Nagar', 'Anna Nagar'];
  return `${streetNumber}, ${randomElement(streetNames)}, ${cityData.city}, ${cityData.state} ${cityData.pincode}`;
};

const generateUserName = (index: number): string => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
};

// Initialize S3 client
const getS3Client = (): S3Client | null => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';
  const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'omerald-diag-s3';

  if (!accessKeyId || !secretAccessKey) {
    console.warn('⚠️  AWS credentials not configured - PDF uploads will be skipped');
    return null;
  }

  return new S3Client({
    region: region.trim(),
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
    },
  });
};

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'omerald-diag-s3';

// Generate realistic PDF report
const generatePDFReport = async (
  patientName: string,
  reportType: string,
  reportDate: Date,
  patientAge: number,
  patientGender: string,
  bloodGroup: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('LABORATORY REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Sample Diagnostic Center', { align: 'center' });
    doc.moveDown(2);

    // Patient Information
    doc.fontSize(14).text('Patient Information:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Name: ${patientName}`);
    doc.text(`Age: ${patientAge} years`);
    doc.text(`Gender: ${patientGender}`);
    doc.text(`Blood Group: ${bloodGroup}`);
    doc.text(`Report Date: ${reportDate.toLocaleDateString()}`);
    doc.moveDown();

    // Test Name
    doc.fontSize(14).text(`Test: ${reportType}`, { underline: true });
    doc.moveDown();

    // Sample test results (based on report type)
    doc.fontSize(12).text('Test Results:', { underline: true });
    doc.moveDown(0.5);

    const results = generateTestResults(reportType);
    results.forEach((result) => {
      doc.text(`${result.parameter}: ${result.value} ${result.unit}`, { continued: false });
      doc.text(`Reference Range: ${result.referenceRange}`, { indent: 100 });
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.fontSize(10).text('Note: This is a sample report generated for testing purposes.', { align: 'center', italic: true });
    doc.end();
  });
};

// Generate test results based on report type
const generateTestResults = (reportType: string): Array<{ parameter: string; value: string; unit: string; referenceRange: string }> => {
  const commonResults: Record<string, Array<{ parameter: string; value: string; unit: string; referenceRange: string }>> = {
    'Complete Blood Count (CBC)': [
      { parameter: 'Hemoglobin', value: (12 + Math.random() * 4).toFixed(1), unit: 'g/dL', referenceRange: '12.0-16.0 g/dL' },
      { parameter: 'WBC Count', value: (4 + Math.random() * 6).toFixed(2), unit: 'x10³/µL', referenceRange: '4.0-11.0 x10³/µL' },
      { parameter: 'RBC Count', value: (4 + Math.random() * 1.5).toFixed(2), unit: 'x10⁶/µL', referenceRange: '4.5-5.5 x10⁶/µL' },
      { parameter: 'Platelet Count', value: Math.floor(150000 + Math.random() * 150000).toString(), unit: '/µL', referenceRange: '150,000-450,000 /µL' },
    ],
    'Lipid Profile': [
      { parameter: 'Total Cholesterol', value: (150 + Math.random() * 100).toFixed(0), unit: 'mg/dL', referenceRange: '<200 mg/dL' },
      { parameter: 'HDL Cholesterol', value: (40 + Math.random() * 30).toFixed(0), unit: 'mg/dL', referenceRange: '>40 mg/dL' },
      { parameter: 'LDL Cholesterol', value: (70 + Math.random() * 100).toFixed(0), unit: 'mg/dL', referenceRange: '<100 mg/dL' },
      { parameter: 'Triglycerides', value: (50 + Math.random() * 150).toFixed(0), unit: 'mg/dL', referenceRange: '<150 mg/dL' },
    ],
    'Liver Function Test (LFT)': [
      { parameter: 'Bilirubin Total', value: (0.3 + Math.random() * 1.2).toFixed(2), unit: 'mg/dL', referenceRange: '0.2-1.2 mg/dL' },
      { parameter: 'SGOT (AST)', value: (10 + Math.random() * 30).toFixed(0), unit: 'U/L', referenceRange: '10-40 U/L' },
      { parameter: 'SGPT (ALT)', value: (10 + Math.random() * 35).toFixed(0), unit: 'U/L', referenceRange: '10-40 U/L' },
      { parameter: 'Alkaline Phosphatase', value: (40 + Math.random() * 100).toFixed(0), unit: 'U/L', referenceRange: '44-147 U/L' },
    ],
    'Kidney Function Test (KFT)': [
      { parameter: 'Blood Urea', value: (15 + Math.random() * 25).toFixed(0), unit: 'mg/dL', referenceRange: '15-45 mg/dL' },
      { parameter: 'Serum Creatinine', value: (0.6 + Math.random() * 0.8).toFixed(2), unit: 'mg/dL', referenceRange: '0.7-1.2 mg/dL' },
      { parameter: 'Uric Acid', value: (3.5 + Math.random() * 3.5).toFixed(1), unit: 'mg/dL', referenceRange: '3.5-7.0 mg/dL' },
    ],
    'Thyroid Function Test (TFT)': [
      { parameter: 'TSH', value: (0.5 + Math.random() * 4.5).toFixed(2), unit: 'mIU/L', referenceRange: '0.4-4.0 mIU/L' },
      { parameter: 'T3', value: (80 + Math.random() * 60).toFixed(0), unit: 'ng/dL', referenceRange: '80-200 ng/dL' },
      { parameter: 'T4', value: (5 + Math.random() * 7).toFixed(1), unit: 'µg/dL', referenceRange: '5.0-12.0 µg/dL' },
    ],
  };

  return commonResults[reportType] || [
    { parameter: 'Test Value', value: (10 + Math.random() * 90).toFixed(1), unit: 'units', referenceRange: '10-100 units' },
  ];
};

// Upload PDF to S3
const uploadPDFToS3 = async (pdfBuffer: Buffer, userId: string, reportId: string): Promise<string> => {
  const s3Client = getS3Client();
  if (!s3Client) {
    // Return placeholder URL if S3 is not configured
    return `https://placeholder.s3.amazonaws.com/reports/${userId}/${reportId}.pdf`;
  }

  const fileName = `reports/${userId}/${reportId}.pdf`;
  const uploadCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  });

  try {
    await s3Client.send(uploadCommand);
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error(`Error uploading PDF to S3: ${error}`);
    throw error;
  }
};

// Main data generation function
const generateData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    // Load models
    console.log('📦 Loading models...');
    Profile = (await import(path.join(modelsPath, 'Profile.ts'))).default;
    Reports = (await import(path.join(modelsPath, 'Reports.ts'))).default;
    console.log('✅ Models loaded\n');

    const db = mongoose.connection.db;

    // Clear existing test data
    console.log('🧹 Cleaning up existing test data...');
    try {
      await Promise.all([
        db.collection('profiles').deleteMany({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0120)$/ } }),
        db.collection('reports').deleteMany({ userId: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0120)$/ } }),
      ]);
      console.log('✅ Cleanup complete\n');
    } catch (error: any) {
      console.log(`   ⚠️  Cleanup warning: ${error.message}`);
      console.log('   Continuing with data generation...\n');
    }

    // Fetch DC reports to link shared reports
    // DC reports have diagnosticCenter and sharedReportDetails fields, and no userId field
    console.log('📋 Fetching DC reports for shared reports integration...');
    let dcReports: any[] = [];
    try {
      // DC reports have diagnosticCenter field and sharedReportDetails, but no userId
      // User reports have userId field
      dcReports = await db.collection('reports').find({
        'diagnosticCenter': { $exists: true },
        'sharedReportDetails': { $exists: true },
        'userId': { $exists: false }, // DC reports don't have userId
      }).limit(100).toArray();
      console.log(`✅ Found ${dcReports.length} DC reports for shared reports integration\n`);
    } catch (error) {
      console.warn(`   ⚠️  Could not fetch DC reports: ${error}`);
      console.log('   Continuing without DC shared reports integration...\n');
    }

    const s3Client = getS3Client();
    if (!s3Client) {
      console.warn('⚠️  S3 not configured - PDFs will use placeholder URLs\n');
    }

    // Generate users
    console.log('👥 Creating Users and Family Members...');
    const createdUsers: any[] = [];
    const createdMembers: any[] = [];
    let dcReportIndex = 0;

    for (let userIdx = 0; userIdx < TOTAL_USERS; userIdx++) {
      const phoneNum = PHONE_START + userIdx;
      const phoneNumber = formatPhoneNumber(phoneNum);
      const userName = generateUserName(userIdx);
      const [firstName, lastName] = userName.split(' ');
      const cityData = randomElement(CITIES);
      const gender = randomElement(['male', 'female']);
      const dob = randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31));
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      // Create user profile
      const userProfileDoc = {
        phoneNumber,
        firstName,
        lastName,
        email: generateEmail(firstName, lastName, userIdx),
        gender,
        bloodGroup: randomElement(BLOOD_GROUPS),
        dob,
        bio: `Primary user account for ${firstName}`,
        address: {
          street: generateIndianAddress(cityData).split(',')[0],
          city: cityData.city,
          state: cityData.state,
          pincode: cityData.pincode,
          type: 'home',
        },
        createdDate: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
        userType: 'Primary',
        subscription: 'Free',
        members: [],
        reports: [],
        sharedReports: [],
        sharedWith: [],
        sharedMembers: [],
        diagnosedCondition: [],
        healthTopics: [],
        bmi: [],
        anthopometric: [],
        muac: [],
        foodAllergies: [],
        iapGrowthCharts: [],
        notification: [],
        activities: [],
        isPediatric: false,
        isDoctor: false,
        doctorApproved: false,
      };

      const userProfileResult = await db.collection('profiles').insertOne(userProfileDoc);
      const userProfileId = userProfileResult.insertedId;
      createdUsers.push({ _id: userProfileId, ...userProfileDoc });

      // Create family members
      const memberRelations = ['Father', 'Mother', 'Son', 'Brother', 'Sister'].slice(0, MEMBERS_PER_USER);
      const memberProfiles: any[] = [];

      for (let memberIdx = 0; memberIdx < memberRelations.length; memberIdx++) {
        const relation = memberRelations[memberIdx];
        const memberPhoneNum = PHONE_END + 1 + (userIdx * MEMBERS_PER_USER) + memberIdx;
        const memberPhoneNumber = formatPhoneNumber(memberPhoneNum);
        const memberName = generateUserName(userIdx * MEMBERS_PER_USER + memberIdx + 100);
        const [memberFirstName, memberLastName] = memberName.split(' ');
        
        // Determine gender based on relation
        let memberGender = gender;
        if (relation === 'Father' || relation === 'Brother' || relation === 'Son') {
          memberGender = 'male';
        } else if (relation === 'Mother' || relation === 'Sister' || relation === 'Daughter') {
          memberGender = 'female';
        } else {
          memberGender = randomElement(['male', 'female']);
        }

        // Generate appropriate DOB based on relation
        let memberDOB: Date;
        if (relation === 'Father' || relation === 'Mother') {
          memberDOB = randomDate(new Date(1950, 0, 1), new Date(1975, 11, 31));
        } else if (relation === 'Son' || relation === 'Daughter') {
          memberDOB = randomDate(new Date(2000, 0, 1), new Date(2015, 11, 31));
        } else {
          memberDOB = randomDate(new Date(1980, 0, 1), new Date(2000, 11, 31));
        }
        const memberAge = Math.floor((Date.now() - memberDOB.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

        const memberProfileDoc = {
          phoneNumber: memberPhoneNumber,
          firstName: memberFirstName,
          lastName: memberLastName,
          email: generateEmail(memberFirstName, memberLastName, userIdx * MEMBERS_PER_USER + memberIdx + 100),
          gender: memberGender,
          bloodGroup: randomElement(BLOOD_GROUPS),
          dob: memberDOB,
          bio: `${relation} of ${firstName}`,
          address: {
            street: generateIndianAddress(cityData).split(',')[0],
            city: cityData.city,
            state: cityData.state,
            pincode: cityData.pincode,
            type: 'home',
          },
          createdDate: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
          userType: 'Member',
          subscription: 'Free',
          members: [],
          reports: [],
          sharedReports: [],
          sharedWith: [],
          sharedMembers: [],
          diagnosedCondition: [],
          healthTopics: [],
          bmi: [],
          anthopometric: [],
          muac: [],
          foodAllergies: [],
          iapGrowthCharts: [],
          notification: [],
          activities: [],
          isPediatric: relation === 'Son' || relation === 'Daughter',
          isDoctor: false,
          doctorApproved: false,
        };

        const memberProfileResult = await db.collection('profiles').insertOne(memberProfileDoc);
        const memberProfileId = memberProfileResult.insertedId;
        memberProfiles.push({ _id: memberProfileId, ...memberProfileDoc, relation });

        // Add member to user's members array
        await db.collection('profiles').updateOne(
          { _id: userProfileId },
          {
            $push: {
              members: {
                memberId: String(memberProfileId),
                relation,
                phoneNumber: memberPhoneNumber,
                sharedWith: [],
              },
            },
          }
        );

        createdMembers.push({ _id: memberProfileId, ...memberProfileDoc, relation, userId: userProfileId });
      }

      console.log(`   ✅ User ${userIdx + 1}/${TOTAL_USERS}: ${userName} with ${memberProfiles.length} members`);

      // Generate user-uploaded reports for the user
      console.log(`      📄 Creating ${USER_UPLOADED_REPORTS_PER_USER} user-uploaded reports for ${userName}...`);
      for (let reportIdx = 0; reportIdx < USER_UPLOADED_REPORTS_PER_USER; reportIdx++) {
        const reportType = randomElement(REPORT_TYPES);
        const reportDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
        const reportId = `RPT-${userIdx}-${reportIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Generate PDF
        const pdfBuffer = await generatePDFReport(
          userName,
          reportType,
          reportDate,
          age,
          gender,
          userProfileDoc.bloodGroup
        );

        // Upload to S3
        const reportUrl = await uploadPDFToS3(pdfBuffer, phoneNumber, reportId);

        // Create report document
        const reportDoc = {
          userId: phoneNumber,
          userName: userName,
          reportId: reportId,
          reportUrl: reportUrl,
          reportDoc: reportUrl,
          name: reportType,
          type: 'Blood Report',
          testName: reportType,
          documentType: 'Blood Report',
          reportDate: reportDate,
          uploadDate: reportDate,
          uploadedAt: reportDate,
          status: 'accepted',
          createdBy: phoneNumber,
          updatedBy: phoneNumber,
          sharedWith: [],
          parsedData: [],
          parameters: [],
          parametersScanned: false,
          conditions: [],
          description: `User-uploaded ${reportType} report`,
          remarks: '',
        };

        const reportResult = await db.collection('reports').insertOne(reportDoc);

        // Add report to user's reports array in profile
        await db.collection('profiles').updateOne(
          { _id: userProfileId },
          { $push: { reports: reportDoc } }
        );
      }

      // Generate user-uploaded reports for each member
      for (const member of memberProfiles) {
        console.log(`      📄 Creating ${USER_UPLOADED_REPORTS_PER_MEMBER} user-uploaded reports for member ${member.firstName} ${member.lastName}...`);
        for (let reportIdx = 0; reportIdx < USER_UPLOADED_REPORTS_PER_MEMBER; reportIdx++) {
          const reportType = randomElement(REPORT_TYPES);
          const reportDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
          const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const memberDOBDate = member.dob instanceof Date ? member.dob : new Date(member.dob);
          const memberAge = Math.floor((Date.now() - memberDOBDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

          // Generate PDF
          const pdfBuffer = await generatePDFReport(
            `${member.firstName} ${member.lastName}`,
            reportType,
            reportDate,
            memberAge,
            member.gender,
            member.bloodGroup
          );

          // Upload to S3
          const reportUrl = await uploadPDFToS3(pdfBuffer, member.phoneNumber, reportId);

          // Create report document
          const reportDoc = {
            userId: member.phoneNumber,
            userName: `${member.firstName} ${member.lastName}`,
            reportId: reportId,
            reportUrl: reportUrl,
            reportDoc: reportUrl,
            name: reportType,
            type: 'Blood Report',
            testName: reportType,
            documentType: 'Blood Report',
            reportDate: reportDate,
            uploadDate: reportDate,
            uploadedAt: reportDate,
            status: 'accepted',
            createdBy: phoneNumber, // Created by the primary user
            updatedBy: phoneNumber,
            sharedWith: [],
            parsedData: [],
            parameters: [],
            parametersScanned: false,
            conditions: [],
            description: `User-uploaded ${reportType} report for ${member.relation}`,
            remarks: '',
          };

          await db.collection('reports').insertOne(reportDoc);

          // Add report to member's profile reports array
          await db.collection('profiles').updateOne(
            { _id: member._id },
            { $push: { reports: reportDoc } }
          );
        }
      }

      // Link DC shared reports (pending)
      if (dcReports.length > 0) {
        console.log(`      🔗 Linking ${DC_SHARED_REPORTS_PER_USER} pending DC shared reports...`);
        for (let i = 0; i < DC_SHARED_REPORTS_PER_USER && dcReportIndex < dcReports.length; i++) {
          const dcReport = dcReports[dcReportIndex % dcReports.length];
          dcReportIndex++;

          // Update DC report to include this user's phone in sharedReportDetails with accepted: false
          if (!dcReport.sharedReportDetails) {
            dcReport.sharedReportDetails = [];
          }

          // Check if phone already exists
          const existingShare = dcReport.sharedReportDetails.find(
            (share: any) => share.userContact === phoneNumber
          );

          if (!existingShare) {
            dcReport.sharedReportDetails.push({
              userContact: phoneNumber,
              userId: null, // User hasn't accepted yet
              accepted: false,
              blocked: false,
              rejected: false,
              sharedAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
            });

            await db.collection('reports').updateOne(
              { _id: dcReport._id },
              { $set: { sharedReportDetails: dcReport.sharedReportDetails } }
            );
          }
        }
      }

      // Link DC shared reports (accepted)
      if (dcReports.length > 0) {
        console.log(`      🔗 Linking ${DC_ACCEPTED_REPORTS_PER_USER} accepted DC shared reports...`);
        for (let i = 0; i < DC_ACCEPTED_REPORTS_PER_USER && dcReportIndex < dcReports.length; i++) {
          const dcReport = dcReports[dcReportIndex % dcReports.length];
          dcReportIndex++;

          // Update DC report to include this user's phone in sharedReportDetails with accepted: true
          if (!dcReport.sharedReportDetails) {
            dcReport.sharedReportDetails = [];
          }

          // Check if phone already exists
          const existingShareIndex = dcReport.sharedReportDetails.findIndex(
            (share: any) => share.userContact === phoneNumber
          );

          if (existingShareIndex >= 0) {
            dcReport.sharedReportDetails[existingShareIndex].accepted = true;
            dcReport.sharedReportDetails[existingShareIndex].userId = String(userProfileId);
          } else {
            dcReport.sharedReportDetails.push({
              userContact: phoneNumber,
              userId: String(userProfileId),
              accepted: true,
              blocked: false,
              rejected: false,
              sharedAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            });
          }

          await db.collection('reports').updateOne(
            { _id: dcReport._id },
            { $set: { sharedReportDetails: dcReport.sharedReportDetails } }
          );
        }
      }
    }

    console.log(`\n✅ Created ${createdUsers.length} users with ${createdMembers.length} family members\n`);

    // Generate 3-5 manual test records (for manual testing)
    console.log('📝 Creating 3-5 manual test records...');
    const manualTestCount = 3;
    const manualTestUsers = createdUsers.slice(0, manualTestCount);
    
    for (const testUser of manualTestUsers) {
      const testReportType = randomElement(REPORT_TYPES);
      const testReportDate = new Date(); // Recent date for manual testing
      const testReportId = `MANUAL-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const testUserDOBDate = testUser.dob instanceof Date ? testUser.dob : new Date(testUser.dob);
      const testUserAge = Math.floor((Date.now() - testUserDOBDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      // Generate PDF
      const pdfBuffer = await generatePDFReport(
        `${testUser.firstName} ${testUser.lastName}`,
        testReportType,
        testReportDate,
        testUserAge,
        testUser.gender,
        testUser.bloodGroup
      );

      // Upload to S3
      const reportUrl = await uploadPDFToS3(pdfBuffer, testUser.phoneNumber, testReportId);

      // Create report document
      const reportDoc = {
        userId: testUser.phoneNumber,
        userName: `${testUser.firstName} ${testUser.lastName}`,
        reportId: testReportId,
        reportUrl: reportUrl,
        reportDoc: reportUrl,
        name: testReportType,
        type: 'Blood Report',
        testName: testReportType,
        documentType: 'Blood Report',
        reportDate: testReportDate,
        uploadDate: testReportDate,
        uploadedAt: testReportDate,
        status: 'accepted',
        createdBy: testUser.phoneNumber,
        updatedBy: testUser.phoneNumber,
        sharedWith: [],
        parsedData: [],
        parameters: [],
        parametersScanned: false,
        conditions: [],
        description: `MANUAL TEST REPORT - ${testReportType}`,
        remarks: 'This is a manual test record for validation',
      };

      await db.collection('reports').insertOne(reportDoc);

      // Add report to user's reports array in profile
      await db.collection('profiles').updateOne(
        { _id: testUser._id },
        { $push: { reports: reportDoc } }
      );
    }

    console.log(`✅ Created ${manualTestCount} manual test records\n`);

    console.log('🎉 Data generation completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length} (phone +15555550101 to +15555550120)`);
    console.log(`   - Family Members: ${createdMembers.length} (5 per user)`);
    console.log(`   - User-uploaded Reports: ${createdUsers.length * USER_UPLOADED_REPORTS_PER_USER + createdMembers.length * USER_UPLOADED_REPORTS_PER_MEMBER}`);
    console.log(`   - DC Shared Reports (Pending): ${dcReports.length > 0 ? createdUsers.length * DC_SHARED_REPORTS_PER_USER : 0} (${dcReports.length === 0 ? 'No DC reports found - ensure DC data is generated first' : 'linked successfully'})`);
    console.log(`   - DC Shared Reports (Accepted): ${dcReports.length > 0 ? createdUsers.length * DC_ACCEPTED_REPORTS_PER_USER : 0} (${dcReports.length === 0 ? 'No DC reports found - ensure DC data is generated first' : 'linked successfully'})`);
    console.log(`   - Manual Test Records: ${manualTestCount}`);
    
    if (dcReports.length === 0) {
      console.log(`\n⚠️  Note: DC reports were not found in the database.`);
      console.log(`   Please ensure DC data has been generated first (run data/dc/generate-data.ts)`);
      console.log(`   DC reports should have 'diagnosticCenter' and 'sharedReportDetails' fields`);
    }

  } catch (error) {
    console.error('❌ Error during data generation:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the script
generateData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  });


/**
 * Generate Backdated Test Data for Omerald Diagnostic Center
 * 
 * Generates comprehensive test data including:
 * - 50 Users (phone +15555550101 to +15555550150) with Indian Telugu names
 * - Multiple Diagnostic Centers with Indian names and addresses
 * - Branches with realistic Indian addresses
 * - Tests (50 sample report types)
 * - Reports (50 reports) with realistic health data
 * - Users with all roles (owner, admin, spoc, operator, manager)
 * - Complex relationships (users in multiple branches, multiple DCs)
 * - Pathologists with signatures
 * 
 * Scenarios covered:
 * 1. Single owner with multiple DCs
 * 2. Single DC (one branch)
 * 3. Multi-branch DCs
 * 
 * Usage:
 *   npx tsx generate-data.ts
 * 
 * Environment Variables:
 *   MONGO_URI or MONGODB_URI - MongoDB connection string
 *   AWS_ACCESS_KEY_ID - AWS access key for S3 uploads (optional, for signatures)
 *   AWS_SECRET_ACCESS_KEY - AWS secret key for S3 uploads (optional)
 *   AWS_S3_BUCKET_NAME - S3 bucket name (optional)
 *   AWS_REGION - AWS region (optional)
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../omeraldDiagnostic-v3/.env.local') });
dotenv.config({ path: path.join(__dirname, '../../omeraldDiagnostic-v3/.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI or MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Import models
const modelsPath = path.join(__dirname, '../../omeraldDiagnostic-v3/lib/models');
let Profile: any, User: any, Branch: any, Test: any, Report: any;

// Configuration
const PHONE_START = 101; // +15555550101
const PHONE_END = 150;   // +15555550150
const TOTAL_USERS = 50;
const REPORTS_PER_BRANCH = 20; // At least 20 reports per branch
const TOTAL_TESTS = 20; // At least 20 sample types (tests)
const TOTAL_DCS = 5; // 5 DCs total

// Indian Telugu names (same as admin app)
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

// Indian Diagnostic Center names
const DC_NAMES = [
  'Apollo Diagnostics', 'Max Healthcare Labs', 'Dr. Lal PathLabs', 'Thyrocare',
  'Metropolis Healthcare', 'SRL Diagnostics', 'Star Health Labs', 'Manipal Hospitals Lab',
  'Aster Labs', 'Fortis PathLabs', 'Columbia Asia Labs', 'Narayana Health Labs',
  'Rainbow Hospitals Lab', 'Continental Hospitals Lab', 'Yashoda Labs', 'KIMS Labs',
  'Global Hospitals Lab', 'Care Hospitals Lab', 'Medanta Labs', 'BLK Labs',
];

// Indian cities for addresses
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

// Areas in cities
const AREAS = {
  Hyderabad: ['Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Secunderabad', 'Ameerpet'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'MG Road', 'HSR Layout'],
  Chennai: ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'OMR', 'Guindy'],
  Mumbai: ['Andheri', 'Bandra', 'Powai', 'Lower Parel', 'Vashi', 'Thane'],
  Delhi: ['Connaught Place', 'Gurgaon', 'Noida', 'Dwarka', 'Rohini', 'Saket'],
  Pune: ['Hinjewadi', 'Viman Nagar', 'Koregaon Park', 'Baner', 'Aundh', 'Wakad'],
  Kolkata: ['Park Street', 'Salt Lake', 'New Town', 'Dum Dum', 'Howrah', 'Barrackpore'],
  Ahmedabad: ['SG Highway', 'Prahlad Nagar', 'Bopal', 'Bodakdev', 'Maninagar', 'Navrangpura'],
};

// Roles
type Role = 'owner' | 'admin' | 'spoc' | 'operator' | 'manager';
const ROLES: Role[] = ['owner', 'admin', 'spoc', 'operator', 'manager'];

// Helper functions
const randomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

const formatPhoneNumber = (num: number): string => {
  return `+1555555${String(num).padStart(4, '0')}`;
};

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateUserName = (index: number): string => {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  return `${firstName} ${lastName}`;
};

// Generate Indian address
const generateIndianAddress = (cityData: typeof CITIES[0]): string => {
  const area = randomElement(AREAS[cityData.city as keyof typeof AREAS] || ['Main Area']);
  const streetNumber = Math.floor(Math.random() * 100) + 1;
  const streetNames = ['Road', 'Street', 'Lane', 'Main Road', 'Cross', 'Circle'];
  const streetName = randomElement(streetNames);
  
  return `${streetNumber}, ${area} ${streetName}, ${cityData.city}, ${cityData.state} ${cityData.pincode}`;
};

// Generate diagnostic center data
const generateDCConfigs = () => {
  const configs: Array<{
    centerName: string;
    email: string;
    phoneNumber: string;
    logoUrl: string;
    bannerUrl: string;
    cityData: typeof CITIES[0];
    ownerUserIndex: number; // Index of owner user
    branches: Array<{
      branchName: string;
      branchEmail: string;
      branchAddress: string;
      branchContact: string;
      branchLogo: string;
    }>;
  }> = [];

  let userPhoneIndex = PHONE_START;
  const usedDCNames = new Set<string>();

  // Scenario 1: 1 user owns 3 DCs, each DC has 2 branches (owner accesses all branches)
  const owner1UserIndex = 0; // First user owns all 3 DCs
  const owner1City = randomElement(CITIES);
  
  for (let i = 0; i < 3; i++) {
    let dcNameBase = randomElement(DC_NAMES);
    let dcName = `${dcNameBase} ${owner1City.city}`;
    let counter = 1;
    while (usedDCNames.has(dcName.toLowerCase())) {
      dcName = `${dcNameBase} ${owner1City.city} ${counter}`;
      counter++;
    }
    usedDCNames.add(dcName.toLowerCase());
    const city = randomElement(CITIES);
    
    configs.push({
      centerName: dcName,
      email: `${dcName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phoneNumber: formatPhoneNumber(userPhoneIndex++),
      logoUrl: `https://images.unsplash.com/photo-${1559757148 + i}?w=200&h=200&fit=crop`,
      bannerUrl: `https://images.unsplash.com/photo-${1576091160 + i}?w=1200&h=400&fit=crop`,
      cityData: city,
      ownerUserIndex: owner1UserIndex,
      branches: [
        {
          branchName: `${dcName} - Main Branch`,
          branchEmail: `main@${dcName.toLowerCase().replace(/\s+/g, '')}.com`,
          branchAddress: generateIndianAddress(city),
          branchContact: formatPhoneNumber(userPhoneIndex++),
          branchLogo: `https://images.unsplash.com/photo-${1551601651 + i}?w=200&h=200&fit=crop`,
        },
        {
          branchName: `${dcName} - Secondary Branch`,
          branchEmail: `secondary@${dcName.toLowerCase().replace(/\s+/g, '')}.com`,
          branchAddress: generateIndianAddress(city),
          branchContact: formatPhoneNumber(userPhoneIndex++),
          branchLogo: `https://images.unsplash.com/photo-${1551601651 + i + 10}?w=200&h=200&fit=crop`,
        },
      ],
    });
  }

  // Scenario 2: 1 user owns 2 DCs, each with 2 branches
  const owner2UserIndex = 3; // User at index 3 owns 2 DCs
  for (let i = 0; i < 2; i++) {
    let dcName = randomElement(DC_NAMES);
    const city = randomElement(CITIES);
    let dcNameFull = `${dcName} ${city.city}`;
    let counter = 1;
    while (usedDCNames.has(dcNameFull.toLowerCase())) {
      dcNameFull = `${dcName} ${city.city} ${counter}`;
      counter++;
    }
    usedDCNames.add(dcNameFull.toLowerCase());
    
    configs.push({
      centerName: dcNameFull,
      email: `${dcName.toLowerCase().replace(/\s+/g, '')}${i}@example.com`,
      phoneNumber: formatPhoneNumber(userPhoneIndex++),
      logoUrl: `https://images.unsplash.com/photo-${1559757148 + i + 3}?w=200&h=200&fit=crop`,
      bannerUrl: `https://images.unsplash.com/photo-${1576091160 + i + 3}?w=1200&h=400&fit=crop`,
      cityData: city,
      ownerUserIndex: owner2UserIndex,
      branches: [
        {
          branchName: `${dcNameFull} - Main Branch`,
          branchEmail: `main@${dcName.toLowerCase().replace(/\s+/g, '')}.com`,
          branchAddress: generateIndianAddress(city),
          branchContact: formatPhoneNumber(userPhoneIndex++),
          branchLogo: `https://images.unsplash.com/photo-${1551601651 + i + 3}?w=200&h=200&fit=crop`,
        },
        {
          branchName: `${dcNameFull} - Secondary Branch`,
          branchEmail: `secondary@${dcName.toLowerCase().replace(/\s+/g, '')}.com`,
          branchAddress: generateIndianAddress(city),
          branchContact: formatPhoneNumber(userPhoneIndex++),
          branchLogo: `https://images.unsplash.com/photo-${1551601651 + i + 13}?w=200&h=200&fit=crop`,
        },
      ],
    });
  }

  // Total: 5 DCs (3 + 2)

  return configs;
};

// Generate test templates (at least 20 sample types)
const generateTestTemplates = () => {
  return [
    { name: 'Complete Blood Count (CBC)', sample: 'Whole Blood' },
    { name: 'Lipid Profile', sample: 'Serum' },
    { name: 'Liver Function Test (LFT)', sample: 'Serum' },
    { name: 'Kidney Function Test (KFT)', sample: 'Serum' },
    { name: 'Thyroid Function Test (TFT)', sample: 'Serum' },
    { name: 'Blood Glucose (Fasting)', sample: 'Serum' },
    { name: 'HbA1c', sample: 'Whole Blood' },
    { name: 'Vitamin D', sample: 'Serum' },
    { name: 'Vitamin B12', sample: 'Serum' },
    { name: 'Hemoglobin', sample: 'Whole Blood' },
    { name: 'Complete Metabolic Panel', sample: 'Serum' },
    { name: 'Basic Metabolic Panel', sample: 'Serum' },
    { name: 'Lipid Panel Advanced', sample: 'Serum' },
    { name: 'Thyroid Profile Complete', sample: 'Serum' },
    { name: 'Iron Studies', sample: 'Serum' },
    { name: 'Calcium & Phosphorus', sample: 'Serum' },
    { name: 'Magnesium Level', sample: 'Serum' },
    { name: 'Sodium & Potassium', sample: 'Serum' },
    { name: 'C-Reactive Protein (CRP)', sample: 'Serum' },
    { name: 'Procalcitonin Test', sample: 'Serum' },
    { name: 'D-Dimer Test', sample: 'Plasma' },
    { name: 'Prothrombin Time (PT/INR)', sample: 'Plasma' },
    { name: 'Partial Thromboplastin Time (APTT)', sample: 'Plasma' },
    { name: 'Prostate Specific Antigen (PSA)', sample: 'Serum' },
    { name: 'Carcinoembryonic Antigen (CEA)', sample: 'Serum' },
    { name: 'CA 125 Test', sample: 'Serum' },
    { name: 'CA 19-9 Test', sample: 'Serum' },
    { name: 'Alpha-Fetoprotein (AFP)', sample: 'Serum' },
    { name: 'Beta HCG Test', sample: 'Serum' },
    { name: 'Prolactin Level', sample: 'Serum' },
    { name: 'Cortisol Test', sample: 'Serum' },
    { name: 'Testosterone Test', sample: 'Serum' },
    { name: 'Estrogen Test', sample: 'Serum' },
    { name: 'Growth Hormone Test', sample: 'Serum' },
    { name: 'Insulin Level', sample: 'Serum' },
    { name: 'C-Peptide Test', sample: 'Serum' },
    { name: 'Hb Electrophoresis', sample: 'Whole Blood' },
    { name: 'Sickle Cell Test', sample: 'Whole Blood' },
    { name: 'Thalassemia Screening', sample: 'Whole Blood' },
    { name: 'Urine Analysis', sample: 'Urine' },
    { name: 'Stool Examination', sample: 'Stool' },
    { name: 'Sputum Culture', sample: 'Sputum' },
    { name: 'Blood Culture', sample: 'Whole Blood' },
    { name: 'Widal Test', sample: 'Serum' },
    { name: 'Malaria Parasite', sample: 'Whole Blood' },
    { name: 'Dengue NS1 Antigen', sample: 'Serum' },
    { name: 'Typhoid IgM/IgG', sample: 'Serum' },
    { name: 'Hepatitis B Surface Antigen', sample: 'Serum' },
    { name: 'Hepatitis C Antibody', sample: 'Serum' },
    { name: 'HIV 1 & 2', sample: 'Serum' },
    { name: 'Folic Acid Test', sample: 'Serum' },
  ];
};

// Generate parameters for a test (simplified version)
const getParametersForTest = (testName: string): any[] => {
  // This is a simplified version - you can expand this with more realistic parameters
  const paramMap: Record<string, any[]> = {
    'Complete Blood Count (CBC)': [
      {
        name: 'White Blood Cell Count',
        subText: 'WBC',
        units: '10^3/µL',
        bioRefRange: {
          basicRange: [{ min: 4.0, max: 11.0, unit: '10^3/µL' }],
          advanceRange: { ageRange: [], genderRange: [], customRange: [] },
        },
        isActive: true,
      },
      {
        name: 'Red Blood Cell Count',
        subText: 'RBC',
        units: '10^6/µL',
        bioRefRange: {
          basicRange: [{ min: 4.5, max: 5.5, unit: '10^6/µL' }],
          advanceRange: {
            ageRange: [],
            genderRange: [
              {
                genderRangeType: 'male',
                unit: '10^6/µL',
                min: 4.7,
                max: 6.1,
                details: { menopause: false, pregnant: false, trimester: 'none', prePuberty: false },
              },
              {
                genderRangeType: 'female',
                unit: '10^6/µL',
                min: 4.2,
                max: 5.4,
                details: { menopause: false, pregnant: false, trimester: 'none', prePuberty: false },
              },
            ],
            customRange: [],
          },
        },
        isActive: true,
      },
      {
        name: 'Hemoglobin',
        subText: 'Hb',
        units: 'g/dL',
        bioRefRange: {
          basicRange: [{ min: 12.0, max: 16.0, unit: 'g/dL' }],
          advanceRange: {
            ageRange: [],
            genderRange: [
              {
                genderRangeType: 'male',
                unit: 'g/dL',
                min: 13.5,
                max: 17.5,
                details: { menopause: false, pregnant: false, trimester: 'none', prePuberty: false },
              },
              {
                genderRangeType: 'female',
                unit: 'g/dL',
                min: 12.0,
                max: 15.5,
                details: { menopause: false, pregnant: false, trimester: 'none', prePuberty: false },
              },
            ],
            customRange: [],
          },
        },
        isActive: true,
      },
      {
        name: 'Platelet Count',
        subText: 'PLT',
        units: '10^3/µL',
        bioRefRange: {
          basicRange: [{ min: 150, max: 450, unit: '10^3/µL' }],
          advanceRange: { ageRange: [], genderRange: [], customRange: [] },
        },
        isActive: true,
      },
    ],
  };

  return paramMap[testName] || [
    {
      name: `${testName} Parameter`,
      subText: 'Main',
      units: 'mg/dL',
      bioRefRange: {
        basicRange: [{ min: 0, max: 100, unit: 'mg/dL' }],
        advanceRange: { ageRange: [], genderRange: [], customRange: [] },
      },
      isActive: true,
    },
  ];
};

// S3 upload helper (optional - for pathologist signatures)
let s3Client: S3Client | null = null;
const getS3Client = (): S3Client | null => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    if (!s3Client) {
      s3Client = new S3Client({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        region: process.env.AWS_REGION || 'us-east-1',
      });
    }
    return s3Client;
  }
  return null;
};

const uploadSignatureToS3 = async (signatureBuffer: Buffer, fileName: string): Promise<string | null> => {
  const client = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  
  if (!client || !bucket) {
    console.log('   ⚠️  S3 not configured, using placeholder URL');
    return `https://placeholder.signature.com/${fileName}`;
  }

  try {
    const key = `pathologist-signatures/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: signatureBuffer,
      ContentType: 'image/png',
    });
    
    await client.send(command);
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  } catch (error: any) {
    console.error(`   ⚠️  Failed to upload signature: ${error.message}`);
    return `https://placeholder.signature.com/${fileName}`;
  }
};

// Generate pathologist signature (placeholder - can be enhanced with GPT)
const generatePathologistSignature = async (name: string): Promise<string> => {
  // For now, return a placeholder. In the future, this can generate images using GPT/DALL-E
  // and upload to S3
  const placeholderBuffer = Buffer.from('placeholder-signature-image-data');
  const fileName = `${name.replace(/\s+/g, '-').toLowerCase()}-signature.png`;
  return await uploadSignatureToS3(placeholderBuffer, fileName);
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

    // Import models
    console.log('📦 Loading models...');
    Profile = (await import(path.join(modelsPath, 'Profile.ts'))).default;
    User = (await import(path.join(modelsPath, 'User.ts'))).default;
    Branch = (await import(path.join(modelsPath, 'Branch.ts'))).default;
    Test = (await import(path.join(modelsPath, 'Test.ts'))).default;
    Report = (await import(path.join(modelsPath, 'Report.ts'))).default;
    console.log('✅ Models loaded\n');

    const db = mongoose.connection.db;

    // Clear existing test data
    console.log('🧹 Cleaning up existing test data...');
    try {
      await Promise.all([
        db.collection('users').deleteMany({ phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|0150)$/ } }),
        db.collection('profiles').deleteMany({}),
        db.collection('branches').deleteMany({}),
        db.collection('tests').deleteMany({}),
        db.collection('reports').deleteMany({}),
      ]);
      console.log('✅ Cleanup complete\n');
    } catch (error: any) {
      console.log(`   ⚠️  Cleanup warning: ${error.message}`);
      console.log('   Continuing with data generation...\n');
    }

    // Generate DC configurations
    console.log('🏥 Generating Diagnostic Center configurations...');
    const dcConfigs = generateDCConfigs();
    console.log(`✅ Generated ${dcConfigs.length} DC configurations\n`);

    // Step 1: Create Users
    console.log('👥 Creating Users...');
    const users: any[] = [];
    for (let i = 0; i < TOTAL_USERS; i++) {
      const phoneNum = PHONE_START + i;
      const phoneNumber = formatPhoneNumber(phoneNum);
      const userName = generateUserName(i);
      
      const userDoc = {
        userName,
        phoneNumber,
        diagnosticCenters: [], // Will be populated later
      };
      
      const userResult = await db.collection('users').insertOne(userDoc);
      users.push({
        _id: userResult.insertedId,
        ...userDoc,
      });
    }
    console.log(`✅ Created ${users.length} users\n`);

    // Calculate total branches
    const totalBranches = dcConfigs.reduce((sum, dc) => sum + dc.branches.length, 0);
    console.log(`📊 Expected structure: ${dcConfigs.length} DCs, ${totalBranches} branches total\n`);

    // Step 2: Create Diagnostic Centers and Branches
    console.log('🏥 Creating Diagnostic Centers and Branches...');
    const createdDCs: any[] = [];
    const createdBranches: any[] = [];
    const dcToOwnerMap = new Map<string, string>(); // DC ID -> Owner User ID

    for (let dcIdx = 0; dcIdx < dcConfigs.length; dcIdx++) {
      const dcConfig = dcConfigs[dcIdx];
      
      // Get owner user from config
      const ownerUser = users[dcConfig.ownerUserIndex];

      // Create DC Profile
      const profileDoc = {
        centerName: dcConfig.centerName,
        centerNameLower: dcConfig.centerName.toLowerCase(),
        phoneNumber: dcConfig.phoneNumber,
        ownerId: ownerUser._id,
        email: dcConfig.email,
        brandingInfo: {
          logoUrl: dcConfig.logoUrl,
          bannerUrl: dcConfig.bannerUrl,
          facebookUrl: '',
          instaUrl: '',
        },
        branches: [],
        tests: [],
        updatedAt: new Date(),
      };

      const profileResult = await db.collection('profiles').insertOne(profileDoc);
      const dcId = profileResult.insertedId;
      createdDCs.push(dcId);
      dcToOwnerMap.set(String(dcId), String(ownerUser._id));

      // Create Branches
      const branchIds: any[] = [];
      for (const branchConfig of dcConfig.branches) {
        const branchDoc = {
          branchName: branchConfig.branchName,
          branchEmail: branchConfig.branchEmail,
          branchAddress: branchConfig.branchAddress,
          branchContact: branchConfig.branchContact,
          branchLogo: branchConfig.branchLogo,
          branchStatus: 'active',
          branchOperator: [],
          sharedReport: [],
          reports: [],
          activities: [],
          pathologistDetail: [],
          updatedAt: new Date(),
        };

        const branchResult = await db.collection('branches').insertOne(branchDoc);
        branchIds.push(branchResult.insertedId);
        createdBranches.push(branchResult.insertedId);

        // Update Profile with branch
        await db.collection('profiles').updateOne(
          { _id: dcId },
          { $push: { branches: branchResult.insertedId } }
        );
      }

      console.log(`   ✅ Created DC: ${dcConfig.centerName} (Owner: ${ownerUser.userName}) with ${branchIds.length} branches`);
    }
    console.log(`✅ Created ${createdDCs.length} DCs and ${createdBranches.length} branches\n`);

    // Build branch to DC mapping (store during DC creation)
    const branchToDC = new Map<string, string>();
    let branchGlobalIdx = 0;
    for (let dcIdx = 0; dcIdx < dcConfigs.length; dcIdx++) {
      const dcId = createdDCs[dcIdx];
      const dcConfig = dcConfigs[dcIdx];
      for (let branchLocalIdx = 0; branchLocalIdx < dcConfig.branches.length; branchLocalIdx++) {
        const branchId = createdBranches[branchGlobalIdx];
        branchToDC.set(String(branchId), String(dcId));
        branchGlobalIdx++;
      }
    }

    // Step 3: Assign user roles to branches and DCs
    console.log('🔐 Assigning user roles...');
    
    // Assign owners to all branches of their DCs
    let branchIdx = 0;
    let employeeUserIdx = 10; // Start assigning employees from user index 10
    
    for (let dcIdx = 0; dcIdx < dcConfigs.length; dcIdx++) {
      const dcConfig = dcConfigs[dcIdx];
      const dcId = createdDCs[dcIdx];
      const ownerUser = users[dcConfig.ownerUserIndex];
      
      // Owner gets access to ALL branches of this DC
      const dcBranchIds: any[] = [];
      for (let branchLocalIdx = 0; branchLocalIdx < dcConfig.branches.length; branchLocalIdx++) {
        const branchId = createdBranches[branchIdx];
        dcBranchIds.push({ branchId, roleName: 'owner' });
        
        // Add owner to branch operators
        await db.collection('branches').updateOne(
          { _id: branchId },
          { $push: { branchOperator: ownerUser._id } }
        );
        branchIdx++;
      }
      
      // Add all branches to owner's DC entry
      await db.collection('users').updateOne(
        { _id: ownerUser._id },
        {
          $push: {
            diagnosticCenters: {
              diagnostic: dcId,
              branches: dcBranchIds,
            },
          },
        }
      );

      // For each branch, add ONE employee (not to all branches)
      // Employees are added to individual branches only
      for (let branchLocalIdx = 0; branchLocalIdx < dcConfig.branches.length; branchLocalIdx++) {
        const branchId = createdBranches[branchIdx - dcConfig.branches.length + branchLocalIdx];
        
        // Add one employee per branch (different role per branch)
        const roles = ['admin', 'manager', 'spoc', 'operator'];
        const role = roles[branchLocalIdx % roles.length];
        
        // Get next available employee user
        employeeUserIdx = (employeeUserIdx + 1) % users.length;
        // Skip if we're trying to use the owner
        if (employeeUserIdx === dcConfig.ownerUserIndex) {
          employeeUserIdx = (employeeUserIdx + 1) % users.length;
        }
        
        const employeeUser = users[employeeUserIdx];
        
        // Check if employee already has this DC
        const employeeDoc = await db.collection('users').findOne({ _id: employeeUser._id });
        const hasDC = employeeDoc?.diagnosticCenters?.some((dc: any) => String(dc.diagnostic) === String(dcId));
        
        if (hasDC) {
          // Add branch to existing DC entry
          await db.collection('users').updateOne(
            { _id: employeeUser._id, 'diagnosticCenters.diagnostic': dcId },
            { $push: { 'diagnosticCenters.$.branches': { branchId, roleName: role } } }
          );
        } else {
          // Add new DC entry with this branch only
          await db.collection('users').updateOne(
            { _id: employeeUser._id },
            {
              $push: {
                diagnosticCenters: {
                  diagnostic: dcId,
                  branches: [{ branchId, roleName: role }],
                },
              },
            }
          );
        }
        
        // Add employee to branch operators
        await db.collection('branches').updateOne(
          { _id: branchId },
          { $push: { branchOperator: employeeUser._id } }
        );
      }
      
      console.log(`   ✅ DC ${dcIdx + 1}: Owner ${ownerUser.userName} assigned to all ${dcConfig.branches.length} branches`);
    }
    
    console.log('✅ User roles assigned\n');

    // Step 4: Add pathologists to branches
    console.log('👨‍⚕️ Adding pathologists to branches...');
    const pathologistDesignations = ['Senior Pathologist', 'Chief Pathologist', 'Consultant Pathologist', 'Pathologist'];
    
    for (let i = 0; i < createdBranches.length; i++) {
      const branchId = createdBranches[i];
      const pathologistName = `Dr. ${generateUserName(i)}`;
      const designation = randomElement(pathologistDesignations);
      const signature = await generatePathologistSignature(pathologistName);
      
      await db.collection('branches').updateOne(
        { _id: branchId },
        {
          $push: {
            pathologistDetail: {
              name: pathologistName,
              designation,
              signature,
            },
          },
        }
      );
    }
    console.log(`✅ Added pathologists to ${createdBranches.length} branches\n`);

    // Step 5: Add activities to branches
    console.log('📝 Adding activities to branches...');
    const activityMessages = [
      'Report generated',
      'Test completed',
      'Patient registered',
      'Report shared',
      'Test updated',
      'Branch settings updated',
    ];

    for (let i = 0; i < createdBranches.length; i++) {
      const branchId = createdBranches[i];
      const branchDoc = await db.collection('branches').findOne({ _id: branchId });
      const operators = branchDoc?.branchOperator || [];
      
      if (operators.length > 0) {
        for (let j = 0; j < 5; j++) {
          const operatorId = operators[j % operators.length];
          await db.collection('branches').updateOne(
            { _id: branchId },
            {
              $push: {
                activities: {
                  activity: activityMessages[j % activityMessages.length],
                  user: operatorId,
                  updatedTime: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
                },
              },
            }
          );
        }
      }
    }
    console.log(`✅ Added activities to branches\n`);

    // Step 6: Create Tests (at least 20 sample types, distributed across branches)
    console.log('🧪 Creating tests (at least 20 sample types)...');
    const testTemplates = generateTestTemplates();
    const createdTests: any[] = [];
    
    // Create all test templates, distributed across branches using round-robin
    // This ensures every branch gets at least some tests
    for (let testIdx = 0; testIdx < testTemplates.length; testIdx++) {
      const branchIdx = testIdx % createdBranches.length; // Round-robin distribution
      const branchId = createdBranches[branchIdx];
      const dcId = branchToDC.get(String(branchId));
      if (!dcId) continue;
      
      const testTemplate = testTemplates[testIdx];
      const parameters = getParametersForTest(testTemplate.name);
      
      const testDoc = {
        testName: testTemplate.name,
        sampleName: testTemplate.sample,
        parameters,
        isActive: true,
        components: [
          {
            title: 'Test Overview',
            content: `This is a comprehensive ${testTemplate.name} test that provides detailed analysis of the patient's health status.`,
            isDynamic: false,
            images: [],
          },
        ],
        branchId,
        diagnosticCenterId: new mongoose.Types.ObjectId(dcId),
        createdAt: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
        updatedAt: new Date(),
      };
      
      const testResult = await db.collection('tests').insertOne(testDoc);
      createdTests.push(testResult.insertedId);
      
      // Update Profile with test
      await db.collection('profiles').updateOne(
        { _id: new mongoose.Types.ObjectId(dcId) },
        { $push: { tests: testResult.insertedId } }
      );
    }
    console.log(`✅ Created ${createdTests.length} tests (${testTemplates.length} unique sample types)\n`);

    // Step 7: Create Reports (at least 20 reports per branch)
    console.log(`📄 Creating reports (${REPORTS_PER_BRANCH} per branch)...`);
    const createdReports: any[] = [];
    const patientNames = FIRST_NAMES.slice(0, 200).map((f, i) => `${f} ${LAST_NAMES[i % LAST_NAMES.length]}`);
    
    // Build branch to tests mapping
    const branchToTests = new Map<string, any[]>();
    for (const testId of createdTests) {
      const test = await db.collection('tests').findOne({ _id: testId });
      if (test?.branchId) {
        const branchIdStr = String(test.branchId);
        if (!branchToTests.has(branchIdStr)) {
          branchToTests.set(branchIdStr, []);
        }
        branchToTests.get(branchIdStr)!.push(testId);
      }
    }

    let reportGlobalIdx = 0;
    
    // Create reports for each branch
    for (let branchIdx = 0; branchIdx < createdBranches.length; branchIdx++) {
      const branchId = createdBranches[branchIdx];
      const dcId = branchToDC.get(String(branchId));
      if (!dcId) continue;
      
      const testsForBranch = branchToTests.get(String(branchId)) || [];
      if (testsForBranch.length === 0) {
        console.log(`   ⚠️  Branch ${branchIdx + 1} has no tests, skipping reports`);
        continue;
      }
      
      // Get branch for pathologist
      const branch = await db.collection('branches').findOne({ _id: branchId });
      const pathologist = branch?.pathologistDetail?.[0];
      
      // Create REPORTS_PER_BRANCH reports for this branch
      for (let reportLocalIdx = 0; reportLocalIdx < REPORTS_PER_BRANCH; reportLocalIdx++) {
        const testId = testsForBranch[reportLocalIdx % testsForBranch.length];
        const test = await db.collection('tests').findOne({ _id: testId });
        if (!test) continue;
        
        const patientName = patientNames[reportGlobalIdx % patientNames.length];
        const patientPhone = `+1555556${String(1000 + reportGlobalIdx).padStart(4, '0')}`;
        const patientEmail = `patient${reportGlobalIdx}@example.com`;
        
        // Create parameter values
        const parameterValues = (test.parameters || []).map((param: any) => {
          const basicRange = param.bioRefRange?.basicRange?.[0];
          if (basicRange) {
            const min = basicRange.min || 0;
            const max = basicRange.max || 100;
            const value = min + (max - min) * (0.5 + (reportGlobalIdx % 50) / 100);
            return {
              ...param,
              value: Math.round(value * 100) / 100,
            };
          }
          return { ...param, value: null };
        });
        
        const reportDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
        
        const reportDoc = {
          pathologist: {
            name: pathologist?.name || `Dr. ${generateUserName(reportGlobalIdx)}`,
            id: branch?.branchOperator?.[0] ? String(branch.branchOperator[0]) : String(users[reportGlobalIdx % users.length]._id),
          },
          patient: {
            name: patientName,
            dob: `19${70 + (reportGlobalIdx % 30)}-${String((reportGlobalIdx % 12) + 1).padStart(2, '0')}-${String((reportGlobalIdx % 28) + 1).padStart(2, '0')}`,
            gender: ['male', 'female', 'other'][reportGlobalIdx % 3],
            contact: {
              phone: patientPhone,
              email: patientEmail,
            },
          },
          diagnosticCenter: {
            diagnostic: new mongoose.Types.ObjectId(dcId),
            branch: branchId,
          },
          reportData: {
            reportName: test.testName,
            isManual: false,
            url: null,
            parsedData: {
              test: testId,
              parameters: parameterValues,
              components: test.components || [],
            },
            reportDate,
            updatedDate: new Date(),
          },
          sharedReportDetails: [
            {
              userContact: patientPhone,
              userId: null,
              accepted: reportGlobalIdx % 3 === 0,
              blocked: false,
              rejected: false,
              sharedAt: new Date(),
            },
          ],
        };
        
        const reportResult = await db.collection('reports').insertOne(reportDoc);
        createdReports.push(reportResult.insertedId);
        
        // Update Branch with report
        await db.collection('branches').updateOne(
          { _id: branchId },
          { $push: { reports: reportResult.insertedId } }
        );
        
        reportGlobalIdx++;
      }
      
      console.log(`   ✅ Branch ${branchIdx + 1}: Created ${REPORTS_PER_BRANCH} reports`);
    }
    
    const totalReports = createdReports.length;
    const expectedReports = createdBranches.length * REPORTS_PER_BRANCH;
    console.log(`✅ Created ${totalReports} reports (${REPORTS_PER_BRANCH} per branch, ${createdBranches.length} branches = ${expectedReports} expected)\n`);

    console.log('🎉 Data generation completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - DCs: ${createdDCs.length} (${TOTAL_DCS} expected)`);
    console.log(`   - Branches: ${createdBranches.length} (${createdDCs.length * 2} expected - 2 per DC)`);
    console.log(`   - Tests: ${createdTests.length} (${testTemplates.length} unique sample types available, ${createdTests.length} tests created)`);
    console.log(`   - Reports: ${createdReports.length} (${REPORTS_PER_BRANCH} per branch, ${createdBranches.length * REPORTS_PER_BRANCH} total expected)`);
    console.log(`\n📋 Structure:`);
    console.log(`   - Scenario 1: 1 user owns 3 DCs, each DC has 2 branches (owner accesses all branches)`);
    console.log(`   - Scenario 2: 1 user owns 2 DCs, each DC has 2 branches (owner accesses all branches)`);
    console.log(`   - Employees: 1 employee per branch (different roles)`);

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


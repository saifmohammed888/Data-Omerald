/**
 * Generate Comprehensive Test Data for Omerald User App
 * 
 * Generates 10 users with different combinations:
 * - Varying numbers of family members (0-5)
 * - Varying numbers of user-uploaded reports (0-10+)
 * - Varying numbers of DC shared reports (pending/accepted)
 * - User-shared reports (reports shared between users)
 * - All member fields: BMI, MUAC, Anthropometric, IAP Growth Charts, Food Allergies, Diagnosed Conditions
 * - Pediatric members with complete pediatric data
 * - All data backdated over 1 year
 * - Real DC reports from diagnostic centers
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

// Performance optimization: Skip PDF generation (use placeholder URLs)
const SKIP_PDF_GENERATION = true; // Set to false to generate actual PDFs

// User combinations configuration - each user gets different data
const USER_CONFIGS = [
  { members: 0, userReports: 5, memberReports: 0, dcPending: 0, dcAccepted: 0, userShared: 0 }, // User 1: Reports only, no members
  { members: 3, userReports: 0, memberReports: 6, dcPending: 2, dcAccepted: 0, userShared: 0 }, // User 2: Members only, pending DC
  { members: 5, userReports: 3, memberReports: 10, dcPending: 2, dcAccepted: 2, userShared: 1 }, // User 3: Full setup
  { members: 2, userReports: 1, memberReports: 4, dcPending: 1, dcAccepted: 1, userShared: 0 }, // User 4: Minimal
  { members: 0, userReports: 0, memberReports: 0, dcPending: 3, dcAccepted: 0, userShared: 0 }, // User 5: DC pending only
  { members: 1, userReports: 10, memberReports: 2, dcPending: 0, dcAccepted: 3, userShared: 2 }, // User 6: Many reports, accepted DC
  { members: 4, userReports: 2, memberReports: 8, dcPending: 0, dcAccepted: 0, userShared: 1 }, // User 7: No DC reports
  { members: 3, userReports: 4, memberReports: 6, dcPending: 1, dcAccepted: 2, userShared: 0 }, // User 8: Mixed
  { members: 5, userReports: 0, memberReports: 0, dcPending: 0, dcAccepted: 0, userShared: 0 }, // User 9: Members only, no reports
  { members: 2, userReports: 8, memberReports: 4, dcPending: 2, dcAccepted: 1, userShared: 1 }, // User 10: Many user reports
];

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

// Diagnosed conditions
const CONDITIONS = [
  'Diabetes Type 2', 'Hypertension', 'Anemia', 'Hypothyroidism', 'Hyperthyroidism',
  'High Cholesterol', 'Vitamin D Deficiency', 'Vitamin B12 Deficiency', 'Iron Deficiency',
  'Asthma', 'Arthritis', 'Osteoporosis', 'Kidney Disease', 'Liver Disease',
];

// Food allergies
const FOOD_ALLERGIES = [
  'Peanuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Tree Nuts',
  'Gluten', 'Lactose', 'Sesame', 'Mustard',
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
const formatPhoneNumber = (num: number): string => `+1555555${String(num).padStart(4, '0')}`;

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
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

// Calculate age from DOB
const calculateAge = (dob: Date): number => {
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

// Calculate age in months for pediatric
const calculateAgeInMonths = (dob: Date): number => {
  const now = new Date();
  const years = now.getFullYear() - dob.getFullYear();
  const months = now.getMonth() - dob.getMonth();
  return years * 12 + months;
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

// Upload PDF to S3 (or return placeholder if skipped)
const uploadPDFToS3 = async (pdfBuffer: Buffer | null, userId: string, reportId: string): Promise<string> => {
  if (SKIP_PDF_GENERATION || !pdfBuffer) {
    return `https://placeholder.s3.amazonaws.com/reports/${userId}/${reportId}.pdf`;
  }

  const s3Client = getS3Client();
  if (!s3Client) {
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
    return `https://placeholder.s3.amazonaws.com/reports/${userId}/${reportId}.pdf`;
  }
};

// Generate BMI data (backdated over 1 year) - Reduced for performance
const generateBMIData = (dob: Date, isPediatric: boolean): any[] => {
  const bmiData: any[] = [];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const age = calculateAge(dob);
  
  // Generate 2-3 BMI records over the past year (reduced for performance)
  const numRecords = randomInt(2, 3);
  const dates = [];
  for (let i = 0; i < numRecords; i++) {
    dates.push(randomDate(oneYearAgo, now));
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  dates.forEach((date) => {
    let height, weight, bmi;
    if (isPediatric) {
      // Pediatric: height in cm, weight in kg
      const ageInMonths = calculateAgeInMonths(dob);
      if (ageInMonths < 12) {
        height = randomFloat(50, 75, 1); // 0-12 months
        weight = randomFloat(3, 10, 2);
      } else if (ageInMonths < 24) {
        height = randomFloat(75, 85, 1); // 12-24 months
        weight = randomFloat(10, 12, 2);
      } else if (ageInMonths < 60) {
        height = randomFloat(85, 110, 1); // 2-5 years
        weight = randomFloat(12, 20, 2);
      } else {
        height = randomFloat(110, 150, 1); // 5+ years
        weight = randomFloat(20, 40, 2);
      }
      bmi = weight / ((height / 100) ** 2);
    } else {
      // Adult: height in cm, weight in kg
      height = randomFloat(150, 185, 1);
      weight = randomFloat(50, 90, 1);
      bmi = weight / ((height / 100) ** 2);
    }

    bmiData.push({
      height: Math.round(height),
      weight: Math.round(weight * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      updatedDate: date,
      comment: [],
    });
  });

  return bmiData;
};

// Generate MUAC data (for pediatric only, backdated over 1 year) - Reduced for performance
const generateMUACData = (dob: Date): any[] => {
  const muacData: any[] = [];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const ageInMonths = calculateAgeInMonths(dob);
  
  // Generate 1-2 MUAC records (reduced for performance)
  const numRecords = randomInt(1, 2);
  const dates = [];
  for (let i = 0; i < numRecords; i++) {
    dates.push(randomDate(oneYearAgo, now));
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  dates.forEach((date) => {
    // MUAC in cm (Mid-Upper Arm Circumference)
    // Normal range: 12.5-16.5 cm for children
    let height;
    if (ageInMonths < 12) {
      height = randomFloat(11, 14, 1);
    } else if (ageInMonths < 24) {
      height = randomFloat(12, 15, 1);
    } else if (ageInMonths < 60) {
      height = randomFloat(13, 16, 1);
    } else {
      height = randomFloat(14, 17, 1);
    }

    muacData.push({
      height: Math.round(height * 10) / 10,
      updatedDate: date,
      comment: [],
    });
  });

  return muacData;
};

// Generate Anthropometric data (for pediatric only, backdated over 1 year) - Reduced for performance
const generateAnthropometricData = (dob: Date): any[] => {
  const anthroData: any[] = [];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  // Generate 1-2 records (reduced for performance)
  const numRecords = randomInt(1, 2);
  const dates = [];
  for (let i = 0; i < numRecords; i++) {
    dates.push(randomDate(oneYearAgo, now));
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  dates.forEach((date) => {
    // Anthropometric measurement (can be head circumference, chest circumference, etc.)
    // Using head circumference as example (normal: 33-38 cm for infants, 48-52 cm for toddlers)
    const ageInMonths = calculateAgeInMonths(dob);
    let measurement;
    if (ageInMonths < 12) {
      measurement = randomFloat(33, 38, 1);
    } else if (ageInMonths < 24) {
      measurement = randomFloat(38, 45, 1);
    } else {
      measurement = randomFloat(45, 52, 1);
    }

    anthroData.push({
      anthopometric: Math.round(measurement * 10) / 10,
      updatedDate: date,
      comment: [],
    });
  });

  return anthroData;
};

// Generate IAP Growth Charts data (for pediatric only, backdated over 1 year) - Reduced for performance
const generateIAPGrowthChartsData = (dob: Date): any[] => {
  const iapData: any[] = [];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  // Generate 2-4 records (reduced for performance)
  const numRecords = randomInt(2, 4);
  const dates = [];
  for (let i = 0; i < numRecords; i++) {
    dates.push(randomDate(oneYearAgo, now));
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  dates.forEach((date) => {
    const ageInMonths = calculateAgeInMonths(dob);
    const ageAtDate = Math.floor((date.getTime() - dob.getTime()) / (30.44 * 24 * 60 * 60 * 1000)); // Age in months at that date
    
    let weight, height;
    if (ageAtDate < 12) {
      weight = randomFloat(3, 10, 2);
      height = randomFloat(50, 75, 1);
    } else if (ageAtDate < 24) {
      weight = randomFloat(10, 12, 2);
      height = randomFloat(75, 85, 1);
    } else if (ageAtDate < 60) {
      weight = randomFloat(12, 20, 2);
      height = randomFloat(85, 110, 1);
    } else {
      weight = randomFloat(20, 40, 2);
      height = randomFloat(110, 150, 1);
    }

    iapData.push({
      age: ageAtDate,
      weight: Math.round(weight * 10) / 10,
      height: Math.round(height),
      date: date,
      comment: [],
    });
  });

  return iapData;
};

// Generate Food Allergies data (backdated over 1 year)
const generateFoodAllergiesData = (): any[] => {
  const allergies: any[] = [];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  // 0-3 food allergies
  const numAllergies = randomInt(0, 3);
  const selectedAllergies = [];
  for (let i = 0; i < numAllergies; i++) {
    const allergy = randomElement(FOOD_ALLERGIES);
    if (!selectedAllergies.includes(allergy)) {
      selectedAllergies.push(allergy);
      allergies.push({
        foodItem: allergy,
        updatedDate: randomDate(oneYearAgo, now),
        comment: [],
      });
    }
  }

  return allergies;
};

// Generate Diagnosed Conditions data (backdated over 1 year)
const generateDiagnosedConditionsData = (): any[] => {
  const conditions: any[] = [];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  // 0-2 diagnosed conditions
  const numConditions = randomInt(0, 2);
  const selectedConditions = [];
  for (let i = 0; i < numConditions; i++) {
    const condition = randomElement(CONDITIONS);
    if (!selectedConditions.includes(condition)) {
      selectedConditions.push(condition);
      conditions.push({
        condition: condition,
        date: randomDate(oneYearAgo, now),
      });
    }
  }

  return conditions;
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
      const profilesDeleted = await db.collection('profiles').deleteMany({
        phoneNumber: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|01[2-6][0-9]|0170)$/ }
      });
      
      const reportsDeleted = await db.collection('reports').deleteMany({
        userId: { $regex: /^\+1555555(010[1-9]|01[1-9][0-9]|01[2-6][0-9]|0170)$/ }
      });
      
      console.log(`✅ Deleted ${profilesDeleted.deletedCount} profiles and ${reportsDeleted.deletedCount} reports\n`);
    } catch (error: any) {
      console.log(`   ⚠️  Cleanup warning: ${error.message}`);
      console.log('   Continuing with data generation...\n');
    }

    // Fetch DC reports to link shared reports
    console.log('📋 Fetching DC reports for shared reports integration...');
    let dcReports: any[] = [];
    try {
      dcReports = await db.collection('reports').find({
        'diagnosticCenter': { $exists: true },
        'sharedReportDetails': { $exists: true },
        'userId': { $exists: false },
      }).limit(200).toArray();
      console.log(`✅ Found ${dcReports.length} DC reports for shared reports integration\n`);
    } catch (error) {
      console.warn(`   ⚠️  Could not fetch DC reports: ${error}`);
      console.log('   Continuing without DC shared reports integration...\n');
    }

    const s3Client = getS3Client();
    if (SKIP_PDF_GENERATION) {
      console.log('⚡ Performance mode: Skipping PDF generation (using placeholder URLs)\n');
    } else if (!s3Client) {
      console.warn('⚠️  S3 not configured - PDFs will use placeholder URLs\n');
    }

    // Generate users with different combinations
    console.log('👥 Creating Users with Different Combinations...');
    const createdUsers: any[] = [];
    const createdMembers: any[] = [];
    const allUserReports: any[] = []; // Store all reports for user sharing
    let dcReportIndex = 0;
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const now = new Date();

    for (let userIdx = 0; userIdx < TOTAL_USERS; userIdx++) {
      const config = USER_CONFIGS[userIdx];
      const phoneNum = PHONE_START + userIdx;
      const phoneNumber = formatPhoneNumber(phoneNum);
      const userName = generateUserName(userIdx);
      const [firstName, lastName] = userName.split(' ');
      const cityData = randomElement(CITIES);
      const gender = randomElement(['male', 'female']);
      const dob = randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31));
      const age = calculateAge(dob);

      // Create user profile with all fields
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
        createdDate: randomDate(oneYearAgo, now),
        userType: 'Primary',
        subscription: 'Free',
        members: [],
        reports: [],
        sharedReports: [],
        sharedWith: [],
        sharedMembers: [],
        diagnosedCondition: generateDiagnosedConditionsData(),
        healthTopics: [],
        bmi: generateBMIData(dob, false),
        anthopometric: [],
        muac: [],
        foodAllergies: generateFoodAllergiesData(),
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

      // Create family members based on config
      const memberRelations = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister'].slice(0, config.members);
      const memberProfiles: any[] = [];
      let memberPhoneCounter = PHONE_END + 1 + (userIdx * 10);

      for (let memberIdx = 0; memberIdx < config.members; memberIdx++) {
        const relation = memberRelations[memberIdx];
        const memberPhoneNumber = formatPhoneNumber(memberPhoneCounter++);
        const memberName = generateUserName(userIdx * 10 + memberIdx + 100);
        const [memberFirstName, memberLastName] = memberName.split(' ');
        
        // Determine gender based on relation
        let memberGender = 'male';
        if (relation === 'Father' || relation === 'Brother' || relation === 'Son') {
          memberGender = 'male';
        } else if (relation === 'Mother' || relation === 'Sister' || relation === 'Daughter') {
          memberGender = 'female';
        } else {
          memberGender = randomElement(['male', 'female']);
        }

        // Generate appropriate DOB based on relation
        let memberDOB: Date;
        const isPediatric = relation === 'Son' || relation === 'Daughter';
        if (relation === 'Father' || relation === 'Mother') {
          memberDOB = randomDate(new Date(1950, 0, 1), new Date(1975, 11, 31));
        } else if (isPediatric) {
          memberDOB = randomDate(new Date(2015, 0, 1), new Date(2023, 11, 31)); // Pediatric: 0-9 years
        } else {
          memberDOB = randomDate(new Date(1980, 0, 1), new Date(2000, 11, 31));
        }
        const memberAge = calculateAge(memberDOB);

        // Generate member-specific data
        const memberBMIData = generateBMIData(memberDOB, isPediatric);
        const memberMUACData = isPediatric ? generateMUACData(memberDOB) : [];
        const memberAnthroData = isPediatric ? generateAnthropometricData(memberDOB) : [];
        const memberIAPData = isPediatric ? generateIAPGrowthChartsData(memberDOB) : [];
        const memberFoodAllergies = generateFoodAllergiesData();
        const memberConditions = generateDiagnosedConditionsData();

        const memberProfileDoc = {
          phoneNumber: memberPhoneNumber,
          firstName: memberFirstName,
          lastName: memberLastName,
          email: generateEmail(memberFirstName, memberLastName, userIdx * 10 + memberIdx + 100),
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
          createdDate: randomDate(oneYearAgo, now),
          userType: 'Member',
          subscription: 'Free',
          members: [],
          reports: [],
          sharedReports: [],
          sharedWith: [],
          sharedMembers: [],
          diagnosedCondition: memberConditions,
          healthTopics: [],
          bmi: memberBMIData,
          anthopometric: memberAnthroData,
          muac: memberMUACData,
          foodAllergies: memberFoodAllergies,
          iapGrowthCharts: memberIAPData,
          notification: [],
          activities: [],
          isPediatric: isPediatric,
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

      console.log(`   ✅ User ${userIdx + 1}/${TOTAL_USERS}: ${userName} (${((userIdx + 1) / TOTAL_USERS * 100).toFixed(0)}%)`);
      if (config.members > 0 || config.userReports > 0 || config.memberReports > 0) {
        console.log(`      - Members: ${config.members}, User Reports: ${config.userReports}, Member Reports: ${config.memberReports}`);
      }
      if (config.dcPending > 0 || config.dcAccepted > 0 || config.userShared > 0) {
        console.log(`      - DC Pending: ${config.dcPending}, DC Accepted: ${config.dcAccepted}, User Shared: ${config.userShared}`);
      }

      // Generate user-uploaded reports for the user
      const userReports: any[] = [];
      if (config.userReports > 0) {
        console.log(`      📄 Creating ${config.userReports} user reports...`);
      }
      for (let reportIdx = 0; reportIdx < config.userReports; reportIdx++) {
        const reportType = randomElement(REPORT_TYPES);
        const reportDate = randomDate(oneYearAgo, now);
        const reportId = `RPT-${userIdx}-${reportIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Generate PDF (skip if SKIP_PDF_GENERATION is true)
        let pdfBuffer: Buffer | null = null;
        if (!SKIP_PDF_GENERATION) {
          pdfBuffer = await generatePDFReport(
            userName,
            reportType,
            reportDate,
            age,
            gender,
            userProfileDoc.bloodGroup
          );
        }

        // Upload to S3 (or get placeholder)
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

        await db.collection('reports').insertOne(reportDoc);
        userReports.push(reportDoc);
        allUserReports.push({ ...reportDoc, userProfileId, phoneNumber });

        // Add report to user's reports array in profile
        await db.collection('profiles').updateOne(
          { _id: userProfileId },
          { $push: { reports: reportDoc } }
        );
      }

      // Generate user-uploaded reports for each member
      if (config.memberReports > 0 && memberProfiles.length > 0) {
        console.log(`      📄 Creating ${config.memberReports} member reports...`);
      }
      for (const member of memberProfiles) {
        const memberReportsPerMember = Math.floor(config.memberReports / config.members) + (memberProfiles.indexOf(member) < (config.memberReports % config.members) ? 1 : 0);
        
        for (let reportIdx = 0; reportIdx < memberReportsPerMember; reportIdx++) {
          const reportType = randomElement(REPORT_TYPES);
          const reportDate = randomDate(oneYearAgo, now);
          const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const memberDOBDate = member.dob instanceof Date ? member.dob : new Date(member.dob);
          const memberAge = calculateAge(memberDOBDate);

          // Generate PDF (skip if SKIP_PDF_GENERATION is true)
          let pdfBuffer: Buffer | null = null;
          if (!SKIP_PDF_GENERATION) {
            pdfBuffer = await generatePDFReport(
              `${member.firstName} ${member.lastName}`,
              reportType,
              reportDate,
              memberAge,
              member.gender,
              member.bloodGroup
            );
          }

          // Upload to S3 (or get placeholder)
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
            createdBy: phoneNumber,
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
      if (dcReports.length > 0 && config.dcPending > 0) {
        for (let i = 0; i < config.dcPending && dcReportIndex < dcReports.length; i++) {
          const dcReport = dcReports[dcReportIndex % dcReports.length];
          dcReportIndex++;

          if (!dcReport.sharedReportDetails) {
            dcReport.sharedReportDetails = [];
          }

          const existingShare = dcReport.sharedReportDetails.find(
            (share: any) => share.userContact === phoneNumber
          );

          if (!existingShare) {
            dcReport.sharedReportDetails.push({
              userContact: phoneNumber,
              userId: null,
              accepted: false,
              blocked: false,
              rejected: false,
              sharedAt: randomDate(oneYearAgo, now),
            });

            await db.collection('reports').updateOne(
              { _id: dcReport._id },
              { $set: { sharedReportDetails: dcReport.sharedReportDetails } }
            );
          }
        }
      }

      // Link DC shared reports (accepted)
      if (dcReports.length > 0 && config.dcAccepted > 0) {
        for (let i = 0; i < config.dcAccepted && dcReportIndex < dcReports.length; i++) {
          const dcReport = dcReports[dcReportIndex % dcReports.length];
          dcReportIndex++;

          if (!dcReport.sharedReportDetails) {
            dcReport.sharedReportDetails = [];
          }

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
              sharedAt: randomDate(oneYearAgo, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            });
          }

          await db.collection('reports').updateOne(
            { _id: dcReport._id },
            { $set: { sharedReportDetails: dcReport.sharedReportDetails } }
          );
        }
      }

      // Create user-shared reports (reports shared from this user to other users)
      if (config.userShared > 0 && userReports.length > 0 && createdUsers.length > 1) {
        for (let i = 0; i < config.userShared && i < userReports.length; i++) {
          const reportToShare = userReports[i];
          // Share with a random other user
          const otherUsers = createdUsers.filter(u => String(u._id) !== String(userProfileId));
          if (otherUsers.length > 0) {
            const targetUser = randomElement(otherUsers);
            const shareDate = randomDate(oneYearAgo, now);

            // Find the report document in database to get its _id
            const reportDoc = await db.collection('reports').findOne({ reportId: reportToShare.reportId });
            if (reportDoc) {
              // Add to report's sharedWith array
              await db.collection('reports').updateOne(
                { _id: reportDoc._id },
                {
                  $push: {
                    sharedWith: {
                      profileId: String(targetUser._id),
                      phoneNumber: targetUser.phoneNumber,
                      name: `${targetUser.firstName} ${targetUser.lastName}`,
                      sharedAt: shareDate,
                    },
                  },
                }
              );

              // Add to target user's sharedReports array in profile
              await db.collection('profiles').updateOne(
                { _id: targetUser._id },
                {
                  $push: {
                    sharedReports: reportToShare.reportId,
                  },
                }
              );
            }
          }
        }
      }
    }

    console.log(`\n✅ Created ${createdUsers.length} users with ${createdMembers.length} family members\n`);

    // Summary
    console.log('🎉 Data generation completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length} (phone +15555550101 to +15555550120)`);
    console.log(`   - Family Members: ${createdMembers.length} (varying per user)`);
    console.log(`   - All users have BMI, Food Allergies, and Diagnosed Conditions data`);
    console.log(`   - Pediatric members have BMI, MUAC, Anthropometric, and IAP Growth Charts data`);
    console.log(`   - All data is backdated over 1 year period`);
    console.log(`   - DC Shared Reports linked from actual DC data`);
    console.log(`   - User-shared reports created between users`);
    
    if (dcReports.length === 0) {
      console.log(`\n⚠️  Note: DC reports were not found in the database.`);
      console.log(`   Please ensure DC data has been generated first (run data/dc/generate-data.ts)`);
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

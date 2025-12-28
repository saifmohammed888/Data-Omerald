/**
 * Backdated Data Generation Script for Omerald Admin
 * 
 * Generates a year's worth of realistic backdated sample data including:
 * - 10 Users (3 admin, 3 manager, 2 sme, 2 legal - all role combinations)
 * - Reports with parameters and components
 * - Parameters with bio reference ranges
 * - Samples
 * - Diagnosed Conditions
 * - Vaccines, Doses, Durations
 * - Activities (aligned with entity dates)
 * - Settings (User & Diagnostic)
 * - ~10 manual validation records
 * 
 * Clerk Integration: Optionally registers users in Clerk
 * 
 * Usage:
 *   tsx generate-data.ts
 *   or
 *   npx ts-node generate-data.ts
 * 
 * Environment Variables:
 *   MONGO_URI - MongoDB connection string
 *   CLERK_SECRET_KEY - (Optional) Clerk secret key for user registration
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Models will be imported after MongoDB connection (like existing scripts)
let User: any, Report: any, Parameter: any, Sample: any, DiagnosedCondition: any;
let Vaccine: any, Dose: any, Duration: any, Activity: any;
let UserSetting: any, DiagnosticSetting: any;

// Clerk integration (optional)
let clerkClient: any = null;
try {
  if (process.env.CLERK_SECRET_KEY) {
    // Use createClerkClient to initialize with secret key
    const { createClerkClient } = await import('@clerk/clerk-sdk-node');
    clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    console.log('✅ Clerk SDK loaded (user registration enabled)');
  } else {
    console.log('⚠️  CLERK_SECRET_KEY not set - skipping Clerk user registration');
  }
} catch (error: any) {
  console.log(`⚠️  Clerk SDK not available - skipping Clerk user registration: ${error.message}`);
}

// Database connection
const mongoURI = process.env.MONGO_URI || '';
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI environment variable is not set');
  process.exit(1);
}

// Configuration
const YEARS_BACK = 1; // Generate data from 1 year ago to now
const START_DATE = new Date();
START_DATE.setFullYear(START_DATE.getFullYear() - YEARS_BACK);
START_DATE.setMonth(0, 1); // January 1st

const TOTAL_USERS = 10;
const PHONE_START = 101; // +1555 555 0101
const PHONE_END = 110;   // +1555 555 0110

// Roles
const ROLES = ['admin', 'manager', 'sme', 'legal'] as const;
type Role = typeof ROLES[number];

// Manual validation users (10 users with all role combinations - easy to remember, using Telugu names)
// Distribution: 3 admin, 3 manager, 2 sme, 2 legal (ensures all roles are well represented)
const MANUAL_VALIDATION_NAMES = [
  { firstName: 'Arjun', lastName: 'Rao', role: 'admin' as Role },
  { firstName: 'Priya', lastName: 'Reddy', role: 'manager' as Role },
  { firstName: 'Karthik', lastName: 'Naidu', role: 'sme' as Role },
  { firstName: 'Lakshmi', lastName: 'Kumar', role: 'legal' as Role },
  { firstName: 'Rahul', lastName: 'Sharma', role: 'admin' as Role },
  { firstName: 'Kavya', lastName: 'Prasad', role: 'manager' as Role },
  { firstName: 'Vikram', lastName: 'Murthy', role: 'sme' as Role },
  { firstName: 'Sneha', lastName: 'Raju', role: 'legal' as Role },
  { firstName: 'Sai', lastName: 'Krishna', role: 'admin' as Role },
  { firstName: 'Divya', lastName: 'Swamy', role: 'manager' as Role },
];

// Helper functions
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

const formatPhoneNumber = (num: number): string => {
  const padded = String(num).padStart(4, '0');
  // Return format: +15555550101 (Clerk and MongoDB format - no spaces)
  return `+1555555${padded}`;
};

const parseName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || 'User',
    lastName: parts.slice(1).join(' ') || 'Name',
  };
};

// Indian Telugu names pool
const FIRST_NAMES = [
  // Male names
  'Arjun', 'Karthik', 'Rahul', 'Vikram', 'Sai', 'Pranav', 'Aditya', 'Rohit',
  'Suresh', 'Rajesh', 'Krishna', 'Venkat', 'Nikhil', 'Varun', 'Ravi', 'Siddharth',
  'Harish', 'Manoj', 'Vinod', 'Praveen', 'Anil', 'Gopal', 'Ramesh', 'Srinivas',
  'Charan', 'Raghav', 'Akhil', 'Naveen', 'Kiran', 'Santosh', 'Vijay', 'Ajay',
  'Mahesh', 'Sandeep', 'Dinesh', 'Raju', 'Pavan', 'Yashwanth', 'Teja', 'Vamsi',
  'Shiva', 'Rohan', 'Abhishek', 'Sachin', 'Amrit', 'Bharath', 'Chaitanya', 'Dhanush',
  'Eswar', 'Ganesh', 'Harshith', 'Ishaan', 'Jagan', 'Kaushik', 'Lakshman', 'Mohan',
  'Nagesh', 'Omkar', 'Pradeep', 'Raghu', 'Satish', 'Tarun', 'Uday', 'Vivek',
  // Female names
  'Priya', 'Lakshmi', 'Kavya', 'Sneha', 'Anusha', 'Divya', 'Swathi', 'Sravani',
  'Meghana', 'Ramya', 'Sindhu', 'Keerthi', 'Pooja', 'Shreya', 'Madhuri', 'Aishwarya',
  'Nisha', 'Deepika', 'Ritu', 'Anjali', 'Sandhya', 'Vidya', 'Jyothi', 'Supriya',
  'Radha', 'Sarika', 'Manasa', 'Chandana', 'Harika', 'Sushma', 'Latha', 'Shilpa',
  'Uma', 'Revathi', 'Sowmya', 'Mounika', 'Pavani', 'Sirisha', 'Akhila', 'Srujana',
  'Bhavana', 'Chandrika', 'Dhanusha', 'Eshwari', 'Gayathri', 'Hemalatha', 'Indira', 'Jahnavi',
  'Kavitha', 'Lalitha', 'Mamatha', 'Nalini', 'Padmaja', 'Rajeswari', 'Satyavathi', 'Tulasi',
  'Usha', 'Vasundhara', 'Yamuna', 'Zareena', 'Aparna', 'Bindu', 'Chitra', 'Deepthi',
];

const LAST_NAMES = [
  'Rao', 'Reddy', 'Naidu', 'Kumar', 'Sharma', 'Prasad', 'Murthy', 'Krishna',
  'Raju', 'Swamy', 'Iyer', 'Nair', 'Menon', 'Nayak', 'Patel', 'Singh',
  'Varma', 'Devi', 'Acharya', 'Bhatt', 'Chowdary', 'Das', 'Gandhi', 'Gopal',
  'Gupta', 'Joshi', 'Kapoor', 'Malhotra', 'Mehta', 'Mittal', 'Pandey', 'Patnaik',
  'Rathore', 'Saxena', 'Seth', 'Shah', 'Shukla', 'Sinha', 'Tiwari', 'Trivedi',
  'Venkatesh', 'Verma', 'Yadav', 'Agarwal', 'Banerjee', 'Basu', 'Bose', 'Chakraborty',
  'Chatterjee', 'Datta', 'Ganguly', 'Ghosh', 'Jain', 'Kapoor', 'Khanna', 'Malhotra',
  'Mukherjee', 'Nath', 'Pillai', 'Ramachandran', 'Raman', 'Subramanian', 'Sundaram', 'Venkataraman',
];

// Generate realistic user names
const generateUserName = (index: number, role: Role): string => {
  if (index < MANUAL_VALIDATION_NAMES.length) {
    const user = MANUAL_VALIDATION_NAMES[index];
    return `${user.firstName} ${user.lastName}`;
  }
  
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  return `${firstName} ${lastName}`;
};

// Create user in Clerk (optional)
const createClerkUser = async (phoneNumber: string, firstName: string, lastName: string): Promise<boolean> => {
  if (!clerkClient || !process.env.CLERK_SECRET_KEY) {
    return false;
  }

  try {
    await clerkClient.users.createUser({
      phoneNumbers: [phoneNumber],
      firstName,
      lastName,
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
    return true;
  } catch (error: any) {
    console.error(`   ⚠️  Clerk user creation failed for ${phoneNumber}: ${error.message}`);
    if (error.errors) {
      console.error(`      Errors: ${JSON.stringify(error.errors)}`);
    }
    return false;
  }
};

// Generate master data
const generateMasterData = () => {
  console.log('📊 Generating master data structures...\n');

  // Durations
  const durations = [
    { duration: 0, type: 'day' },
    { duration: 1, type: 'month' },
    { duration: 2, type: 'month' },
    { duration: 3, type: 'month' },
    { duration: 6, type: 'month' },
    { duration: 1, type: 'year' },
    { duration: 2, type: 'year' },
    { duration: 4, type: 'year' },
    { duration: 5, type: 'year' },
    { duration: 10, type: 'year' },
  ];

  // Vaccines
  const vaccines = [
    'BCG', 'Hepatitis B', 'DPT', 'Polio', 'Hib', 'Rotavirus',
    'Pneumococcal Conjugate', 'MMR', 'Varicella', 'Hepatitis A',
    'Meningococcal', 'HPV', 'Influenza', 'COVID-19', 'Typhoid',
    'Cholera', 'Yellow Fever', 'Rabies', 'Japanese Encephalitis', 'Tetanus Toxoid',
  ];

  // Samples
  const samples = [
    { name: 'Blood', description: 'Whole blood sample', validity: { value: 7, unit: 'day' }, isActive: true },
    { name: 'Serum', description: 'Blood serum sample', validity: { value: 7, unit: 'day' }, isActive: true },
    { name: 'Plasma', description: 'Blood plasma sample', validity: { value: 7, unit: 'day' }, isActive: true },
    { name: 'Urine', description: 'Urine sample', validity: { value: 2, unit: 'day' }, isActive: true },
    { name: 'Stool', description: 'Stool sample', validity: { value: 1, unit: 'day' }, isActive: true },
    { name: 'Sputum', description: 'Sputum sample', validity: { value: 1, unit: 'day' }, isActive: true },
    { name: 'Saliva', description: 'Saliva sample', validity: { value: 1, unit: 'day' }, isActive: true },
    { name: 'Tissue', description: 'Tissue biopsy sample', validity: { value: 30, unit: 'day' }, isActive: true },
    { name: 'CSF', description: 'Cerebrospinal fluid', validity: { value: 1, unit: 'day' }, isActive: true },
    { name: 'Swab', description: 'Nasal/throat swab', validity: { value: 1, unit: 'day' }, isActive: true },
  ];

  // Parameter names
  const parameterNames = [
    'Hemoglobin', 'RBC Count', 'WBC Count', 'Platelet Count', 'Hematocrit',
    'MCV', 'MCH', 'MCHC', 'ESR', 'Blood Glucose (Fasting)',
    'Blood Glucose (Post Prandial)', 'HbA1c', 'Total Cholesterol', 'HDL Cholesterol',
    'LDL Cholesterol', 'Triglycerides', 'Creatinine', 'Urea', 'Uric Acid',
    'Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT (AST)',
    'SGPT (ALT)', 'ALP', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio',
    'TSH', 'T3', 'T4', 'Vitamin D', 'Vitamin B12', 'Folic Acid', 'Iron',
    'TIBC', 'Ferritin', 'Calcium', 'Phosphorus', 'Magnesium', 'Sodium',
    'Potassium', 'Chloride', 'CRP', 'Procalcitonin', 'D-Dimer', 'PT/INR',
    'APTT', 'PSA', 'CEA', 'CA 125', 'CA 19-9', 'AFP', 'HCG', 'Prolactin',
  ];

  // Generate parameters with realistic bio ref ranges
  const parameters = parameterNames.map((name, index) => {
    const ageRangeTypes = ['pediatric', 'adult', 'senior'] as const;
    const genderTypes = ['male', 'female', 'other'] as const;
    
    // Realistic ranges based on parameter type
    const getBaseRange = () => {
      if (name.toLowerCase().includes('hemoglobin')) return { min: 12, max: 18, unit: 'g/dL' };
      if (name.toLowerCase().includes('glucose')) return { min: 70, max: 100, unit: 'mg/dL' };
      if (name.toLowerCase().includes('cholesterol')) return { min: 0, max: 200, unit: 'mg/dL' };
      if (name.toLowerCase().includes('creatinine')) return { min: 0.6, max: 1.2, unit: 'mg/dL' };
      return { min: 10, max: 100, unit: index % 3 === 0 ? 'g/dL' : index % 3 === 1 ? 'mg/dL' : 'U/L' };
    };

    const baseRange = getBaseRange();
    
    return {
      parameter: name,
      description: `Laboratory parameter for ${name.toLowerCase()} measurement`,
      unit: baseRange.unit,
      alias: [name.toLowerCase(), name.replace(/\s+/g, '')],
      isActive: true,
      remedy: `Consult your physician if ${name} levels are outside normal range`,
      bioRef: {
        basicRange: {
          min: baseRange.min,
          max: baseRange.max,
          unit: baseRange.unit,
        },
        advanceRange: {
          ageRange: ageRangeTypes.map(ageType => ({
            ageRangeType: ageType,
            unit: baseRange.unit,
            min: baseRange.min * (ageType === 'pediatric' ? 0.8 : ageType === 'senior' ? 0.9 : 1),
            max: baseRange.max * (ageType === 'pediatric' ? 0.9 : ageType === 'senior' ? 1.1 : 1),
          })),
          genderRange: genderTypes.map(genderType => ({
            genderRangeType: genderType,
            unit: baseRange.unit,
            min: baseRange.min,
            max: baseRange.max,
            details: {
              prePuberty: false,
              menopause: genderType === 'female' && Math.random() > 0.5,
              pregnant: false,
              trimester: 'none' as const,
            },
          })),
        },
      },
    };
  });

  // Diagnosed Conditions (50 total)
  const conditions = [
    { name: 'Anemia', description: 'Low red blood cell count', aliases: ['Low Hemoglobin', 'Iron Deficiency'], status: true },
    { name: 'Diabetes Type 2', description: 'High blood sugar levels', aliases: ['Type 2 DM', 'T2DM'], status: true },
    { name: 'Hypertension', description: 'High blood pressure', aliases: ['High BP', 'HTN'], status: true },
    { name: 'Hyperlipidemia', description: 'High cholesterol levels', aliases: ['High Cholesterol', 'Dyslipidemia'], status: true },
    { name: 'Hypothyroidism', description: 'Underactive thyroid', aliases: ['Low Thyroid', 'Hashimoto'], status: true },
    { name: 'Hyperthyroidism', description: 'Overactive thyroid', aliases: ['Graves Disease', 'High Thyroid'], status: true },
    { name: 'Kidney Disease', description: 'Impaired kidney function', aliases: ['CKD', 'Renal Failure'], status: true },
    { name: 'Liver Disease', description: 'Liver function abnormalities', aliases: ['Hepatitis', 'Cirrhosis'], status: true },
    { name: 'Vitamin D Deficiency', description: 'Low vitamin D levels', aliases: ['Low Vit D', 'Rickets'], status: true },
    { name: 'Vitamin B12 Deficiency', description: 'Low B12 levels', aliases: ['Pernicious Anemia', 'Low B12'], status: true },
    { name: 'Iron Deficiency', description: 'Low iron levels', aliases: ['Iron Deficiency Anemia', 'Low Iron'], status: true },
    { name: 'Osteoporosis', description: 'Weak bones', aliases: ['Bone Loss', 'Low Bone Density'], status: true },
    { name: 'Obesity', description: 'Excessive body weight', aliases: ['Overweight', 'BMI High'], status: true },
    { name: 'Metabolic Syndrome', description: 'Cluster of conditions', aliases: ['MetS', 'Syndrome X'], status: true },
    { name: 'Inflammatory Disease', description: 'Chronic inflammation', aliases: ['CRP High', 'Inflammation'], status: true },
    { name: 'Diabetes Type 1', description: 'Autoimmune diabetes', aliases: ['Type 1 DM', 'T1DM'], status: true },
    { name: 'Asthma', description: 'Chronic respiratory condition', aliases: ['Bronchial Asthma', 'Respiratory Disease'], status: true },
    { name: 'COPD', description: 'Chronic obstructive pulmonary disease', aliases: ['Chronic Bronchitis', 'Emphysema'], status: true },
    { name: 'Arthritis', description: 'Joint inflammation', aliases: ['Rheumatoid Arthritis', 'Joint Disease'], status: true },
    { name: 'Osteoarthritis', description: 'Degenerative joint disease', aliases: ['Joint Degeneration', 'OA'], status: true },
    { name: 'Gout', description: 'Uric acid crystal deposition', aliases: ['Gouty Arthritis', 'Hyperuricemia'], status: true },
    { name: 'Migraine', description: 'Recurrent headache disorder', aliases: ['Migraine Headache', 'Vascular Headache'], status: true },
    { name: 'Fibromyalgia', description: 'Chronic pain condition', aliases: ['Fibromyalgia Syndrome', 'Chronic Pain'], status: true },
    { name: 'Depression', description: 'Mood disorder', aliases: ['Major Depression', 'MDD'], status: true },
    { name: 'Anxiety Disorder', description: 'Excessive worry condition', aliases: ['Generalized Anxiety', 'GAD'], status: true },
    { name: 'Insomnia', description: 'Sleep disorder', aliases: ['Sleep Disorder', 'Sleeplessness'], status: true },
    { name: 'GERD', description: 'Gastroesophageal reflux disease', aliases: ['Acid Reflux', 'Heartburn'], status: true },
    { name: 'IBS', description: 'Irritable bowel syndrome', aliases: ['Irritable Bowel', 'Spastic Colon'], status: true },
    { name: 'Ulcerative Colitis', description: 'Inflammatory bowel disease', aliases: ['UC', 'Colitis'], status: true },
    { name: 'Crohn\'s Disease', description: 'Inflammatory bowel disease', aliases: ['Crohns', 'IBD'], status: true },
    { name: 'Psoriasis', description: 'Chronic skin condition', aliases: ['Plaque Psoriasis', 'Skin Disease'], status: true },
    { name: 'Eczema', description: 'Atopic dermatitis', aliases: ['Atopic Eczema', 'Dermatitis'], status: true },
    { name: 'Acne', description: 'Skin condition', aliases: ['Acne Vulgaris', 'Pimples'], status: true },
    { name: 'Urticaria', description: 'Hives', aliases: ['Hives', 'Nettle Rash'], status: true },
    { name: 'Sinusitis', description: 'Sinus inflammation', aliases: ['Sinus Infection', 'Rhinosinusitis'], status: true },
    { name: 'Bronchitis', description: 'Bronchial inflammation', aliases: ['Acute Bronchitis', 'Chest Infection'], status: true },
    { name: 'Pneumonia', description: 'Lung infection', aliases: ['Lung Infection', 'Pneumonitis'], status: true },
    { name: 'Tuberculosis', description: 'Bacterial lung infection', aliases: ['TB', 'Mycobacterium'], status: true },
    { name: 'Malaria', description: 'Parasitic infection', aliases: ['Plasmodium', 'Malaria Fever'], status: true },
    { name: 'Dengue Fever', description: 'Viral infection', aliases: ['Dengue', 'Breakbone Fever'], status: true },
    { name: 'Typhoid', description: 'Bacterial infection', aliases: ['Enteric Fever', 'Salmonella'], status: true },
    { name: 'Hepatitis A', description: 'Viral liver infection', aliases: ['HAV', 'Hep A'], status: true },
    { name: 'Hepatitis B', description: 'Viral liver infection', aliases: ['HBV', 'Hep B'], status: true },
    { name: 'Hepatitis C', description: 'Viral liver infection', aliases: ['HCV', 'Hep C'], status: true },
    { name: 'HIV/AIDS', description: 'Immune system infection', aliases: ['HIV', 'AIDS'], status: true },
    { name: 'UTI', description: 'Urinary tract infection', aliases: ['Urinary Infection', 'Cystitis'], status: true },
    { name: 'Kidney Stones', description: 'Renal calculi', aliases: ['Nephrolithiasis', 'Renal Stones'], status: true },
    { name: 'Prostatitis', description: 'Prostate inflammation', aliases: ['Prostate Infection', 'Prostate Disease'], status: true },
    { name: 'PCOS', description: 'Polycystic ovary syndrome', aliases: ['PCOS', 'Polycystic Ovaries'], status: true },
    { name: 'Endometriosis', description: 'Uterine tissue disorder', aliases: ['Endo', 'Adenomyosis'], status: true },
    { name: 'Osteomalacia', description: 'Bone softening', aliases: ['Rickets', 'Bone Softening'], status: true },
  ];

  // Test names (50 total - Reports)
  const testNames = [
    'Complete Blood Count (CBC)',
    'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)',
    'Lipid Profile',
    'Thyroid Function Test (TFT)',
    'Diabetes Panel',
    'Vitamin Panel',
    'Iron Studies',
    'Coagulation Profile',
    'Cardiac Markers',
    'Tumor Markers',
    'Hormone Panel',
    'Inflammatory Markers',
    'Electrolyte Panel',
    'Blood Group & Rh',
    'Hemoglobin A1c',
    'Fasting Blood Glucose',
    'Post Prandial Glucose',
    'Comprehensive Metabolic Panel',
    'Basic Metabolic Panel',
    'Liver Panel Extended',
    'Renal Panel',
    'Lipid Panel Advanced',
    'Thyroid Profile Complete',
    'Vitamin D Test',
    'Vitamin B12 & Folate',
    'Complete Iron Profile',
    'Calcium & Phosphorus',
    'Magnesium Level',
    'Sodium & Potassium',
    'C-Reactive Protein (CRP)',
    'Procalcitonin Test',
    'D-Dimer Test',
    'Prothrombin Time (PT/INR)',
    'Partial Thromboplastin Time (APTT)',
    'Prostate Specific Antigen (PSA)',
    'Carcinoembryonic Antigen (CEA)',
    'CA 125 Test',
    'CA 19-9 Test',
    'Alpha-Fetoprotein (AFP)',
    'Beta HCG Test',
    'Prolactin Level',
    'Cortisol Test',
    'Testosterone Test',
    'Estrogen Test',
    'Growth Hormone Test',
    'Insulin Level',
    'C-Peptide Test',
    'Hb Electrophoresis',
    'Sickle Cell Test',
    'Thalassemia Screening',
  ];

  return {
    durations,
    vaccines,
    samples,
    parameters,
    conditions,
    testNames,
  };
};

// Main data generation function
const generateData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${mongoURI.substring(0, 20)}...`);
    
    // Connect using same method as existing scripts
    await mongoose.connect(mongoURI);
    
    // Wait for connection to be fully ready
    while (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Verify connection is actually working
    await mongoose.connection.db.admin().ping();
    console.log('✅ Connected to MongoDB (verified with ping)\n');
    
    // Import models after connection (like existing scripts do)
    console.log('📦 Loading models...');
    const adminModelsPath = path.join(__dirname, '../../omeraldAdmin/src/api/models');
    User = (await import(path.join(adminModelsPath, 'User.ts'))).default;
    Report = (await import(path.join(adminModelsPath, 'reports/report.ts'))).default;
    Parameter = (await import(path.join(adminModelsPath, 'reports/parameter.ts'))).default;
    Sample = (await import(path.join(adminModelsPath, 'reports/sample.ts'))).default;
    DiagnosedCondition = (await import(path.join(adminModelsPath, 'diagnosedCondition.ts'))).default;
    Vaccine = (await import(path.join(adminModelsPath, 'vaccine/vaccine.ts'))).default;
    Dose = (await import(path.join(adminModelsPath, 'vaccine/dose.ts'))).default;
    Duration = (await import(path.join(adminModelsPath, 'vaccine/duration.ts'))).default;
    Activity = (await import(path.join(adminModelsPath, 'Activity.ts'))).default;
    UserSetting = (await import(path.join(adminModelsPath, 'userSetting.ts'))).default;
    DiagnosticSetting = (await import(path.join(adminModelsPath, 'diagnosticSetting.ts'))).default;
    console.log('✅ Models loaded\n');

    // Get database reference for native operations
    const db = mongoose.connection.db;

    const masterData = generateMasterData();

    // Clear existing test data using native driver
    console.log('🧹 Cleaning up existing test data...');
    try {
      const deleteResults = await Promise.all([
        db.collection('users').deleteMany({ phoneNumber: { $regex: /^\+1555555(010[1-9]|0110)$/ } }),
        db.collection('activities').deleteMany({}),
        db.collection('reports').deleteMany({}),
        db.collection('parameters').deleteMany({}),
        db.collection('samples').deleteMany({}),
        db.collection('diagnosedconditions').deleteMany({}),
        db.collection('vaccines').deleteMany({}),
        db.collection('doses').deleteMany({}),
        db.collection('dosedurations').deleteMany({}),
      ]);
      const totalDeleted = deleteResults.reduce((sum, r) => sum + (r.deletedCount || 0), 0);
      console.log(`✅ Cleanup complete (deleted ${totalDeleted} documents)\n`);
    } catch (error: any) {
      console.log(`   ⚠️  Cleanup warning: ${error.message}`);
      console.log('   Continuing with data generation...\n');
    }

    // 1. Insert Durations
    console.log('📝 Inserting Durations...');
    let insertedDurations: any[];
    try {
      const durationsCollection = db.collection('dosedurations');
      const result = await durationsCollection.insertMany(masterData.durations, { ordered: false });
      console.log(`✅ Inserted ${result.insertedCount} durations\n`);
      // Create documents from inserted IDs for later use
      insertedDurations = masterData.durations.map((d, i) => ({
        _id: result.insertedIds[i] || new mongoose.Types.ObjectId(),
        ...d,
      }));
    } catch (error: any) {
      // If duplicates exist, fetch existing ones
      if (error.code === 11000 || error.writeErrors) {
        console.log(`   Some durations already exist, fetching existing...`);
        const existing = await db.collection('dosedurations').find({}).toArray();
        insertedDurations = existing;
        console.log(`✅ Using ${insertedDurations.length} existing durations\n`);
      } else {
        throw error;
      }
    }

    // 2. Insert Vaccines
    console.log('💉 Inserting Vaccines...');
    const vaccineDocs = masterData.vaccines.map(name => ({ name }));
    const vaccinesResult = await db.collection('vaccines').insertMany(vaccineDocs, { ordered: false });
    const insertedVaccines = vaccineDocs.map((v, i) => ({
      _id: vaccinesResult.insertedIds[i],
      ...v,
    }));
    console.log(`✅ Inserted ${insertedVaccines.length} vaccines\n`);

    // 3. Insert Doses (20 total)
    console.log('💊 Inserting Doses...');
    const doseTypes = ['Recommended', 'Catch-up', 'Special situations'];
    const doses = [];
    // Generate only 20 doses total (distributed across vaccines)
    const dosesPerVaccine = Math.floor(20 / insertedVaccines.length);
    const remainingDoses = 20 % insertedVaccines.length;
    
    for (let vIdx = 0; vIdx < insertedVaccines.length && doses.length < 20; vIdx++) {
      const vaccine = insertedVaccines[vIdx];
      const doseCountForThisVaccine = dosesPerVaccine + (vIdx < remainingDoses ? 1 : 0);
      
      for (let i = 0; i < doseCountForThisVaccine && doses.length < 20; i++) {
        const duration = randomElement(insertedDurations);
        doses.push({
          name: `${vaccine.name} - Dose ${i + 1}`,
          vaccine: vaccine._id,
          doseDuration: duration._id,
          doseType: doseTypes[i % doseTypes.length],
        });
      }
    }
    
    const dosesResult = await db.collection('doses').insertMany(doses, { ordered: false });
    const insertedDoses = doses.map((d, i) => ({
      _id: dosesResult.insertedIds[i],
      ...d,
    }));
    console.log(`✅ Inserted ${insertedDoses.length} doses\n`);

    // 4. Insert Samples
    console.log('🧪 Inserting Samples...');
    const samplesResult = await db.collection('samples').insertMany(masterData.samples, { ordered: false });
    const insertedSamples = masterData.samples.map((s, i) => ({
      _id: samplesResult.insertedIds[i],
      ...s,
    }));
    console.log(`✅ Inserted ${insertedSamples.length} samples\n`);

    // 5. Insert Parameters
    console.log('📊 Inserting Parameters...');
    const parametersResult = await db.collection('parameters').insertMany(masterData.parameters, { ordered: false });
    const insertedParameters = masterData.parameters.map((p, i) => ({
      _id: parametersResult.insertedIds[i],
      ...p,
    }));
    console.log(`✅ Inserted ${insertedParameters.length} parameters\n`);

    // 6. Insert Diagnosed Conditions
    console.log('🏥 Inserting Diagnosed Conditions...');
    const conditionsWithParams = masterData.conditions.map(condition => ({
      ...condition,
      params: randomElements(
        insertedParameters.map(p => p._id.toString()),
        Math.floor(Math.random() * 5) + 1
      ),
    }));
    const conditionsResult = await db.collection('diagnosedconditions').insertMany(conditionsWithParams, { ordered: false });
    const insertedConditions = conditionsWithParams.map((c, i) => ({
      _id: conditionsResult.insertedIds[i],
      ...c,
    }));
    console.log(`✅ Inserted ${insertedConditions.length} diagnosed conditions\n`);

    // 7. Insert Reports
    console.log('📄 Inserting Reports (with backdated dates)...');
    const reports = [];
    for (let i = 0; i < masterData.testNames.length; i++) {
      const testName = masterData.testNames[i];
      const sample = randomElement(insertedSamples);
      const paramCount = Math.floor(Math.random() * 10) + 5;
      const selectedParams = randomElements(insertedParameters, paramCount);

      const reportParams = selectedParams.map(param => ({
        name: param.parameter,
        subText: `Sub-parameter for ${param.parameter}`,
        adminParamId: param._id.toString(),
        description: param.description,
        aliases: param.alias,
        units: param.unit,
        bioRefRange: param.bioRef,
        remedy: [param.remedy || 'Consult physician'],
        isActive: true,
        diagnosedConditions: {},
      }));

      const createdAt = randomDate(START_DATE, new Date());
      const updatedAt = randomDate(createdAt, new Date());

      reports.push({
        testName,
        sampleName: sample.name,
        parameters: reportParams,
        isActive: true,
        components: [
          {
            title: 'Test Overview',
            content: `Overview of ${testName}`,
            isDynamic: false,
            images: [],
          },
          {
            title: 'Interpretation',
            content: `How to interpret ${testName} results`,
            isDynamic: true,
            images: [],
          },
        ],
        createdAt,
        updatedAt,
      });
    }
    const reportsResult = await db.collection('reports').insertMany(reports, { ordered: false });
    const insertedReports = reports.map((r, i) => ({
      _id: reportsResult.insertedIds[i],
      ...r,
    }));
    console.log(`✅ Inserted ${insertedReports.length} reports\n`);

    // 8. Generate and insert Users
    console.log('👥 Creating Users (with backdated creation dates)...');
    const users = [];
    const clerkUsersCreated = [];
    const clerkUsersFailed = [];

    // Generate user creation dates (more recent = more users)
    const userDates: Date[] = [];
    const now = new Date();
    for (let i = 0; i < TOTAL_USERS; i++) {
      // Exponential distribution favoring recent dates
      const monthsAgo = Math.pow(Math.random(), 1.5) * 12;
      const date = new Date(now);
      date.setMonth(date.getMonth() - monthsAgo);
      userDates.push(date);
    }
    userDates.sort((a, b) => a.getTime() - b.getTime());

    // Generate users based on MANUAL_VALIDATION_NAMES (ensures all role combinations)
    for (let userIndex = 0; userIndex < TOTAL_USERS; userIndex++) {
      const userInfo = MANUAL_VALIDATION_NAMES[userIndex];
      const phoneNum = PHONE_START + userIndex;
      const phoneNumber = formatPhoneNumber(phoneNum);
      const userName = `${userInfo.firstName} ${userInfo.lastName}`;
      const { firstName, lastName } = userInfo;
      const createdAt = userDates[userIndex];
      const role = userInfo.role;

      // Create user in database using native driver
      const userDoc = {
        role,
        userName,
        phoneNumber,
        createdAt,
        deletedAt: null,
      };
      const userResult = await db.collection('users').insertOne(userDoc);
      const user = {
        _id: userResult.insertedId,
        ...userDoc,
      };
      users.push(user);

      // Optionally create in Clerk
      // if (clerkClient) {
      //   const created = await createClerkUser(phoneNumber, firstName, lastName);
      //   if (created) {
      //     clerkUsersCreated.push({ phoneNumber, userName });
      //   } else {
      //     clerkUsersFailed.push({ phoneNumber, userName });
      //   }
      // }
    }

    console.log(`✅ Created ${users.length} users\n`);
    if (clerkUsersCreated.length > 0) {
      console.log(`   ✅ ${clerkUsersCreated.length} users created in Clerk`);
    }
    if (clerkUsersFailed.length > 0) {
      console.log(`   ⚠️  ${clerkUsersFailed.length} users failed Clerk creation (see logs above)`);
    }
    console.log(`   📅 User creation dates range from ${userDates[0].toISOString().split('T')[0]} to ${userDates[userDates.length - 1].toISOString().split('T')[0]}\n`);

    // 9. Generate Activities (aligned with entity dates)
    console.log('📋 Generating Activities (with backdated timestamps)...');
    const activities = [];
    const activityTitles = [
      'User Created', 'Report Added', 'Parameter Updated', 'Vaccine Added',
      'Diagnosed Condition Created', 'Sample Added', 'Settings Updated',
      'User Updated', 'Report Deleted', 'Parameter Added',
    ];
    const actionTypes = ['added', 'updated', 'deleted'] as const;

    // Generate activities for users
    for (const user of users) {
      const activityCount = Math.floor(Math.random() * 15) + 5; // 5-20 activities per user
      for (let i = 0; i < activityCount; i++) {
        const title = randomElement(activityTitles);
        // Activity timestamp should be after user creation
        const timeStamp = randomDate(user.createdAt!, new Date());
        
        activities.push({
          title,
          description: `${title} - by ${user.userName}`,
          user: {
            _id: user._id,
            userName: user.userName,
            phoneNumber: user.phoneNumber,
          },
          timeStamp,
          action: randomElement(actionTypes),
        });
      }
    }

    // Generate activities for reports
    for (const report of insertedReports) {
      const user = randomElement(users);
      if (report.createdAt && report.createdAt >= user.createdAt!) {
        activities.push({
          title: 'Report Added',
          description: `Report "${report.testName}" was added`,
          user: {
            _id: user._id,
            userName: user.userName,
            phoneNumber: user.phoneNumber,
          },
          timeStamp: report.createdAt,
          action: 'added' as const,
        });
      }
    }

    activities.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());
    const activitiesResult = await db.collection('activities').insertMany(activities);
    const insertedActivities = activities.map((a, i) => ({
      _id: activitiesResult.insertedIds[i],
      ...a,
    }));
    console.log(`✅ Inserted ${insertedActivities.length} activities\n`);

    // 10. Insert Settings
    console.log('⚙️  Inserting Settings...');
    await db.collection('usersettings').insertOne({
      FAQs: 'Frequently Asked Questions about the Omerald platform...',
      Privacy_Policy: 'Privacy Policy content...',
      Terms_Of_Service: 'Terms of Service content...',
      Platform_Consent: 'Platform Consent information...',
      Disclaimer: 'Medical Disclaimer...',
      Customer_Support: 'support@omerald.com',
    });
    await db.collection('diagnosticsettings').insertOne({
      FAQs: 'Diagnostic Center FAQs...',
      Privacy_Policy: 'Diagnostic Privacy Policy...',
      Terms_Of_Service: 'Diagnostic Terms of Service...',
      Platform_Consent: 'Diagnostic Platform Consent...',
      Disclaimer: 'Diagnostic Medical Disclaimer...',
      Customer_Support: 'diagnostic@omerald.com',
      Ad_Banner: [{
        title: 'Promotional Banner 1',
        url: 'https://example.com/banner1.jpg',
        alt: 'Promotional Banner',
        updatedAt: new Date(),
      }],
      Customer_Logo: [{
        title: 'Customer Logo 1',
        url: 'https://example.com/logo1.png',
        alt: 'Customer Logo',
        updatedAt: new Date(),
      }],
      Additional: {
        getStartedUrl: 'https://omerald.com/get-started',
        demoVideoUrl: 'https://omerald.com/demo-video',
      },
      Testimonials: [{
        name: 'Dr. John Doe',
        comment: 'Excellent platform for managing diagnostic reports.',
        rating: 5,
        updatedAt: new Date(),
      }],
    });
    console.log('✅ Inserted settings\n');

    // Summary
    console.log('🎉 Data generation completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Durations: ${insertedDurations.length}`);
    console.log(`   - Vaccines: ${insertedVaccines.length}`);
    console.log(`   - Doses: ${insertedDoses.length}`);
    console.log(`   - Samples: ${insertedSamples.length}`);
    console.log(`   - Parameters: ${insertedParameters.length}`);
    console.log(`   - Diagnosed Conditions: ${insertedConditions.length}`);
    console.log(`   - Reports: ${insertedReports.length}`);
    // Count users by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const roleSummary = ROLES.map(role => `${roleCounts[role] || 0} ${role}`).join(', ');
    console.log(`   - Users: ${users.length} (${roleSummary})`);
    console.log(`   - Activities: ${insertedActivities.length}`);
    console.log(`   - Settings: 2 (User & Diagnostic)\n`);

    console.log('📋 Manual Validation Users (first 10):');
    for (let i = 0; i < Math.min(10, users.length); i++) {
      const user = users[i];
      console.log(`   ${i + 1}. ${user.userName} (${user.role}) - ${user.phoneNumber}`);
    }

    console.log(`\n📅 Data range: ${START_DATE.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`);
    const phoneStartFormatted = formatPhoneNumber(PHONE_START).replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    const phoneEndFormatted = formatPhoneNumber(PHONE_END).replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    console.log(`\n💡 Note: Phone numbers range from ${phoneStartFormatted} to ${phoneEndFormatted}`);
    console.log(`   (Stored as: ${formatPhoneNumber(PHONE_START)} to ${formatPhoneNumber(PHONE_END)})`);

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

export { generateData };


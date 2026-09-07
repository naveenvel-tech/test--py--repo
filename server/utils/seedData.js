const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const ClinicalExchange = require('../models/ClinicalExchange');
const Provider = require('../models/Provider');
const AuditLog = require('../models/AuditLog');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      ClinicalExchange.deleteMany({}),
      Provider.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Providers
    const providers = await Provider.create([
      {
        name: 'MedConnect General Hospital',
        type: 'hospital',
        address: { street: '123 Healthcare Blvd', city: 'Metro City', state: 'CA', zip: '90210' },
        phone: '(555) 100-2000',
        email: 'info@medconnect-hospital.com',
        website: 'https://medconnect-hospital.com',
        specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery'],
        operatingHours: { weekdays: '00:00 - 23:59', saturday: '00:00 - 23:59', sunday: '00:00 - 23:59' },
        staffCount: 150,
        description: 'A leading multi-specialty hospital providing comprehensive healthcare services.',
      },
      {
        name: 'Sunrise Family Clinic',
        type: 'clinic',
        address: { street: '456 Wellness Ave', city: 'Metro City', state: 'CA', zip: '90211' },
        phone: '(555) 200-3000',
        email: 'contact@sunrise-clinic.com',
        website: 'https://sunrise-clinic.com',
        specialties: ['Family Medicine', 'Internal Medicine', 'Dermatology'],
        operatingHours: { weekdays: '08:00 - 18:00', saturday: '09:00 - 14:00', sunday: 'Closed' },
        staffCount: 25,
        description: 'A community-focused clinic offering primary care and specialty services.',
      },
      {
        name: 'Precision Diagnostics Lab',
        type: 'lab',
        address: { street: '789 Science Park', city: 'Metro City', state: 'CA', zip: '90212' },
        phone: '(555) 300-4000',
        email: 'labs@precision-dx.com',
        website: 'https://precision-dx.com',
        specialties: ['Pathology', 'Radiology', 'Molecular Diagnostics'],
        operatingHours: { weekdays: '06:00 - 20:00', saturday: '07:00 - 16:00', sunday: '08:00 - 12:00' },
        staffCount: 40,
        description: 'State-of-the-art diagnostic laboratory with rapid turnaround times.',
      },
      {
        name: 'CarePlus Pharmacy',
        type: 'pharmacy',
        address: { street: '321 Main Street', city: 'Metro City', state: 'CA', zip: '90213' },
        phone: '(555) 400-5000',
        email: 'rx@careplus-pharmacy.com',
        specialties: ['Retail Pharmacy', 'Compounding', 'Specialty Medications'],
        operatingHours: { weekdays: '08:00 - 21:00', saturday: '09:00 - 18:00', sunday: '10:00 - 16:00' },
        staffCount: 12,
        description: 'Full-service pharmacy with personalized medication management.',
      },
    ]);
    console.log('🏥 Created providers');

    // Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@medconnect.com',
        password: 'admin123',
        role: 'admin',
        phone: '(555) 001-0001',
        provider: providers[0]._id,
      },
      {
        name: 'Dr. Sarah Smith',
        email: 'dr.smith@medconnect.com',
        password: 'doctor123',
        role: 'doctor',
        specialization: 'Cardiology',
        phone: '(555) 001-0002',
        provider: providers[0]._id,
      },
      {
        name: 'Dr. James Wilson',
        email: 'dr.wilson@medconnect.com',
        password: 'doctor123',
        role: 'doctor',
        specialization: 'Neurology',
        phone: '(555) 001-0003',
        provider: providers[0]._id,
      },
      {
        name: 'Dr. Emily Chen',
        email: 'dr.chen@medconnect.com',
        password: 'doctor123',
        role: 'doctor',
        specialization: 'Pediatrics',
        phone: '(555) 001-0004',
        provider: providers[1]._id,
      },
      {
        name: 'Nurse Maria Jones',
        email: 'nurse.jones@medconnect.com',
        password: 'nurse123',
        role: 'nurse',
        phone: '(555) 001-0005',
        provider: providers[0]._id,
      },
      {
        name: 'Nurse David Park',
        email: 'nurse.park@medconnect.com',
        password: 'nurse123',
        role: 'nurse',
        phone: '(555) 001-0006',
        provider: providers[1]._id,
      },
      {
        name: 'Lisa Thompson',
        email: 'reception@medconnect.com',
        password: 'reception123',
        role: 'receptionist',
        phone: '(555) 001-0007',
        provider: providers[0]._id,
      },
      {
        name: 'Mike Rodriguez',
        email: 'lab.tech@medconnect.com',
        password: 'labtech123',
        role: 'lab_technician',
        phone: '(555) 001-0008',
        provider: providers[2]._id,
      },
    ]);
    console.log('👤 Created users');

    // Create Patients
    const patientData = [
      {
        mrn: 'MRN-001001',
        firstName: 'John',
        lastName: 'Anderson',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'male',
        bloodGroup: 'A+',
        contactInfo: { phone: '(555) 201-0001', email: 'john.a@email.com', address: { street: '100 Oak St', city: 'Metro City', state: 'CA', zip: '90210' } },
        emergencyContact: { name: 'Mary Anderson', relationship: 'Spouse', phone: '(555) 201-0002' },
        insuranceInfo: { provider: 'BlueCross Shield', policyNumber: 'BC-789456', groupNumber: 'GRP-100', expiryDate: new Date('2027-12-31') },
        allergies: [{ name: 'Penicillin', severity: 'severe' }, { name: 'Peanuts', severity: 'moderate' }],
        medicalHistory: [
          { condition: 'Hypertension', diagnosedDate: new Date('2020-06-15'), status: 'managed', notes: 'Controlled with medication' },
          { condition: 'Type 2 Diabetes', diagnosedDate: new Date('2021-01-10'), status: 'active', notes: 'Metformin 500mg twice daily' },
        ],
        currentMedications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'Dr. Smith', startDate: new Date('2020-06-20') },
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'Dr. Smith', startDate: new Date('2021-01-15') },
        ],
        vitals: { bloodPressure: '130/85', heartRate: 76, temperature: 98.6, weight: 185, height: 71, oxygenSaturation: 97, lastUpdated: new Date() },
        assignedProvider: providers[0]._id,
        assignedDoctor: users[1]._id,
        createdBy: users[0]._id,
      },
      {
        mrn: 'MRN-001002',
        firstName: 'Emma',
        lastName: 'Williams',
        dateOfBirth: new Date('1992-07-22'),
        gender: 'female',
        bloodGroup: 'O-',
        contactInfo: { phone: '(555) 202-0001', email: 'emma.w@email.com', address: { street: '200 Pine Ave', city: 'Metro City', state: 'CA', zip: '90211' } },
        emergencyContact: { name: 'Robert Williams', relationship: 'Father', phone: '(555) 202-0002' },
        insuranceInfo: { provider: 'Aetna Health', policyNumber: 'AH-123789', groupNumber: 'GRP-200', expiryDate: new Date('2027-06-30') },
        allergies: [{ name: 'Sulfa drugs', severity: 'mild' }],
        medicalHistory: [
          { condition: 'Asthma', diagnosedDate: new Date('2005-09-01'), status: 'managed', notes: 'Mild intermittent, uses inhaler PRN' },
        ],
        currentMedications: [
          { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', prescribedBy: 'Dr. Chen', startDate: new Date('2005-09-15') },
        ],
        vitals: { bloodPressure: '118/75', heartRate: 72, temperature: 98.4, weight: 140, height: 65, oxygenSaturation: 99, lastUpdated: new Date() },
        assignedProvider: providers[1]._id,
        assignedDoctor: users[3]._id,
        createdBy: users[0]._id,
      },
      {
        mrn: 'MRN-001003',
        firstName: 'Michael',
        lastName: 'Brown',
        dateOfBirth: new Date('1978-11-30'),
        gender: 'male',
        bloodGroup: 'B+',
        contactInfo: { phone: '(555) 203-0001', email: 'michael.b@email.com', address: { street: '300 Elm Rd', city: 'Metro City', state: 'CA', zip: '90212' } },
        emergencyContact: { name: 'Jennifer Brown', relationship: 'Spouse', phone: '(555) 203-0002' },
        insuranceInfo: { provider: 'UnitedHealth', policyNumber: 'UH-456123', groupNumber: 'GRP-300', expiryDate: new Date('2026-12-31') },
        allergies: [],
        medicalHistory: [
          { condition: 'ACL Tear (Right Knee)', diagnosedDate: new Date('2023-03-01'), status: 'resolved', notes: 'Surgical repair performed, full recovery' },
          { condition: 'High Cholesterol', diagnosedDate: new Date('2022-08-15'), status: 'managed', notes: 'Statin therapy' },
        ],
        currentMedications: [
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', prescribedBy: 'Dr. Wilson', startDate: new Date('2022-09-01') },
        ],
        vitals: { bloodPressure: '125/80', heartRate: 68, temperature: 98.7, weight: 195, height: 73, oxygenSaturation: 98, lastUpdated: new Date() },
        assignedProvider: providers[0]._id,
        assignedDoctor: users[2]._id,
        createdBy: users[0]._id,
      },
      {
        mrn: 'MRN-001004',
        firstName: 'Sophia',
        lastName: 'Garcia',
        dateOfBirth: new Date('2015-04-12'),
        gender: 'female',
        bloodGroup: 'AB+',
        contactInfo: { phone: '(555) 204-0001', email: 'garcia.family@email.com', address: { street: '400 Maple Dr', city: 'Metro City', state: 'CA', zip: '90213' } },
        emergencyContact: { name: 'Carlos Garcia', relationship: 'Father', phone: '(555) 204-0002' },
        insuranceInfo: { provider: 'Cigna', policyNumber: 'CG-321654', groupNumber: 'GRP-400', expiryDate: new Date('2027-03-31') },
        allergies: [{ name: 'Latex', severity: 'moderate' }],
        medicalHistory: [
          { condition: 'Childhood vaccination schedule', diagnosedDate: new Date('2015-04-12'), status: 'active', notes: 'Up to date with all immunizations' },
        ],
        currentMedications: [],
        vitals: { bloodPressure: '95/60', heartRate: 90, temperature: 98.5, weight: 55, height: 48, oxygenSaturation: 99, lastUpdated: new Date() },
        assignedProvider: providers[1]._id,
        assignedDoctor: users[3]._id,
        createdBy: users[6]._id,
      },
      {
        mrn: 'MRN-001005',
        firstName: 'Robert',
        lastName: 'Taylor',
        dateOfBirth: new Date('1960-09-08'),
        gender: 'male',
        bloodGroup: 'O+',
        contactInfo: { phone: '(555) 205-0001', email: 'robert.t@email.com', address: { street: '500 Cedar Lane', city: 'Metro City', state: 'CA', zip: '90210' } },
        emergencyContact: { name: 'Susan Taylor', relationship: 'Spouse', phone: '(555) 205-0002' },
        insuranceInfo: { provider: 'Medicare', policyNumber: 'MC-654987', groupNumber: 'GRP-500', expiryDate: new Date('2028-12-31') },
        allergies: [{ name: 'Aspirin', severity: 'severe' }, { name: 'Iodine', severity: 'mild' }],
        medicalHistory: [
          { condition: 'Coronary Artery Disease', diagnosedDate: new Date('2018-02-14'), status: 'managed', notes: 'Stent placed in LAD, stable angina' },
          { condition: 'Atrial Fibrillation', diagnosedDate: new Date('2019-05-20'), status: 'active', notes: 'Rate controlled with beta-blocker' },
          { condition: 'Osteoarthritis', diagnosedDate: new Date('2021-11-01'), status: 'active', notes: 'Bilateral knees, moderate severity' },
        ],
        currentMedications: [
          { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', prescribedBy: 'Dr. Smith', startDate: new Date('2019-06-01') },
          { name: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', prescribedBy: 'Dr. Smith', startDate: new Date('2018-03-01') },
          { name: 'Apixaban', dosage: '5mg', frequency: 'Twice daily', prescribedBy: 'Dr. Smith', startDate: new Date('2019-06-01') },
        ],
        vitals: { bloodPressure: '138/88', heartRate: 72, temperature: 98.3, weight: 175, height: 69, oxygenSaturation: 95, lastUpdated: new Date() },
        assignedProvider: providers[0]._id,
        assignedDoctor: users[1]._id,
        createdBy: users[0]._id,
      },
      {
        mrn: 'MRN-001006', firstName: 'Olivia', lastName: 'Martinez', dateOfBirth: new Date('1988-12-25'), gender: 'female', bloodGroup: 'A-',
        contactInfo: { phone: '(555) 206-0001', email: 'olivia.m@email.com', address: { street: '600 Birch St', city: 'Metro City', state: 'CA', zip: '90211' } },
        emergencyContact: { name: 'Diego Martinez', relationship: 'Brother', phone: '(555) 206-0002' },
        allergies: [],
        medicalHistory: [{ condition: 'Migraine', diagnosedDate: new Date('2019-03-10'), status: 'managed', notes: 'Triggers: stress, caffeine' }],
        currentMedications: [{ name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', prescribedBy: 'Dr. Wilson', startDate: new Date('2019-04-01') }],
        vitals: { bloodPressure: '115/72', heartRate: 70, temperature: 98.6, weight: 130, height: 63, oxygenSaturation: 99, lastUpdated: new Date() },
        assignedProvider: providers[0]._id, assignedDoctor: users[2]._id, createdBy: users[0]._id,
      },
      {
        mrn: 'MRN-001007', firstName: 'William', lastName: 'Lee', dateOfBirth: new Date('1995-06-18'), gender: 'male', bloodGroup: 'B-',
        contactInfo: { phone: '(555) 207-0001', email: 'will.lee@email.com', address: { street: '700 Walnut Ave', city: 'Metro City', state: 'CA', zip: '90212' } },
        emergencyContact: { name: 'Grace Lee', relationship: 'Mother', phone: '(555) 207-0002' },
        allergies: [{ name: 'Shellfish', severity: 'severe' }],
        medicalHistory: [],
        currentMedications: [],
        vitals: { bloodPressure: '120/78', heartRate: 65, temperature: 98.5, weight: 165, height: 70, oxygenSaturation: 98, lastUpdated: new Date() },
        assignedProvider: providers[1]._id, assignedDoctor: users[3]._id, createdBy: users[6]._id,
      },
      {
        mrn: 'MRN-001008', firstName: 'Isabella', lastName: 'Davis', dateOfBirth: new Date('1970-02-14'), gender: 'female', bloodGroup: 'AB-',
        contactInfo: { phone: '(555) 208-0001', email: 'isabella.d@email.com', address: { street: '800 Spruce Ct', city: 'Metro City', state: 'CA', zip: '90213' } },
        emergencyContact: { name: 'Thomas Davis', relationship: 'Spouse', phone: '(555) 208-0002' },
        allergies: [{ name: 'Codeine', severity: 'moderate' }],
        medicalHistory: [
          { condition: 'Hypothyroidism', diagnosedDate: new Date('2015-07-20'), status: 'managed', notes: 'Levothyroxine replacement' },
          { condition: 'Breast Cancer (Stage I)', diagnosedDate: new Date('2022-04-10'), status: 'resolved', notes: 'Lumpectomy + radiation, in remission' },
        ],
        currentMedications: [
          { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily', prescribedBy: 'Dr. Chen', startDate: new Date('2015-08-01') },
          { name: 'Tamoxifen', dosage: '20mg', frequency: 'Once daily', prescribedBy: 'Dr. Smith', startDate: new Date('2022-07-01') },
        ],
        vitals: { bloodPressure: '128/82', heartRate: 74, temperature: 98.4, weight: 155, height: 66, oxygenSaturation: 97, lastUpdated: new Date() },
        assignedProvider: providers[0]._id, assignedDoctor: users[1]._id, createdBy: users[0]._id,
      },
      {
        mrn: 'MRN-001009', firstName: 'James', lastName: 'Johnson', dateOfBirth: new Date('2000-08-05'), gender: 'male', bloodGroup: 'O+',
        contactInfo: { phone: '(555) 209-0001', email: 'james.j@email.com', address: { street: '900 Ash Blvd', city: 'Metro City', state: 'CA', zip: '90210' } },
        emergencyContact: { name: 'Patricia Johnson', relationship: 'Mother', phone: '(555) 209-0002' },
        allergies: [],
        medicalHistory: [{ condition: 'ADHD', diagnosedDate: new Date('2012-09-01'), status: 'managed', notes: 'Managed with medication and behavioral therapy' }],
        currentMedications: [{ name: 'Adderall', dosage: '20mg', frequency: 'Once daily', prescribedBy: 'Dr. Wilson', startDate: new Date('2018-01-15') }],
        vitals: { bloodPressure: '116/74', heartRate: 78, temperature: 98.6, weight: 170, height: 72, oxygenSaturation: 99, lastUpdated: new Date() },
        assignedProvider: providers[0]._id, assignedDoctor: users[2]._id, createdBy: users[6]._id,
      },
      {
        mrn: 'MRN-001010', firstName: 'Charlotte', lastName: 'Wilson', dateOfBirth: new Date('1982-01-30'), gender: 'female', bloodGroup: 'A+',
        contactInfo: { phone: '(555) 210-0001', email: 'charlotte.w@email.com', address: { street: '1000 Poplar Rd', city: 'Metro City', state: 'CA', zip: '90211' } },
        emergencyContact: { name: 'George Wilson', relationship: 'Spouse', phone: '(555) 210-0002' },
        allergies: [{ name: 'Latex', severity: 'mild' }, { name: 'NSAIDs', severity: 'moderate' }],
        medicalHistory: [
          { condition: 'Rheumatoid Arthritis', diagnosedDate: new Date('2020-03-25'), status: 'active', notes: 'Biologic therapy initiated' },
          { condition: 'Iron Deficiency Anemia', diagnosedDate: new Date('2021-06-10'), status: 'managed', notes: 'Iron supplementation' },
        ],
        currentMedications: [
          { name: 'Adalimumab', dosage: '40mg', frequency: 'Every 2 weeks', prescribedBy: 'Dr. Smith', startDate: new Date('2020-05-01') },
          { name: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Once daily', prescribedBy: 'Dr. Chen', startDate: new Date('2021-07-01') },
        ],
        vitals: { bloodPressure: '122/78', heartRate: 71, temperature: 98.5, weight: 145, height: 64, oxygenSaturation: 98, lastUpdated: new Date() },
        assignedProvider: providers[0]._id, assignedDoctor: users[1]._id, createdBy: users[0]._id,
      },
    ];

    const patients = await Patient.create(patientData);
    console.log(`🧑‍⚕️ Created ${patients.length} patients`);

    // Create Appointments (spread across past week, today, and next week)
    const now = new Date();
    const appointmentData = [];
    const types = ['consultation', 'follow-up', 'procedure', 'lab-test', 'emergency'];
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    const reasons = [
      'Annual physical examination',
      'Follow-up on blood work results',
      'Chest pain evaluation',
      'Medication refill and review',
      'Post-surgical follow-up',
      'Routine blood pressure check',
      'Headache and migraine consultation',
      'Joint pain assessment',
      'Cardiac stress test',
      'Vaccination appointment',
      'Diabetes management review',
      'Pre-operative assessment',
      'Skin lesion evaluation',
      'Mental health check-in',
      'Allergy testing',
    ];

    for (let i = 0; i < 30; i++) {
      const dayOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
      const hour = 8 + Math.floor(Math.random() * 9); // 8am to 5pm
      const apptDate = new Date(now);
      apptDate.setDate(apptDate.getDate() + dayOffset);
      apptDate.setHours(hour, Math.random() > 0.5 ? 0 : 30, 0, 0);

      const isPast = dayOffset < 0;

      appointmentData.push({
        patient: patients[Math.floor(Math.random() * patients.length)]._id,
        doctor: users.filter((u) => u.role === 'doctor')[Math.floor(Math.random() * 3)]._id,
        provider: providers[Math.floor(Math.random() * 2)]._id,
        dateTime: apptDate,
        duration: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
        type: types[Math.floor(Math.random() * types.length)],
        status: isPast
          ? ['completed', 'completed', 'completed', 'no-show', 'cancelled'][Math.floor(Math.random() * 5)]
          : ['scheduled', 'confirmed'][Math.floor(Math.random() * 2)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        notes: isPast ? 'Patient visit completed. Follow-up as needed.' : '',
        roomNumber: `R-${100 + Math.floor(Math.random() * 20)}`,
        createdBy: users[6]._id,
      });
    }

    const appointments = await Appointment.create(appointmentData);
    console.log(`📅 Created ${appointments.length} appointments`);

    // Create Clinical Exchanges
    const exchangeData = [
      {
        patient: patients[0]._id,
        fromProvider: providers[2]._id,
        toProvider: providers[0]._id,
        documentType: 'lab-report',
        subject: 'Comprehensive Metabolic Panel Results',
        content: 'Patient: John Anderson\n\nGlucose: 126 mg/dL (H)\nBUN: 18 mg/dL\nCreatinine: 1.1 mg/dL\nSodium: 140 mEq/L\nPotassium: 4.2 mEq/L\nChloride: 102 mEq/L\nCO2: 24 mEq/L\nCalcium: 9.5 mg/dL\nTotal Protein: 7.2 g/dL\nAlbumin: 4.0 g/dL\nBilirubin: 0.8 mg/dL\nAlkaline Phosphatase: 72 U/L\nAST: 28 U/L\nALT: 32 U/L\n\nNote: Elevated fasting glucose consistent with diabetes management.',
        status: 'reviewed',
        priority: 'routine',
        requestedBy: users[7]._id,
        reviewedBy: users[1]._id,
        sentAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patients[4]._id,
        fromProvider: providers[0]._id,
        toProvider: providers[2]._id,
        documentType: 'referral',
        subject: 'Cardiac Stress Test Referral',
        content: 'Referring Dr. Sarah Smith requests a cardiac stress test for patient Robert Taylor.\n\nClinical Indication: Known CAD with recent increase in exertional chest discomfort.\nCurrent Medications: Metoprolol 50mg BID, Clopidogrel 75mg daily, Apixaban 5mg BID.\nNote: Please hold beta-blocker 24 hours before the test.\n\nPlease schedule and report findings.',
        status: 'received',
        priority: 'urgent',
        requestedBy: users[1]._id,
        sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patients[7]._id,
        fromProvider: providers[0]._id,
        toProvider: providers[1]._id,
        documentType: 'discharge-summary',
        subject: 'Post-Lumpectomy Discharge Summary',
        content: 'Patient: Isabella Davis\nProcedure: Left breast lumpectomy with sentinel lymph node biopsy\nDate: 2022-04-15\n\nFindings: 1.8cm invasive ductal carcinoma, Grade 2. Sentinel node negative (0/3).\nMargins: Clear (>5mm all margins).\n\nDischarge Instructions:\n- Wound care: Keep dry for 48 hours\n- Follow-up with oncology in 2 weeks\n- Begin radiation therapy as per oncology recommendation\n- Continue Tamoxifen 20mg daily\n\nPrognosis: Excellent with adjuvant therapy.',
        status: 'reviewed',
        priority: 'routine',
        requestedBy: users[1]._id,
        reviewedBy: users[3]._id,
        sentAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patients[2]._id,
        fromProvider: providers[2]._id,
        toProvider: providers[0]._id,
        documentType: 'imaging',
        subject: 'Right Knee MRI Report',
        content: 'Patient: Michael Brown\nStudy: MRI Right Knee without contrast\n\nFindings:\n- ACL reconstruction graft is intact with good tension\n- No meniscal tear identified\n- Mild joint effusion\n- Mild chondromalacia patellae, Grade II\n- No osseous abnormality\n\nImpression: Post-ACL reconstruction, graft intact. Mild degenerative changes.',
        status: 'pending',
        priority: 'routine',
        requestedBy: users[7]._id,
        sentAt: new Date(),
      },
      {
        patient: patients[1]._id,
        fromProvider: providers[1]._id,
        toProvider: providers[3]._id,
        documentType: 'prescription',
        subject: 'Updated Asthma Prescription',
        content: 'Patient: Emma Williams\n\nRx:\n1. Albuterol HFA 90mcg - 2 puffs every 4-6 hours as needed for shortness of breath\n2. Fluticasone 110mcg - 2 puffs twice daily (NEW)\n\nNote: Adding maintenance inhaler due to increased frequency of rescue inhaler use (>2x/week).\nFollow-up in 4 weeks to assess response.',
        status: 'sent',
        priority: 'routine',
        requestedBy: users[3]._id,
        sentAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patients[5]._id,
        fromProvider: providers[2]._id,
        toProvider: providers[0]._id,
        documentType: 'lab-report',
        subject: 'Complete Blood Count Results',
        content: 'Patient: Olivia Martinez\n\nWBC: 7.2 x10^3/uL\nRBC: 4.5 x10^6/uL\nHemoglobin: 13.8 g/dL\nHematocrit: 41%\nPlatelets: 245 x10^3/uL\nMCV: 91 fL\nMCH: 30.7 pg\nMCHC: 33.7 g/dL\n\nAll values within normal limits.',
        status: 'reviewed',
        priority: 'routine',
        requestedBy: users[7]._id,
        reviewedBy: users[2]._id,
        sentAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patients[9]._id,
        fromProvider: providers[0]._id,
        toProvider: providers[2]._id,
        documentType: 'lab-report',
        subject: 'Rheumatoid Factor and Anti-CCP Panel',
        content: 'Patient: Charlotte Wilson\n\nRequested by Dr. Sarah Smith.\n\nPlease run the following panel:\n- Rheumatoid Factor (RF)\n- Anti-CCP antibodies\n- ESR\n- CRP\n- ANA\n\nClinical notes: Patient on Adalimumab for RA. Monitoring disease activity.',
        status: 'pending',
        priority: 'urgent',
        requestedBy: users[1]._id,
        sentAt: new Date(),
      },
    ];

    const exchanges = await ClinicalExchange.create(exchangeData);
    console.log(`📋 Created ${exchanges.length} clinical exchanges`);

    // Create some audit logs
    const auditData = [];
    const actions = ['LOGIN', 'CREATE', 'READ', 'UPDATE'];
    const resources = ['Patient', 'Appointment', 'Exchange', 'Auth'];

    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];

      auditData.push({
        user: user._id,
        userName: user.name,
        userRole: user.role,
        action,
        resource,
        details: `${action} operation on ${resource}`,
        ipAddress: '127.0.0.1',
        userAgent: 'MedConnect Seed Script',
        timestamp: new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      });
    }

    await AuditLog.create(auditData);
    console.log('📝 Created audit logs');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:        admin@medconnect.com / admin123');
    console.log('   Doctor:       dr.smith@medconnect.com / doctor123');
    console.log('   Nurse:        nurse.jones@medconnect.com / nurse123');
    console.log('   Receptionist: reception@medconnect.com / reception123');
    console.log('   Lab Tech:     lab.tech@medconnect.com / labtech123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();

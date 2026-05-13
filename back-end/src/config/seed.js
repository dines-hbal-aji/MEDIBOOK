const bcrypt = require('bcryptjs');

// Use db.js — it creates all tables via CREATE TABLE IF NOT EXISTS
const db = require('./db');

console.log('🌱 Seeding MediBook database with real doctors...\n');

// ─── Clear existing data ───────────────────────────────────────────────────────
db.exec(`
  DELETE FROM notifications;
  DELETE FROM prescriptions;
  DELETE FROM appointments;
  DELETE FROM slots;
  DELETE FROM doctors;
  DELETE FROM users;
  DELETE FROM settings;
`);

// ─── Settings ─────────────────────────────────────────────────────────────────
const insertSetting = db.prepare(`
  INSERT OR REPLACE INTO settings (key, value, updated_at)
  VALUES (?, ?, datetime('now'))
`);
insertSetting.run('app_name', 'MediBook');
insertSetting.run('commission_percentage', '10');
insertSetting.run('app_logo_path', '');
console.log('✅ Settings seeded');

// ─── Email / Password helpers ─────────────────────────────────────────────────
const toEmail = (name) =>
  name.toLowerCase()
      .replace(/^dr\.\s*/i, '')       // remove "Dr. " prefix
      .replace(/[^a-z0-9\s]/g, '')    // strip special chars
      .trim()
      .replace(/\s+/g, '.') + '@medibook.com';

const toPassword = (name) =>
  name.replace(/^Dr\.\s*/i, '')       // remove "Dr. " prefix
      .replace(/[^a-zA-Z0-9\s]/g, '') // strip special chars
      .trim()
      .replace(/\s+/g, '') + '@123';

// ─── Insert helpers ───────────────────────────────────────────────────────────
const insertUser = db.prepare(`
  INSERT INTO users (name, email, phone, password_hash, role, is_active)
  VALUES (?, ?, ?, ?, ?, 1)
`);

const insertDoctor = db.prepare(`
  INSERT INTO doctors (user_id, specialization, experience_years, base_fee, bio, hospital, is_approved, is_available)
  VALUES (?, ?, ?, ?, ?, ?, 1, 1)
`);

const insertSlot = db.prepare(`
  INSERT OR IGNORE INTO slots (doctor_id, date, start_time, end_time)
  VALUES (?, ?, ?, ?)
`);

function generateSlots(doctorId) {
  const today = new Date();
  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0) continue; // skip Sundays
    const dateStr = date.toISOString().split('T')[0];
    const timeSlots = [
      ['09:00','09:30'],['09:30','10:00'],['10:00','10:30'],
      ['10:30','11:00'],['11:00','11:30'],['11:30','12:00'],
      ['16:00','16:30'],['16:30','17:00'],['17:00','17:30'],['17:30','18:00'],
    ];
    // Randomly select 3 to 6 slots per day
    const numSlots = Math.floor(Math.random() * 4) + 3;
    const shuffled = timeSlots.sort(() => 0.5 - Math.random());
    const selectedSlots = shuffled.slice(0, numSlots).sort((a, b) => a[0].localeCompare(b[0]));
    
    selectedSlots.forEach(([s, e]) => insertSlot.run(doctorId, dateStr, s, e));
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────
insertUser.run('Admin', 'admin@medibook.com', '9000000000', bcrypt.hashSync('Admin@123', 10), 'admin');
console.log('✅ Admin → admin@medibook.com / Admin@123');

// ─── Real Doctors ─────────────────────────────────────────────────────────────
const DOCTORS = [
  // 🫀 Cardiology
  {
    name: 'Dr. Robert Mao',
    specialization: 'Cardiologist',
    experience_years: 47, base_fee: 2000,
    hospital: 'Apollo Hospitals, Chennai',
    bio: 'Interventional Cardiologist with 47+ years of experience in Open Heart Surgery, Aortic Aneurysm Surgery, PCI, Vascular Surgery, and Heart Valve Replacement.',
  },
  {
    name: 'Dr. T.R. Muralidharan',
    specialization: 'Cardiologist',
    experience_years: 22, base_fee: 1800,
    hospital: 'SRM Global Hospitals, Chennai',
    bio: 'Director of the Institute of Cardiac Sciences at SRM Global Hospitals. Recipient of the FICCI Best Innovator Award and Best Doctor Award from the Governor of Tamil Nadu.',
  },
  {
    name: 'Dr. Avinash Jayachandran',
    specialization: 'Cardiologist',
    experience_years: 18, base_fee: 1500,
    hospital: 'Vinita Hospital, Chennai',
    bio: 'One of the best cardiologists in Chennai, with expertise in angioplasties and stent placements.',
  },
  {
    name: 'Dr. R. Anantharaman',
    specialization: 'Cardiologist',
    experience_years: 20, base_fee: 1600,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'MRCP (UK), FRCP (UK), CCT Cardiology (UK). Specialist in interventional cardiology and complex coronary procedures.',
  },
  {
    name: 'Dr. Manoj Sivaramakrishnan',
    specialization: 'Cardiologist',
    experience_years: 16, base_fee: 1500,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'DM Cardiology, FACC, FSCAI. Expert in interventional cardiology with focus on complex coronary interventions.',
  },
  {
    name: 'Dr. Sandeep Attawar',
    specialization: 'Cardiologist',
    experience_years: 21, base_fee: 3000,
    hospital: 'MGM Healthcare, Chennai',
    bio: 'Cardiovascular Surgeon with 21+ years of experience in Thoracic Organ Transplantation and Mechanical Circulatory Support. Over 10,000 open and closed heart surgeries in adults and children.',
  },

  // 🧠 Neurology
  {
    name: 'Dr. Siddhartha Ghosh',
    specialization: 'Neurologist',
    experience_years: 40, base_fee: 2500,
    hospital: 'MGM Healthcare, Chennai',
    bio: 'One of India\'s most distinguished neurosurgeons with 40+ years and 20,000+ successful neurosurgeries. Specializes in neuro-oncology, skull base surgery, pediatric neurosurgery, and stereotactic surgery.',
  },
  {
    name: 'Dr. Prithika Chary',
    specialization: 'Neurologist',
    experience_years: 35, base_fee: 2000,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'The first and only lady in India qualified as both a neurosurgeon and a neurophysician. Senior Consultant Neurologist and Neurosurgeon at Kauvery Hospitals.',
  },
  {
    name: 'Dr. Balamurali',
    specialization: 'Neurologist',
    experience_years: 25, base_fee: 1800,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Renowned for keyhole spine surgery and minimally invasive spine surgery. Trained at Zurich\'s Schulthess Klinik and Nottingham Queens Center, UK.',
  },
  {
    name: 'Dr. Bhuvaneshwari',
    specialization: 'Neurologist',
    experience_years: 18, base_fee: 1600,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'UK-trained specialist in clinical neurophysiology, neuroinflammation, stroke treatment, dementia, headache, and epilepsy management.',
  },

  // 🦴 Orthopaedics
  {
    name: 'Dr. Ravi V',
    specialization: 'Orthopedic',
    experience_years: 23, base_fee: 1500,
    hospital: 'MIOT International, Chennai',
    bio: 'Leading Orthopedist in Chennai with 23+ years of experience. First surgeon in South India to perform minimally invasive spine surgery.',
  },
  {
    name: 'Dr. Keerthivasan',
    specialization: 'Orthopedic',
    experience_years: 15, base_fee: 1400,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Expert in neurosurgery-related cancer treatment, congenital spine anomalies, and complex spinal deformity corrections.',
  },

  // 🎗️ Oncology
  {
    name: 'Dr. Venkata Karthikeyan',
    specialization: 'Oncologist',
    experience_years: 20, base_fee: 2000,
    hospital: 'Apollo Hospitals, Chennai',
    bio: 'Outlook Best Doctors South 2025 awardee. Expert in surgical oncology, precision cancer treatment, and multidisciplinary cancer management.',
  },
  {
    name: 'Dr. K. Krishnakumar',
    specialization: 'Oncologist',
    experience_years: 22, base_fee: 2000,
    hospital: 'Apollo Hospitals, Chennai',
    bio: 'Outlook Best Doctors South 2025 awardee. Specialist in medical oncology — chemotherapy, immunotherapy, and targeted cancer therapies.',
  },
  {
    name: 'Dr. Rajan Sundaresan',
    specialization: 'Oncologist',
    experience_years: 18, base_fee: 1800,
    hospital: 'CMC Vellore',
    bio: 'Expert in radiation oncology with a focus on precision radiotherapy and advanced cancer treatment protocols at CMC Vellore.',
  },
  {
    name: 'Dr. P.G. Visvanathan',
    specialization: 'Oncologist',
    experience_years: 25, base_fee: 1800,
    hospital: 'PSG Hospitals, Coimbatore',
    bio: 'Recognized across Tamil Nadu for advanced cancer surgery and comprehensive oncological care with expertise in minimally invasive cancer surgery.',
  },

  // 🫁 Pulmonology
  {
    name: 'Dr. R.P. Ilangho',
    specialization: 'Pulmonologist',
    experience_years: 28, base_fee: 1400,
    hospital: 'Apollo BreatheEazy Clinic, Chennai',
    bio: 'Former VP (Medical), Apollo BreatheEazy Clinic. Recognized by Economic Times as "Inspiring Doctors of India-2023" and Outlook Magazine as "Best Doctors South 2023 & 2024." Expert in Asthma and COPD.',
  },

  // 🦠 Gastroenterology
  {
    name: 'Dr. Hariharan Muthuswamy',
    specialization: 'Gastroenterologist',
    experience_years: 22, base_fee: 1500,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Renowned Gastroenterologist & Hepatologist expert in Hepatitis treatment, capsule endoscopy, haemorrhoids, GERD, and Inflammatory Bowel Disease. Fellow of the Royal College of Physicians.',
  },

  // 🧬 Rheumatology
  {
    name: 'Dr. Ramakrishnan S',
    specialization: 'Rheumatologist',
    experience_years: 38, base_fee: 1600,
    hospital: 'Apollo Hospitals, Chennai',
    bio: 'Rheumatologist with 38+ years of experience, MBBS Gold Medal holder, and IRA Boots Best Paper Award winner at the International Conference of Rheumatology.',
  },

  // 👶 Gynaecology
  {
    name: 'Dr. Sumana Manohar',
    specialization: 'Gynecologist',
    experience_years: 27, base_fee: 1500,
    hospital: 'Apollo Hospitals, Chennai',
    bio: 'Leading OB-GYN with 27 years of experience in robotic surgery, laparoscopic hysterectomy, and high-risk obstetrics. Fellow of the Royal Colleges of Physicians, UK.',
  },
  {
    name: 'Dr. Padmapriya Vivek',
    specialization: 'Gynecologist',
    experience_years: 18, base_fee: 1400,
    hospital: 'Apollo Hospitals, Chennai',
    bio: 'Outlook Best Doctors South 2025. Specialist in maternal-fetal medicine and minimally invasive gynecological surgery.',
  },
  {
    name: 'Dr. Lakshmi Ashwathaman',
    specialization: 'Gynecologist',
    experience_years: 20, base_fee: 1400,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Outlook Best Doctors South 2025. Expert in laparoscopic gynecology, infertility treatment, and high-risk pregnancy management.',
  },
  {
    name: 'Dr. Anita Thomas',
    specialization: 'Gynecologist',
    experience_years: 22, base_fee: 1300,
    hospital: 'CMC Vellore',
    bio: 'Specialist in obstetrics and gynecology at CMC Vellore, with expertise in complex gynecological conditions and high-risk pregnancies.',
  },

  // 🫘 Urology
  {
    name: 'Dr. Joseph Thachil',
    specialization: 'Urologist',
    experience_years: 24, base_fee: 1600,
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Among the best urologists in Chennai, specializing in laparoscopic urology, kidney stone management, and urological oncology.',
  },
];

// ─── Seed all doctors ──────────────────────────────────────────────────────────
const credentials = [];

for (const doc of DOCTORS) {
  const email = toEmail(doc.name);
  const rawPassword = toPassword(doc.name);
  const hash = bcrypt.hashSync(rawPassword, 10);

  const { lastInsertRowid: userId } = insertUser.run(doc.name, email, null, hash, 'doctor');
  const { lastInsertRowid: doctorId } = insertDoctor.run(
    userId, doc.specialization, doc.experience_years,
    doc.base_fee, doc.bio, doc.hospital
  );
  generateSlots(doctorId);

  credentials.push({ name: doc.name, email, password: rawPassword });
  console.log(`✅ ${doc.name.padEnd(30)} → ${email}`);
}

// ─── Sample Patient ────────────────────────────────────────────────────────────
insertUser.run('John Patient', 'john@medibook.com', '9876543210', bcrypt.hashSync('Patient@123', 10), 'user');
console.log('\n✅ Patient → john@medibook.com / Patient@123');

// ─── Print Credentials ────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(75));
console.log('🎉 Seeding complete! ' + DOCTORS.length + ' doctors, 1 admin, 1 patient.');
console.log('='.repeat(75));
console.log('\nADMIN  : admin@medibook.com          / Admin@123');
console.log('PATIENT: john@medibook.com           / Patient@123');
console.log('\nDOCTOR CREDENTIALS:');
console.log('-'.repeat(75));
credentials.forEach(c => {
  console.log(`${c.email.padEnd(45)} ${c.password}`);
});
console.log('='.repeat(75));

const express = require('express');
const app = express();
app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── AUTH ──────────────────────────────────────────────────────────────────────
const BEARER = '2a12j6lJRuGKlM1Uoezm3bNgneIYsFwAB2sxP3qt62iZ5dygryWXe6K';
app.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${BEARER}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
});

// ── IN-MEMORY STORES ──────────────────────────────────────────────────────────
const otpStore = {}; // phone -> otp

// ── REAL DATA FROM POSTMAN COLLECTION ────────────────────────────────────────
const DOCTORS = [
  { doctor_id: 165, user_id: 93604, doctor_title: "Dr", doctor_first_name: "Razib", doctor_last_name: "Al Mamun", doctor_phone: "8677878907", doctor_blsd: "2025-12-08", doctor_insurance: "2025-12-09", doctor_note: null },
  { doctor_id: 147, user_id: 88336, doctor_title: "Dr.ssa", doctor_first_name: "Mirella", doctor_last_name: "Ballerini", doctor_phone: null, doctor_blsd: "2024-11-25", doctor_insurance: "2024-11-25", doctor_note: null },
  { doctor_id: 153, user_id: 90024, doctor_title: "Dr", doctor_first_name: "Bernardo", doctor_last_name: "Barbanti", doctor_phone: null, doctor_blsd: "2025-03-21", doctor_insurance: "2025-03-21", doctor_note: null },
  { doctor_id: 136, user_id: 80987, doctor_title: "Dr.ssa", doctor_first_name: "Ilaria", doctor_last_name: "Bianconi", doctor_phone: null, doctor_blsd: "2023-05-02", doctor_insurance: "2023-05-02", doctor_note: null },
  { doctor_id: 64, user_id: 170, doctor_title: "Dr.ssa", doctor_first_name: "Marina", doctor_last_name: "Carelli", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 43, user_id: 148, doctor_title: "Dr", doctor_first_name: "Gregorio", doctor_last_name: "Ciampa", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 23, user_id: 125, doctor_title: "Dr.ssa", doctor_first_name: "Alessandra", doctor_last_name: "Cosi", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 49, user_id: 154, doctor_title: "Dr.ssa", doctor_first_name: "Angela", doctor_last_name: "Dainelli", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 41, user_id: 146, doctor_title: "Dr.ssa", doctor_first_name: "Susanna", doctor_last_name: "Dallai", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 14, user_id: 116, doctor_title: "Dr.ssa", doctor_first_name: "Sandra", doctor_last_name: "Fanfani", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 15, user_id: 117, doctor_title: "Dr", doctor_first_name: "Andrea", doctor_last_name: "Fantini", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 56, user_id: 162, doctor_title: "Dr.ssa", doctor_first_name: "Ginetta", doctor_last_name: "Gervasi", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 164, user_id: 93356, doctor_title: "Dr", doctor_first_name: "Luca", doctor_last_name: "Gatteschi", doctor_phone: null, doctor_blsd: "2025-11-07", doctor_insurance: "2025-11-07", doctor_note: null },
  { doctor_id: 146, user_id: 88196, doctor_title: "Dr", doctor_first_name: "Massimo", doctor_last_name: "Giovannoni", doctor_phone: null, doctor_blsd: "2024-11-14", doctor_insurance: "2024-11-14", doctor_note: null },
  { doctor_id: 21, user_id: 123, doctor_title: "Dr", doctor_first_name: "Alfredo", doctor_last_name: "Ingenito", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 47, user_id: 152, doctor_title: "Dr.ssa", doctor_first_name: "Isabella", doctor_last_name: "Marini", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 45, user_id: 150, doctor_title: "Dr", doctor_first_name: "Luciano", doctor_last_name: "Mazzucco", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 30, user_id: 134, doctor_title: "Dr", doctor_first_name: "Pietro", doctor_last_name: "Melani", doctor_phone: "pietromelani@libero.it", doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 12, user_id: 114, doctor_title: "Dr.ssa", doctor_first_name: "Patrizia", doctor_last_name: "Miceli", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: "nota" },
  { doctor_id: 17, user_id: 119, doctor_title: "Dr", doctor_first_name: "Niccolò", doctor_last_name: "Mugelli", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 19, user_id: 121, doctor_title: "Dott.ssa", doctor_first_name: "Barbara", doctor_last_name: "Pampaloni", doctor_phone: null, doctor_blsd: "2018-12-27", doctor_insurance: "2018-12-27", doctor_note: null },
  { doctor_id: 80, user_id: 196, doctor_title: "Dr.ssa", doctor_first_name: "Nadia", doctor_last_name: "Papasidero", doctor_phone: null, doctor_blsd: "2019-01-21", doctor_insurance: "2019-01-21", doctor_note: null },
  { doctor_id: 59, user_id: 165, doctor_title: "Dr", doctor_first_name: "Salvatore", doctor_last_name: "Placanica", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 74, user_id: 180, doctor_title: "Dr.ssa", doctor_first_name: "Caterina", doctor_last_name: "Pratesi", doctor_phone: null, doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 154, user_id: 90812, doctor_title: "Dr", doctor_first_name: "Paolo", doctor_last_name: "Roccanti", doctor_phone: null, doctor_blsd: "2025-05-13", doctor_insurance: "2025-05-13", doctor_note: null },
  { doctor_id: 76, user_id: 186, doctor_title: "Dr", doctor_first_name: "Marco", doctor_last_name: "Salvadori", doctor_phone: "0556910359", doctor_blsd: "2019-01-07", doctor_insurance: "2019-01-07", doctor_note: null },
  { doctor_id: 34, user_id: 139, doctor_title: "Dr.ssa", doctor_first_name: "Chiara", doctor_last_name: "Scrivanti", doctor_phone: "chiarascrivanti@yahoo.it", doctor_blsd: "2018-12-28", doctor_insurance: "2018-12-28", doctor_note: null },
  { doctor_id: 75, user_id: 185, doctor_title: "Dr.ssa", doctor_first_name: "Tiziana", doctor_last_name: "Soncini", doctor_phone: null, doctor_blsd: "2019-01-07", doctor_insurance: "2019-01-07", doctor_note: null },
  { doctor_id: 123, user_id: 77438, doctor_title: "Dr", doctor_first_name: "Aldo", doctor_last_name: "Tosto", doctor_phone: null, doctor_blsd: "2022-04-08", doctor_insurance: "2022-04-08", doctor_note: null },
  { doctor_id: 73, user_id: 179, doctor_title: "Dr", doctor_first_name: "Giuseppe", doctor_last_name: "Vallone", doctor_phone: null, doctor_blsd: "2018-05-08", doctor_insurance: "2099-12-28", doctor_note: null }
];

const SPECIALIZATIONS = [
  { spec_id: 7, spec_name: "Angiologia e Flebologia" },
  { spec_id: 43, spec_name: "Campo visivo" },
  { spec_id: 2, spec_name: "Cardiologia" },
  { spec_id: 40, spec_name: "Centro di Neuropsicologia" },
  { spec_id: 16, spec_name: "Chirurgia generale" },
  { spec_id: 9, spec_name: "Dermatologia" },
  { spec_id: 18, spec_name: "Dietologia" },
  { spec_id: 1, spec_name: "Ecografia addome - Tiroide - Piccole parti - Transrettale" },
  { spec_id: 51, spec_name: "Ecografia mammaria" },
  { spec_id: 21, spec_name: "Gastroenterologia" },
  { spec_id: 22, spec_name: "Geriatria" },
  { spec_id: 25, spec_name: "Ginecologia" },
  { spec_id: 49, spec_name: "HOLTER Cardiaco" },
  { spec_id: 27, spec_name: "Medicina dello Sport" },
  { spec_id: 28, spec_name: "Neurologia" },
  { spec_id: 29, spec_name: "Nutrizionista" },
  { spec_id: 4, spec_name: "oculistica" },
  { spec_id: 11, spec_name: "odontoiatria" },
  { spec_id: 83, spec_name: "Oncologia" },
  { spec_id: 42, spec_name: "Ortopedia" },
  { spec_id: 32, spec_name: "Otorinolaringoiatria" },
  { spec_id: 33, spec_name: "Pediatria" },
  { spec_id: 55, spec_name: "Pneumologia" },
  { spec_id: 35, spec_name: "Prelievi ematici" },
  { spec_id: 36, spec_name: "Psicologia e psicoterapia" },
  { spec_id: 39, spec_name: "Servizi infermieristici" },
  { spec_id: 65, spec_name: "Terapia del Dolore" },
  { spec_id: 38, spec_name: "Urologia" }
];

// Doctor -> Specialization mapping
const DOCTOR_SPEC_MAP = {
  93604: { spec_id: 2, spec_name: "Cardiologia" },
  88336: { spec_id: 18, spec_name: "Dietologia" },
  90024: { spec_id: 28, spec_name: "Neurologia" },
  80987: { spec_id: 9, spec_name: "Dermatologia" },
  170:   { spec_id: 25, spec_name: "Ginecologia" },
  148:   { spec_id: 16, spec_name: "Chirurgia generale" },
  125:   { spec_id: 36, spec_name: "Psicologia e psicoterapia" },
  154:   { spec_id: 33, spec_name: "Pediatria" },
  146:   { spec_id: 22, spec_name: "Geriatria" },
  116:   { spec_id: 29, spec_name: "Nutrizionista" },
  117:   { spec_id: 27, spec_name: "Medicina dello Sport" },
  162:   { spec_id: 42, spec_name: "Ortopedia" },
  93356: { spec_id: 55, spec_name: "Pneumologia" },
  88196: { spec_id: 21, spec_name: "Gastroenterologia" },
  123:   { spec_id: 38, spec_name: "Urologia" },
  152:   { spec_id: 4, spec_name: "oculistica" },
  150:   { spec_id: 7, spec_name: "Angiologia e Flebologia" },
  134:   { spec_id: 2, spec_name: "Cardiologia" },
  114:   { spec_id: 11, spec_name: "odontoiatria" },
  119:   { spec_id: 28, spec_name: "Neurologia" },
  121:   { spec_id: 32, spec_name: "Otorinolaringoiatria" },
  196:   { spec_id: 36, spec_name: "Psicologia e psicoterapia" },
  165:   { spec_id: 83, spec_name: "Oncologia" },
  180:   { spec_id: 65, spec_name: "Terapia del Dolore" },
  90812: { spec_id: 42, spec_name: "Ortopedia" },
  186:   { spec_id: 16, spec_name: "Chirurgia generale" },
  139:   { spec_id: 9, spec_name: "Dermatologia" },
  185:   { spec_id: 33, spec_name: "Pediatria" },
  77438: { spec_id: 38, spec_name: "Urologia" },
  179:   { spec_id: 21, spec_name: "Gastroenterologia" }
};

// ── ENDPOINTS ─────────────────────────────────────────────────────────────────

// GET /api/ai/en/doctors
app.get('/api/ai/en/doctors', (req, res) => {
  res.json({
    success: true,
    doctors: DOCTORS,
    specializations: SPECIALIZATIONS
  });
});

// GET /api/ai/en/specializations
app.get('/api/ai/en/specializations', (req, res) => {
  res.json({ success: true, specializations: SPECIALIZATIONS });
});

// GET /api/ai/en/doctors/:user_id/specializations
app.get('/api/ai/en/doctors/:user_id/specializations', (req, res) => {
  const uid = parseInt(req.params.user_id);
  const spec = DOCTOR_SPEC_MAP[uid];
  if (!spec) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({
    success: true,
    specialization: {
      ...spec,
      status: 1,
      created_at: "2018-12-27 10:18:38",
      updated_at: "2018-12-27 10:18:38",
      created_by: 0,
      updated_by: 0
    }
  });
});

// POST /api/ai/en/otp-send
app.post('/api/ai/en/otp-send', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;
  console.log(`[OTP] ${phone} -> ${otp}`);
  res.json({ success: true, message: 'OTP sent', otp }); // matches real API: "otp" not "otp_code"
});

// POST /api/ai/en/otp-verify  (real API only needs {"otp": "..."})
app.post('/api/ai/en/otp-verify', (req, res) => {
  const { otp, phone } = req.body;
  if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });

  // Find which phone this OTP belongs to (or verify directly if phone provided)
  let verified = false;
  let verifiedPhone = phone;

  if (phone && otpStore[phone] && otpStore[phone] === otp.toString()) {
    verified = true;
    delete otpStore[phone];
  } else {
    // Check all stored OTPs (real API doesn't need phone in verify)
    for (const [p, code] of Object.entries(otpStore)) {
      if (code === otp.toString()) {
        verified = true;
        verifiedPhone = p;
        delete otpStore[p];
        break;
      }
    }
  }

  if (verified) {
    res.json({
      success: true,
      message: 'OTP verified',
      user: {
        user_id: 39,
        email: 'user@temp.com',
        phone: verifiedPhone,
        user_type: 'patient'
      }
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

// POST /api/ai/en/calendars
app.post('/api/ai/en/calendars', (req, res) => {
  const { find_by, doctor_user_id, specialization_id } = req.body;
  const uid = parseInt(doctor_user_id) || 93604;
  const doctor = DOCTORS.find(d => d.user_id === uid) || DOCTORS[0];
  const spec = DOCTOR_SPEC_MAP[uid] || { spec_id: 2, spec_name: "Cardiologia" };

  const slotRows = {};
  const today = new Date();

  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay();
    const dateStr = d.toISOString().split('T')[0];

    if (day === 0 || day === 6) { slotRows[dateStr] = []; continue; }

    const slots = [];
    const times = ['09:00:00','09:15:00','09:30:00','09:45:00','10:00:00','13:00:00','13:15:00','13:30:00','13:45:00','14:00:00'];
    times.forEach((time, idx) => {
      slots.push({
        slot_id: 600000 + (i * 10) + idx,
        slot_time: time,
        slot_entity: 3,
        calendar_id: 4292,
        slot_number: 1000 + (i * 10) + idx,
        slot_duration: '00:15:00',
        slot_appearance_order: 'asc'
      });
    });
    slotRows[dateStr] = slots;
  }

  res.json({
    "0": {
      doctor: { ...doctor },
      specialization: spec,
      slot_rows: slotRows
    },
    doctor_messages: []
  });
});

// POST /api/ai/en/appointments
app.post('/api/ai/en/appointments', (req, res) => {
  const {
    slot_id, user_email, user_first_name, user_last_name,
    user_gender, user_phone, booking_for,
    patient_name, patient_surname, patient_phone
  } = req.body;

  if (!slot_id) return res.status(400).json({ success: false, message: 'slot_id is required' });

  const apptId = Math.floor(300000 + Math.random() * 99999);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  res.json({
    success: true,
    message: 'Appointment successfully booked',
    appointment: {
      doctor_user_id: 93604,
      appt_date: today,
      appointments_from: 'ai_assistant',
      patient_user_id: 0,
      temporary_patient: booking_for ? 1 : 0,
      temporary_patient_name: booking_for ? patient_name : user_first_name,
      temporary_patient_surname: booking_for ? patient_surname : user_last_name,
      temporary_patient_phone: booking_for ? patient_phone : user_phone,
      visit_number: 1,
      prescription: '',
      patient_attended: 0,
      created_by: 93606,
      updated_by: 93606,
      entity: 3,
      note: null,
      updated_at: now,
      created_at: now,
      appt_id: apptId
    }
  });
});

// DELETE /api/ai/en/appointments/:id
app.delete('/api/ai/en/appointments/:id', (req, res) => {
  res.json({ success: true, message: 'Appointment deleted successfully' });
});

// GET /api/ai/en/appointments/patient/:email
// Matches EXACT real API response structure from Postman collection
app.get('/api/ai/en/appointments/patient/:email', (req, res) => {
  const today = new Date();
  const future1 = new Date(today); future1.setDate(today.getDate() + 5);
  const future2 = new Date(today); future2.setDate(today.getDate() + 12);
  const fmt = d => d.toISOString().split('T')[0];

  res.json({
    appointments: [
      {
        appt_id: 306905,
        appointments_from: 'AI',
        spec_id: 2,
        medical_service_id: 0,
        patient_user_id: 93607,
        temporary_patient: 0,
        extra_appt_note: null,
        temporary_patient_name: null,
        temporary_patient_surname: '',
        temporary_patient_phone: null,
        appt_date: fmt(future1),
        visit_number: 1,
        prescription: null,
        patient_attended: 0,
        doctor_user_id: 93604,
        slot_id: 615990,
        slot_time: '09:00:00'
      },
      {
        appt_id: 306906,
        appointments_from: 'AI',
        spec_id: 9,
        medical_service_id: 0,
        patient_user_id: 93607,
        temporary_patient: 0,
        extra_appt_note: null,
        temporary_patient_name: null,
        temporary_patient_surname: '',
        temporary_patient_phone: null,
        appt_date: fmt(future2),
        visit_number: 1,
        prescription: null,
        patient_attended: 0,
        doctor_user_id: 80987,
        slot_id: 615991,
        slot_time: '13:30:00'
      }
    ]
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'NCM Medical API running', version: '2.0.0', endpoints: [
    'GET /api/ai/en/doctors',
    'GET /api/ai/en/specializations',
    'GET /api/ai/en/doctors/:user_id/specializations',
    'POST /api/ai/en/otp-send',
    'POST /api/ai/en/otp-verify',
    'POST /api/ai/en/calendars',
    'POST /api/ai/en/appointments',
    'DELETE /api/ai/en/appointments/:id',
    'GET /api/ai/en/appointments/patient/:email'
  ]});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NCM Medical API running on port ${PORT}`));

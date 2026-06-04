const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
// In-memory OTP store
const otpStore = {};

// ─── MIDDLEWARE: Bearer token check ───────────────────────────────────────────
app.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== 'Bearer 2a12j6lJRuGKlM1Uoezm3bNgneIYsFwAB2sxP3qt62iZ5dygryWXe6K') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
});

// ─── POST /api/ai/en/otp-send ─────────────────────────────────────────────────
app.post('/api/ai/en/otp-send', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  console.log(`OTP for ${phone}: ${otp}`); // visible in logs

  res.json({
    success: true,
    message: 'OTP sent successfully',
    otp_code: otp // returning it so you can test easily
  });
});

// ─── POST /api/ai/en/otp-verify ──────────────────────────────────────────────
app.post('/api/ai/en/otp-verify', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });

  if (otpStore[phone] && otpStore[phone] === otp.toString()) {
    delete otpStore[phone];
    return res.json({ success: true, message: 'OTP verified successfully' });
  }
  res.status(400).json({ success: false, message: 'Invalid OTP code' });
});

// ─── GET /api/ai/en/doctors ───────────────────────────────────────────────────
app.get('/api/ai/en/doctors', (req, res) => {
  res.json({
    success: true,
    doctors: [
      {
        doctor_id: 165,
        user_id: 93604,
        doctor_title: 'Dr',
        doctor_first_name: 'Razib',
        doctor_last_name: 'Al Mamun',
        doctor_phone: '8677878907',
        specialization: { spec_id: 2, spec_name: 'Cardiologia' }
      },
      {
        doctor_id: 166,
        user_id: 93605,
        doctor_title: 'Dr',
        doctor_first_name: 'Maria',
        doctor_last_name: 'Garcia',
        doctor_phone: '8677878908',
        specialization: { spec_id: 3, spec_name: 'Dermatologia' }
      },
      {
        doctor_id: 167,
        user_id: 93606,
        doctor_title: 'Dr',
        doctor_first_name: 'Carlos',
        doctor_last_name: 'Lopez',
        doctor_phone: '8677878909',
        specialization: { spec_id: 4, spec_name: 'Pediatria' }
      }
    ]
  });
});

// ─── GET /api/ai/en/specialisations ──────────────────────────────────────────
app.get('/api/ai/en/specialisations', (req, res) => {
  res.json({
    success: true,
    specialisations: [
      { spec_id: 2, spec_name: 'Cardiologia' },
      { spec_id: 3, spec_name: 'Dermatologia' },
      { spec_id: 4, spec_name: 'Pediatria' }
    ]
  });
});

// ─── GET /api/ai/en/specialisation-by-doctor ─────────────────────────────────
app.get('/api/ai/en/specialisation-by-doctor', (req, res) => {
  const { doctor_user_id } = req.query;
  const map = {
    '93604': { spec_id: 2, spec_name: 'Cardiologia' },
    '93605': { spec_id: 3, spec_name: 'Dermatologia' },
    '93606': { spec_id: 4, spec_name: 'Pediatria' }
  };
  const spec = map[doctor_user_id] || { spec_id: 2, spec_name: 'Cardiologia' };
  res.json({ success: true, specialization: spec });
});

// ─── POST /api/ai/en/calendars ────────────────────────────────────────────────
app.post('/api/ai/en/calendars', (req, res) => {
  const { find_by, doctor_user_id, specialization_id } = req.body;

  // Generate slots for next 30 days (skip weekends)
  const slotRows = {};
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay();
    const dateStr = d.toISOString().split('T')[0];

    // Skip weekends
    if (day === 0 || day === 6) {
      slotRows[dateStr] = [];
      continue;
    }

    const slots = [];
    const times = ['09:00:00', '09:15:00', '09:30:00', '09:45:00', '10:00:00', '13:00:00', '13:15:00', '13:30:00', '13:45:00', '14:00:00'];
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
      doctor: {
        doctor_id: 165,
        user_id: doctor_user_id || 93604,
        doctor_title: 'Dr',
        doctor_first_name: 'Razib',
        doctor_last_name: 'Al Mamun',
        doctor_phone: '8677878907',
        doctor_blsd: '2025-12-08',
        doctor_insurance: '2025-12-09',
        doctor_note: null
      },
      specialization: {
        spec_id: specialization_id || 2,
        spec_name: 'Cardiologia'
      },
      slot_rows: slotRows
    },
    doctor_messages: []
  });
});

// ─── POST /api/ai/en/appointments ────────────────────────────────────────────
app.post('/api/ai/en/appointments', (req, res) => {
  const {
    slot_id, user_email, user_first_name, user_last_name,
    user_gender, user_phone, booking_for,
    patient_name, patient_surname, patient_phone
  } = req.body;

  if (!slot_id) return res.status(400).json({ success: false, message: 'slot_id is required' });

  const apptId = Math.floor(300000 + Math.random() * 99999);
  const today = new Date().toISOString().split('T')[0];

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
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      appt_id: apptId
    }
  });
});

// ─── DELETE /api/ai/en/appointments/:id ──────────────────────────────────────
app.delete('/api/ai/en/appointments/:id', (req, res) => {
  res.json({ success: true, message: 'Appointment deleted successfully' });
});

// ─── GET /api/ai/en/appointments-by-patient ──────────────────────────────────
app.get('/api/ai/en/appointments-by-patient', (req, res) => {
  res.json({
    success: true,
    appointments: [
      {
        appt_id: 306910,
        appt_date: '2026-05-25',
        slot_time: '09:00:00',
        doctor_name: 'Dr Razib Al Mamun',
        specialization: 'Cardiologia',
        status: 'confirmed'
      }
    ]
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'Medical API running', version: '1.0.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Medical API running on port ${PORT}`));

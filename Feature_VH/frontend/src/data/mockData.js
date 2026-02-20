export const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    experience: 15,
    consultations: 2450,
    rating: 4.9,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    available: true,
    education: "MD, Harvard Medical School",
    bio: "Specialized in interventional cardiology with focus on minimally invasive procedures."
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    speciality: "Pediatrician",
    experience: 12,
    consultations: 3200,
    rating: 4.8,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    available: true,
    education: "MD, Johns Hopkins University",
    bio: "Dedicated to comprehensive child healthcare and developmental pediatrics."
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    speciality: "Dermatologist",
    experience: 10,
    consultations: 1890,
    rating: 4.9,
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    available: false,
    education: "MD, Stanford University",
    bio: "Expert in cosmetic and medical dermatology with advanced laser therapy certification."
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    speciality: "Neurologist",
    experience: 18,
    consultations: 2100,
    rating: 4.7,
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    available: true,
    education: "MD, Yale School of Medicine",
    bio: "Specializing in neurological disorders and advanced brain imaging techniques."
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    speciality: "Anesthesiologist",
    experience: 14,
    consultations: 1650,
    rating: 4.8,
    photo: "https://randomuser.me/api/portraits/women/22.jpg",
    available: true,
    education: "MD, Columbia University",
    bio: "Expert in pain management and perioperative anesthesia care."
  },
  {
    id: 6,
    name: "Dr. David Thompson",
    speciality: "Cardiologist",
    experience: 20,
    consultations: 3100,
    rating: 4.9,
    photo: "https://randomuser.me/api/portraits/men/67.jpg",
    available: true,
    education: "MD, Mayo Clinic",
    bio: "Pioneering work in heart failure treatment and cardiac rehabilitation."
  }
];

export const mockAppointments = [
  {
    id: 1,
    patientName: "John Doe",
    patientAge: 35,
    patientGender: "Male",
    reason: "Chest pain and irregular heartbeat",
    date: "2026-02-20",
    time: "10:00 AM",
    status: "pending",
    type: "video"
  },
  {
    id: 2,
    patientName: "Alice Smith",
    patientAge: 28,
    patientGender: "Female",
    reason: "Skin rash and allergic reaction",
    date: "2026-02-20",
    time: "11:30 AM",
    status: "pending",
    type: "video"
  },
  {
    id: 3,
    patientName: "Robert Brown",
    patientAge: 45,
    patientGender: "Male",
    reason: "Chronic headaches and dizziness",
    date: "2026-02-21",
    time: "2:00 PM",
    status: "approved",
    type: "in-person"
  }
];

export const mockMedicines = [
  { id: 1, name: "Aspirin 100mg", category: "Pain Relief" },
  { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic" },
  { id: 3, name: "Lisinopril 10mg", category: "Blood Pressure" },
  { id: 4, name: "Metformin 500mg", category: "Diabetes" },
  { id: 5, name: "Atorvastatin 20mg", category: "Cholesterol" },
  { id: 6, name: "Omeprazole 20mg", category: "Acid Reflux" },
  { id: 7, name: "Cetirizine 10mg", category: "Allergy" },
  { id: 8, name: "Ibuprofen 400mg", category: "Pain Relief" },
];

export const mockPatientHistory = {
  medicalConditions: ["Hypertension", "Type 2 Diabetes"],
  allergies: ["Penicillin", "Peanuts"],
  previousVisits: [
    { date: "2025-12-15", doctor: "Dr. Sarah Johnson", reason: "Annual Checkup" },
    { date: "2025-10-20", doctor: "Dr. Michael Chen", reason: "Flu Symptoms" }
  ],
  currentMedications: ["Lisinopril 10mg", "Metformin 500mg"]
};

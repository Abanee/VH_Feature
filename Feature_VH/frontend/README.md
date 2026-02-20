# Virtual Hospital & Pharmacy Platform

A premium, modern virtual healthcare platform built with React, TailwindCSS, and Framer Motion.

## Features

- 🏥 Patient & Doctor Authentication
- 👨‍⚕️ Doctor Browsing & Booking
- 📅 Appointment Management
- 💊 Prescription & Pharmacy Integration
- 💬 Video Consultation with Chat
- 📱 Fully Responsive Design
- ✨ Premium UI/UX with Smooth Animations

## Tech Stack

- **React 18** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login & Registration
│   ├── patient/       # Patient Dashboard & Doctor Cards
│   ├── doctor/        # Doctor Dashboard & Appointments
│   ├── consultation/  # Video Call & Chat Room
│   └── shared/        # Reusable Components
├── store/             # Zustand State Management
├── data/              # Mock Data
└── App.jsx            # Main App with Routing
```

## Default Credentials

### Patient Account
- Email: patient@demo.com
- Password: patient123

### Doctor Account
- Email: doctor@demo.com
- Password: doctor123

## Color Palette

- **Navy Blue**: Primary dark (#0f172a)
- **Teal/Emerald**: Accent colors (#14b8a6)
- **Crisp White**: Backgrounds (#ffffff)

## License

MIT

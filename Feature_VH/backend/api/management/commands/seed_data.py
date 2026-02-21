"""
Seed the database with sample data matching the frontend mock data.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from api.models import User, DoctorProfile, PatientProfile, Medicine


class Command(BaseCommand):
    help = 'Seed the database with sample doctors, medicines, and test users'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # ── Create Admin ──────────────────────────────────────────────
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@virtualhospital.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('  ✓ Admin user created (admin / admin123)'))

        # ── Create Sample Doctors ─────────────────────────────────────
        doctors_data = [
            {
                'username': 'dr_sarah', 'first_name': 'Sarah', 'last_name': 'Johnson',
                'email': 'sarah@virtualhospital.com',
                'profile': {
                    'speciality': 'Cardiologist', 'experience': 15, 'consultations': 2450,
                    'rating': 4.9, 'available': True,
                    'education': 'MD, Harvard Medical School',
                    'bio': 'Specialized in interventional cardiology with focus on minimally invasive procedures.'
                }
            },
            {
                'username': 'dr_michael', 'first_name': 'Michael', 'last_name': 'Chen',
                'email': 'michael@virtualhospital.com',
                'profile': {
                    'speciality': 'Pediatrician', 'experience': 12, 'consultations': 3200,
                    'rating': 4.8, 'available': True,
                    'education': 'MD, Johns Hopkins University',
                    'bio': 'Dedicated to comprehensive child healthcare and developmental pediatrics.'
                }
            },
            {
                'username': 'dr_emily', 'first_name': 'Emily', 'last_name': 'Rodriguez',
                'email': 'emily@virtualhospital.com',
                'profile': {
                    'speciality': 'Dermatologist', 'experience': 10, 'consultations': 1890,
                    'rating': 4.9, 'available': False,
                    'education': 'MD, Stanford University',
                    'bio': 'Expert in cosmetic and medical dermatology with advanced laser therapy certification.'
                }
            },
            {
                'username': 'dr_james', 'first_name': 'James', 'last_name': 'Wilson',
                'email': 'james@virtualhospital.com',
                'profile': {
                    'speciality': 'Neurologist', 'experience': 18, 'consultations': 2100,
                    'rating': 4.7, 'available': True,
                    'education': 'MD, Yale School of Medicine',
                    'bio': 'Specializing in neurological disorders and advanced brain imaging techniques.'
                }
            },
            {
                'username': 'dr_priya', 'first_name': 'Priya', 'last_name': 'Sharma',
                'email': 'priya@virtualhospital.com',
                'profile': {
                    'speciality': 'Anesthesiologist', 'experience': 14, 'consultations': 1650,
                    'rating': 4.8, 'available': True,
                    'education': 'MD, Columbia University',
                    'bio': 'Expert in pain management and perioperative anesthesia care.'
                }
            },
            {
                'username': 'dr_david', 'first_name': 'David', 'last_name': 'Thompson',
                'email': 'david@virtualhospital.com',
                'profile': {
                    'speciality': 'Cardiologist', 'experience': 20, 'consultations': 3100,
                    'rating': 4.9, 'available': True,
                    'education': 'MD, Mayo Clinic',
                    'bio': 'Pioneering work in heart failure treatment and cardiac rehabilitation.'
                }
            },
        ]

        for doc_data in doctors_data:
            profile_data = doc_data.pop('profile')
            user, created = User.objects.get_or_create(
                username=doc_data['username'],
                defaults={**doc_data, 'role': 'doctor'}
            )
            if created:
                user.set_password('doctor123')
                user.save()
                DoctorProfile.objects.get_or_create(user=user, defaults=profile_data)
                self.stdout.write(f"  ✓ Doctor: {user.get_full_name()}")
            else:
                # Update profile if exists
                DoctorProfile.objects.update_or_create(user=user, defaults=profile_data)

        # ── Create Sample Patient ─────────────────────────────────────
        patient_user, created = User.objects.get_or_create(
            username='patient1',
            defaults={
                'email': 'patient@virtualhospital.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'patient',
                'phone': '+91 98765 43210',
            }
        )
        if created:
            patient_user.set_password('patient123')
            patient_user.save()
            PatientProfile.objects.get_or_create(
                user=patient_user,
                defaults={
                    'gender': 'Male',
                    'blood_group': 'O+',
                    'medical_conditions': 'Hypertension, Type 2 Diabetes',
                    'allergies': 'Penicillin, Peanuts',
                }
            )
            self.stdout.write(self.style.SUCCESS('  ✓ Patient: John Doe (patient1 / patient123)'))

        # ── Create Medicines ──────────────────────────────────────────
        medicines_data = [
            {'name': 'Aspirin 100mg', 'category': 'Pain Relief', 'price': 5.99},
            {'name': 'Amoxicillin 500mg', 'category': 'Antibiotic', 'price': 12.99},
            {'name': 'Lisinopril 10mg', 'category': 'Blood Pressure', 'price': 8.50},
            {'name': 'Metformin 500mg', 'category': 'Diabetes', 'price': 7.25},
            {'name': 'Atorvastatin 20mg', 'category': 'Cholesterol', 'price': 15.00},
            {'name': 'Omeprazole 20mg', 'category': 'Acid Reflux', 'price': 9.75},
            {'name': 'Cetirizine 10mg', 'category': 'Allergy', 'price': 4.50},
            {'name': 'Ibuprofen 400mg', 'category': 'Pain Relief', 'price': 6.25},
        ]

        for med_data in medicines_data:
            Medicine.objects.get_or_create(
                name=med_data['name'],
                defaults={**med_data, 'stock': 100}
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(medicines_data)} medicines seeded'))
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding complete!'))
        self.stdout.write('\nTest credentials:')
        self.stdout.write('  Admin:   admin / admin123')
        self.stdout.write('  Doctor:  dr_sarah / doctor123')
        self.stdout.write('  Patient: patient1 / patient123')

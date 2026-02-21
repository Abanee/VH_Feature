"""
Database models for the Virtual Hospital Platform.
"""
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


def validate_file_size_50mb(value):
    """Validate that uploaded file does not exceed 50 MB."""
    max_size = 50 * 1024 * 1024  # 50 MB
    if value.size > max_size:
        raise ValidationError(f'File size must not exceed 50 MB. Current size: {value.size / (1024*1024):.1f} MB.')


# ─── 1. Core / Independent Models ────────────────────────────────────────────

class User(AbstractUser):
    """Custom user with role-based access."""
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True, default='')
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class Medicine(models.Model):
    """Medicine catalogue."""
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='medicines/', blank=True, null=True)

    class Meta:
        db_table = 'medicines'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.category})"


# ─── 2. Profile Models (Depend on User) ──────────────────────────────────────

class DoctorProfile(models.Model):
    """Extended profile for doctors."""
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='doctor_profile')
    speciality = models.CharField(max_length=100, default='General')
    experience = models.PositiveIntegerField(default=0, help_text='Years of experience')
    bio = models.TextField(blank=True, default='')
    education = models.CharField(max_length=255, blank=True, default='')
    consultations = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='doctors/', blank=True, null=True)

    class Meta:
        db_table = 'doctor_profiles'

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} – {self.speciality}"


class PatientProfile(models.Model):
    """Extended profile for patients."""
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    BLOOD_GROUPS = (
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    )
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, default='')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, blank=True, default='')
    medical_conditions = models.TextField(blank=True, default='', help_text='Comma-separated conditions')
    allergies = models.TextField(blank=True, default='', help_text='Comma-separated allergies')
    image = models.ImageField(upload_to='patients/', blank=True, null=True)

    class Meta:
        db_table = 'patient_profiles'

    def __str__(self):
        return f"Patient: {self.user.get_full_name()}"


# ─── 3. Operations (Depend on Profiles & Users) ──────────────────────────────

class Appointment(models.Model):
    """Appointment between a patient and a doctor."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
    )
    TYPE_CHOICES = (
        ('video', 'Video Call'),
        ('in-person', 'In-Person'),
    )
    patient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='patient_appointments')
    
    # 👇 THE FIX: Added db_constraint=False to bypass TiDB's ALTER TABLE limitations
    doctor = models.ForeignKey('DoctorProfile', on_delete=models.CASCADE, related_name='doctor_appointments', db_constraint=False)
    
    date = models.DateField()
    time = models.CharField(max_length=10)
    reason = models.TextField(blank=True, default='')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    appointment_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='video')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Appointment #{self.pk} – {self.patient.get_full_name()} ↔ Dr. {self.doctor.user.get_full_name()}"


class Prescription(models.Model):
    """Prescription issued by a doctor for an appointment."""
    appointment = models.ForeignKey('Appointment', on_delete=models.CASCADE, related_name='prescriptions', null=True, blank=True)
    doctor = models.ForeignKey('User', on_delete=models.CASCADE, related_name='issued_prescriptions')
    patient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_prescriptions')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prescriptions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Rx #{self.pk} by Dr. {self.doctor.get_full_name()}"


class PrescriptionItem(models.Model):
    """Individual medicine entry in a prescription."""
    prescription = models.ForeignKey('Prescription', on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey('Medicine', on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100, blank=True, default='')
    frequency = models.CharField(max_length=100, blank=True, default='')
    duration = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        db_table = 'prescription_items'

    def __str__(self):
        return f"{self.medicine.name} – {self.dosage}"


class ChatMessage(models.Model):
    """Persisted chat message for a consultation."""
    appointment = models.ForeignKey('Appointment', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.timestamp:%H:%M}] {self.sender.get_full_name()}: {self.message[:50]}"


class CallRecording(models.Model):
    """Recorded call for an appointment (max 50 MB)."""
    appointment = models.ForeignKey('Appointment', on_delete=models.CASCADE, related_name='recordings')
    recording_file = models.FileField(upload_to='recordings/', validators=[validate_file_size_50mb])
    duration_seconds = models.PositiveIntegerField(default=0)
    file_size = models.PositiveIntegerField(default=0, help_text='File size in bytes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'call_recordings'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.recording_file:
            self.file_size = self.recording_file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Recording for Appointment #{self.appointment_id} ({self.file_size / (1024*1024):.1f} MB)"
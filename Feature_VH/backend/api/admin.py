"""Admin registration for all models."""
from django.contrib import admin
from .models import (
    User, DoctorProfile, PatientProfile, Medicine,
    Appointment, Prescription, PrescriptionItem,
    ChatMessage, CallRecording,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'speciality', 'experience', 'rating', 'available']
    list_filter = ['speciality', 'available']
    search_fields = ['user__first_name', 'user__last_name', 'speciality']


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'gender', 'blood_group']
    search_fields = ['user__first_name', 'user__last_name']


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock']
    list_filter = ['category']
    search_fields = ['name']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'date', 'time', 'status', 'appointment_type']
    list_filter = ['status', 'appointment_type', 'date']
    search_fields = ['patient__first_name', 'doctor__user__first_name']


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'doctor', 'patient', 'created_at']
    search_fields = ['doctor__first_name', 'patient__first_name']


@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ['prescription', 'medicine', 'dosage', 'frequency', 'duration']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'sender', 'message', 'timestamp']
    list_filter = ['timestamp']


@admin.register(CallRecording)
class CallRecordingAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'duration_seconds', 'file_size', 'created_at']

"""
DRF Serializers for the Virtual Hospital API.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, DoctorProfile, PatientProfile, Medicine,
    Appointment, Prescription, PrescriptionItem,
    ChatMessage, CallRecording,
)


# ─── User Serializers ────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Read serializer for user data."""
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'profile_image', 'name']
        read_only_fields = ['id', 'username']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'password', 'role', 'phone', 'profile_image']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Auto-create profile based on role
        if user.role == 'doctor':
            DoctorProfile.objects.create(user=user)
        elif user.role == 'patient':
            PatientProfile.objects.create(user=user)

        return user


# ─── Doctor Serializers ───────────────────────────────────────────────────────

class DoctorProfileSerializer(serializers.ModelSerializer):
    """Read serializer for doctor profiles."""
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'speciality', 'experience', 'bio', 'education',
                  'consultations', 'rating', 'available', 'image', 'name',
                  'photo', 'image_url']

    def get_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

    def get_photo(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return 'https://via.placeholder.com/150'

    def get_image_url(self, obj):
        return self.get_photo(obj)


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for doctor profiles."""
    class Meta:
        model = DoctorProfile
        fields = ['speciality', 'experience', 'bio', 'education', 'available', 'image']


# ─── Patient Serializers ─────────────────────────────────────────────────────

class PatientProfileSerializer(serializers.ModelSerializer):
    """Read serializer for patient profiles."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'date_of_birth', 'gender', 'blood_group',
                  'medical_conditions', 'allergies', 'image']


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for patient profiles."""
    class Meta:
        model = PatientProfile
        fields = ['date_of_birth', 'gender', 'blood_group',
                  'medical_conditions', 'allergies', 'image']


# ─── Medicine Serializers ─────────────────────────────────────────────────────

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'


# ─── Appointment Serializers ──────────────────────────────────────────────────

class AppointmentSerializer(serializers.ModelSerializer):
    """Read serializer with nested patient/doctor info."""
    patient = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    patientName = serializers.SerializerMethodField()
    doctorName = serializers.SerializerMethodField()
    type = serializers.CharField(source='appointment_type', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'doctor', 'date', 'time', 'reason',
                  'status', 'appointment_type', 'type', 'created_at',
                  'patientName', 'doctorName']
        read_only_fields = ['id', 'created_at']

    def get_patient(self, obj):
        return {
            'id': obj.patient.id,
            'user': {
                'first_name': obj.patient.first_name,
                'last_name': obj.patient.last_name,
            }
        }

    def get_doctor(self, obj):
        return {
            'id': obj.doctor.id,
            'user': {
                'first_name': obj.doctor.user.first_name,
                'last_name': obj.doctor.user.last_name,
            }
        }

    def get_patientName(self, obj):
        return obj.patient.get_full_name() or 'Unknown Patient'

    def get_doctorName(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}" if obj.doctor else 'Unknown Doctor'


class AppointmentCreateSerializer(serializers.Serializer):
    """Create serializer matching frontend payload exactly."""
    doctor_id = serializers.IntegerField()
    date = serializers.DateField()
    time = serializers.CharField(max_length=10)
    reason = serializers.CharField(required=False, default='')
    appointment_type = serializers.ChoiceField(
        choices=['video', 'in-person'], required=False, default='video'
    )

    def create(self, validated_data):
        request = self.context['request']
        doctor = DoctorProfile.objects.get(id=validated_data['doctor_id'])
        appointment = Appointment.objects.create(
            patient=request.user,
            doctor=doctor,
            date=validated_data['date'],
            time=validated_data['time'],
            reason=validated_data.get('reason', ''),
            appointment_type=validated_data.get('appointment_type', 'video'),
        )
        return appointment


# ─── Prescription Serializers ────────────────────────────────────────────────

class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)

    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medicine', 'medicine_name', 'dosage', 'frequency', 'duration']


class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = ['id', 'appointment', 'doctor', 'patient', 'notes',
                  'created_at', 'items', 'doctor_name', 'patient_name']
        read_only_fields = ['id', 'created_at', 'doctor']

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.get_full_name()}"

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()


class PrescriptionCreateSerializer(serializers.Serializer):
    """Create prescription with nested medicine items."""
    patient_id = serializers.IntegerField()
    appointment_id = serializers.IntegerField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, default='')
    medicines = serializers.ListField(child=serializers.DictField())

    def create(self, validated_data):
        request = self.context['request']
        medicines_data = validated_data.pop('medicines', [])

        prescription = Prescription.objects.create(
            doctor=request.user,
            patient_id=validated_data['patient_id'],
            appointment_id=validated_data.get('appointment_id'),
            notes=validated_data.get('notes', ''),
        )

        for med_data in medicines_data:
            # Find medicine by name or ID
            medicine_name = med_data.get('medicine', '')
            medicine = Medicine.objects.filter(name__icontains=medicine_name).first()
            if not medicine:
                # Create medicine on the fly if not found
                medicine = Medicine.objects.create(name=medicine_name)

            PrescriptionItem.objects.create(
                prescription=prescription,
                medicine=medicine,
                dosage=med_data.get('dosage', ''),
                frequency=med_data.get('frequency', ''),
                duration=med_data.get('duration', ''),
            )

        return prescription


# ─── Chat Serializers ─────────────────────────────────────────────────────────

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'appointment', 'sender', 'sender_name', 'sender_role',
                  'message', 'timestamp']
        read_only_fields = ['id', 'timestamp', 'sender']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


# ─── Call Recording Serializers ───────────────────────────────────────────────

class CallRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallRecording
        fields = ['id', 'appointment', 'recording_file', 'duration_seconds',
                  'file_size', 'created_at']
        read_only_fields = ['id', 'file_size', 'created_at']

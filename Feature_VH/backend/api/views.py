"""
API Views for the Virtual Hospital Platform.
"""
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Q

from .models import (
    User, DoctorProfile, PatientProfile, Medicine,
    Appointment, Prescription, PrescriptionItem,
    ChatMessage, CallRecording,
)
from .serializers import (
    UserSerializer, UserCreateSerializer,
    DoctorProfileSerializer, DoctorProfileUpdateSerializer,
    PatientProfileSerializer, PatientProfileUpdateSerializer,
    MedicineSerializer,
    AppointmentSerializer, AppointmentCreateSerializer,
    PrescriptionSerializer, PrescriptionCreateSerializer,
    ChatMessageSerializer,
    CallRecordingSerializer,
)
from .permissions import IsDoctor, IsPatient, IsAdmin


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """Root view to provide a welcome message and status."""
    return Response({
        'status': 'Online',
        'message': 'Welcome to the Virtual Hospital API',
        'endpoints': {
            'api_list': '/api/',
            'admin': '/admin/',
            'auth': '/api/token-auth/',
            'register': '/api/users/',
        }
    })


# ─── Auth: Register ──────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user and return JWT tokens."""
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Auth: Login (JWT) ───────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def token_auth(request):
    """Authenticate user via username OR email, and verify role."""
    login_id = request.data.get('username')  # Can be username or email
    password = request.data.get('password')
    role = request.data.get('role')  # Optional role enforcement

    if not login_id or not password:
        return Response(
            {'detail': 'Username/Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check against username or email
    user = User.objects.filter(Q(username=login_id) | Q(email=login_id)).first()

    if user is None:
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.check_password(password):
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Enforce role if requested (for separate login pages)
    if role and user.role != role:
         return Response(
            {'detail': f'Access denied: Not a {role} account.'},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'role': user.role,
        'user_id': user.id
    })


# ─── Current User Profile ────────────────────────────────────────────────────

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get or update the currently authenticated user's profile."""
    user = request.user

    if request.method == 'GET':
        data = UserSerializer(user, context={'request': request}).data
        # Include role-specific profile
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            data['doctor_profile'] = DoctorProfileSerializer(
                user.doctor_profile, context={'request': request}
            ).data
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            data['patient_profile'] = PatientProfileSerializer(
                user.patient_profile, context={'request': request}
            ).data
        return Response(data)

    # PUT/PATCH
    serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Doctors ──────────────────────────────────────────────────────────────────

class DoctorListView(generics.ListAPIView):
    """List all doctor profiles (public)."""
    queryset = DoctorProfile.objects.select_related('user').all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['speciality', 'user__first_name', 'user__last_name']
    pagination_class = None  # Return all doctors without pagination


class DoctorDetailView(generics.RetrieveUpdateAPIView):
    """Get or update a single doctor profile."""
    queryset = DoctorProfile.objects.select_related('user').all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return DoctorProfileUpdateSerializer
        return DoctorProfileSerializer


# ─── Patients ─────────────────────────────────────────────────────────────────

class PatientListView(generics.ListAPIView):
    """List all patient profiles (admin only)."""
    queryset = PatientProfile.objects.select_related('user').all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


# ─── Appointments ─────────────────────────────────────────────────────────────

class AppointmentViewSet(viewsets.ModelViewSet):
    """CRUD for appointments. Filtered by user role."""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related('patient', 'doctor__user')
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            return qs.filter(doctor=user.doctor_profile)
        elif user.role == 'patient':
            return qs.filter(patient=user)
        elif user.role == 'admin' or user.is_superuser:
            return qs.all()
        return qs.none()

    def create(self, request, *args, **kwargs):
        serializer = AppointmentCreateSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            appointment = serializer.save()
            return Response(
                AppointmentSerializer(appointment, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """Allow doctors to approve/decline appointments."""
        appointment = self.get_object()
        new_status = request.data.get('status')
        if new_status and new_status in ['approved', 'declined', 'completed']:
            appointment.status = new_status
            appointment.save()
            return Response(
                AppointmentSerializer(appointment, context={'request': request}).data
            )
        return Response(
            {'detail': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ─── Medicines ────────────────────────────────────────────────────────────────

class MedicineViewSet(viewsets.ModelViewSet):
    """CRUD for medicines. Viewable by all, editable by Admins only."""
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]


# ─── Prescriptions ───────────────────────────────────────────────────────────

class PrescriptionViewSet(viewsets.ModelViewSet):
    """CRUD for prescriptions."""
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        qs = Prescription.objects.select_related('doctor', 'patient').prefetch_related('items__medicine')
        if user.role == 'doctor':
            return qs.filter(doctor=user)
        elif user.role == 'patient':
            return qs.filter(patient=user)
        return qs.all()

    def create(self, request, *args, **kwargs):
        serializer = PrescriptionCreateSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            prescription = serializer.save()
            return Response(
                PrescriptionSerializer(prescription, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Chat Messages ───────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_history(request, appointment_id):
    """Get chat history or send a message for a specific appointment."""
    if request.method == 'POST':
        serializer = ChatMessageSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(sender=request.user, appointment_id=appointment_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    messages = ChatMessage.objects.filter(
        appointment_id=appointment_id
    ).select_related('sender').order_by('timestamp')
    serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data)


# ─── Call Recordings ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_recording(request):
    """Upload a call recording (max 50 MB)."""
    serializer = CallRecordingSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recordings(request, appointment_id):
    """Get recordings for an appointment."""
    recordings = CallRecording.objects.filter(appointment_id=appointment_id)
    serializer = CallRecordingSerializer(recordings, many=True, context={'request': request})
    return Response(serializer.data)


# ─── Admin Stats ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_stats(request):
    """Get platform statistics for admin dashboard."""
    from django.utils import timezone
    from datetime import timedelta

    total_doctors = DoctorProfile.objects.count()
    total_patients = PatientProfile.objects.count()
    total_appointments = Appointment.objects.count()
    pending_appointments = Appointment.objects.filter(status='pending').count()
    approved_appointments = Appointment.objects.filter(status='approved').count()
    total_medicines = Medicine.objects.count()

    # Active monitoring: users with last_login in last 15 minutes
    time_threshold = timezone.now() - timedelta(minutes=15)
    active_users = User.objects.filter(last_login__gte=time_threshold)
    
    online_doctors = []
    online_patients = []
    
    for u in active_users:
        user_data = {
            'id': u.id,
            'name': u.get_full_name() or u.username,
            'role': u.role,
            'last_active': u.last_login
        }
        if u.role == 'doctor':
            online_doctors.append(user_data)
        elif u.role == 'patient':
            online_patients.append(user_data)

    return Response({
        'total_doctors': total_doctors,
        'total_patients': total_patients,
        'total_appointments': total_appointments,
        'pending_appointments': pending_appointments,
        'approved_appointments': approved_appointments,
        'total_medicines': total_medicines,
        'online_doctors': online_doctors,
        'online_patients': online_patients,
    })

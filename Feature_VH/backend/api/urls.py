"""
URL routing for the Virtual Hospital API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'appointments', views.AppointmentViewSet, basename='appointments')
router.register(r'medicines', views.MedicineViewSet, basename='medicines')
router.register(r'prescriptions', views.PrescriptionViewSet, basename='prescriptions')

urlpatterns = [
    # Auth
    path('users/', views.register_user, name='register'),
    path('token-auth/', views.token_auth, name='token-auth'),
    path('users/me/', views.current_user, name='current-user'),

    # Doctors
    path('doctors/', views.DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', views.DoctorDetailView.as_view(), name='doctor-detail'),

    # Patients
    path('patients/', views.PatientListView.as_view(), name='patient-list'),

    # Chat
    path('chat/<int:appointment_id>/', views.chat_history, name='chat-history'),

    # Recordings
    path('recordings/', views.upload_recording, name='upload-recording'),
    path('recordings/<int:appointment_id>/', views.get_recordings, name='get-recordings'),

    # Admin
    path('admin/stats/', views.admin_stats, name='admin-stats'),

    # Router URLs
    path('', include(router.urls)),
]

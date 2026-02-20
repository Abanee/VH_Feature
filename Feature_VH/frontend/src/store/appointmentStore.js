import { create } from 'zustand';
import { appointmentAPI } from '../api/api';

const useAppointmentStore = create((set) => ({
  appointments: [],
  isLoading: false,
  error: null,

  fetchAppointments: async () => {
    set({ isLoading: true });
    try {
      const response = await appointmentAPI.getAll();
      const data = response.data;

      // Map API response to frontend structure
      const mappedData = data.map(apt => ({
        ...apt,
        patientName: apt.patient?.user ? `${apt.patient.user.first_name} ${apt.patient.user.last_name}` : 'Unknown Patient',
        doctorName: apt.doctor?.user ? `Dr. ${apt.doctor.user.first_name} ${apt.doctor.user.last_name}` : 'Unknown Doctor',
      }));

      set({ appointments: mappedData, isLoading: false });
    } catch (error) {
      console.error("Fetch appointments error:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  addAppointment: async (appointment) => {
    set({ isLoading: true });
    try {
      // Map frontend keys to backend schema
      const payload = {
        doctor_id: appointment.doctorId,
        date: appointment.date,
        time: appointment.time, // Ensure HH:MM format
        reason: appointment.reason,
        appointment_type: appointment.type,
      };

      const response = await appointmentAPI.create(payload);
      const newAppointment = response.data;

      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error("Add appointment error:", error);
      set({ error: error.response?.data?.detail || 'Failed to book appointment', isLoading: false });
      return false;
    }
  },

  updateAppointmentStatus: async (id, newStatus) => {
    try {
      await appointmentAPI.updateStatus(id, newStatus);
      set((state) => ({
        appointments: state.appointments.map(apt =>
          apt.id === id ? { ...apt, status: newStatus } : apt
        )
      }));
      return true;
    } catch (error) {
      console.error("Update appointment status error:", error);
      return false;
    }
  },

  getAppointmentsByStatus: (status) => {
    return (state) => state.appointments.filter(apt => apt.status === status);
  }
}));

export default useAppointmentStore;

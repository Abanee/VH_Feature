import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, User } from 'lucide-react';
import { medicineAPI, patientAPI, prescriptionAPI } from '../../api/api';
import useAuthStore from '../../store/authStore';

const PrescriptionForm = () => {
  const [prescribedMeds, setPrescribedMeds] = useState([
    { medicine: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await medicineAPI.getAll();
        const data = response.data.results || response.data;
        setMedicines(data);
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
      }
    };

    const fetchPatients = async () => {
      try {
        const response = await patientAPI.getAll();
        setPatients(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };

    fetchMedicines();
    fetchPatients();
  }, []);

  const addMedicine = () => {
    setPrescribedMeds([...prescribedMeds, { medicine: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index) => {
    setPrescribedMeds(prescribedMeds.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...prescribedMeds];
    updated[index][field] = value;
    setPrescribedMeds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      setSaveMessage('Please select a patient');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const payload = {
        patient_id: parseInt(selectedPatient),
        notes,
        medicines: prescribedMeds.map(med => ({
          medicine: med.medicine,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
        })),
      };

      await prescriptionAPI.create(payload);
      setSaveMessage('Prescription saved successfully!');
      setPrescribedMeds([{ medicine: '', dosage: '', frequency: '', duration: '' }]);
      setNotes('');
      setSelectedPatient('');
    } catch (error) {
      console.error('Failed to save prescription:', error);
      setSaveMessage('Failed to save prescription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Patient Prescription</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Select Patient</h3>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.user?.id || p.id}>
                    {p.user ? `${p.user.first_name} ${p.user.last_name}` : `Patient #${p.id}`}
                    {p.blood_group ? ` (${p.blood_group})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-navy-900">Prescribed Medicines</label>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-4">
              {prescribedMeds.map((med, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-navy-50 p-4 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Medicine
                      </label>
                      <select
                        value={med.medicine}
                        onChange={(e) => updateMedicine(index, 'medicine', e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select medicine</option>
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.name}>
                            {medicine.name} {medicine.category ? `(${medicine.category})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="input-field"
                        placeholder="e.g., 1 tablet"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                          className="input-field"
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>
                      {prescribedMeds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-lg font-semibold text-navy-900 mb-3">
              Additional Notes & Instructions
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
              className="input-field resize-none"
              placeholder="Add any special instructions, precautions, or follow-up recommendations..."
            />
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg text-sm font-medium ${saveMessage.includes('success')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {saveMessage}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 btn-primary disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Prescription'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PrescriptionForm;

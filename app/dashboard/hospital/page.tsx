'use client';

import { useState, useEffect } from 'react';
import { Building, Users, Calendar, Bed, Droplet, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  specialties: string[];
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  qualification: string;
  consultationFee: number;
  availableSlots: string[];
}

interface Appointment {
  _id: string;
  patientId: { name: string; email: string; phone: string };
  doctorId: { name: string; specialization: string };
  appointmentDate: string;
  timeSlot: string;
  status: string;
  symptoms: string;
}

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState({ status: '', date: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [showBloodForm, setShowBloodForm] = useState(false);

  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    specialties: '',
  });

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: '',
    availableSlots: '',
  });

  const [bedForm, setBedForm] = useState({
    generalBeds: { total: '', available: '' },
    icuBeds: { total: '', available: '' },
  });

  const [bloodForm, setBloodForm] = useState({
    bloodType: 'A+',
    units: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams(filters);
      const [hospitalRes, doctorsRes, appointmentsRes] = await Promise.all([
        fetch('/api/hospitals/profile'),
        fetch('/api/doctors'),
        fetch(`/api/appointments?${params}`),
      ]);

      const hospitalData = await hospitalRes.json();
      const doctorsData = await doctorsRes.json();
      const appointmentsData = await appointmentsRes.json();

      if (hospitalData.hospital) {
        setHospital(hospitalData.hospital);
        setHospitalForm({
          name: hospitalData.hospital.name || '',
          address: hospitalData.hospital.address || '',
          phone: hospitalData.hospital.phone || '',
          email: hospitalData.hospital.email || '',
          description: hospitalData.hospital.description || '',
          specialties: hospitalData.hospital.specialties?.join(', ') || '',
        });
      }

      setDoctors(doctorsData.doctors || []);
      const appts = appointmentsData.appointments || [];
      setAppointments(appts);
      setFilteredAppointments(appts);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/hospitals/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hospitalForm,
          specialties: hospitalForm.specialties.split(',').map(s => s.trim()).filter(s => s),
        }),
      });

      if (response.ok) {
        toast.success('Hospital profile updated successfully!');
        setShowHospitalForm(false);
        fetchData();
      } else {
        toast.error('Failed to update hospital profile');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...doctorForm,
          experience: parseInt(doctorForm.experience),
          consultationFee: parseInt(doctorForm.consultationFee),
          availableSlots: doctorForm.availableSlots.split(',').map(s => s.trim()).filter(s => s),
        }),
      });

      if (response.ok) {
        toast.success('Doctor added successfully!');
        setShowDoctorForm(false);
        setDoctorForm({
          name: '',
          specialization: '',
          experience: '',
          qualification: '',
          consultationFee: '',
          availableSlots: '',
        });
        fetchData();
      } else {
        toast.error('Failed to add doctor');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleBedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/beds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generalBeds: {
            total: parseInt(bedForm.generalBeds.total),
            available: parseInt(bedForm.generalBeds.available),
          },
          icuBeds: {
            total: parseInt(bedForm.icuBeds.total),
            available: parseInt(bedForm.icuBeds.available),
          },
        }),
      });

      if (response.ok) {
        toast.success('Bed availability updated successfully!');
        setShowBedForm(false);
      } else {
        toast.error('Failed to update bed availability');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleBloodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/blood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodType: bloodForm.bloodType,
          units: parseInt(bloodForm.units),
        }),
      });

      if (response.ok) {
        toast.success('Blood inventory updated successfully!');
        setShowBloodForm(false);
        setBloodForm({ bloodType: 'A+', units: '' });
      } else {
        toast.error('Failed to update blood inventory');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleAppointmentUpdate = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Appointment updated successfully!');
        fetchData();
      } else {
        toast.error('Failed to update appointment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hospital Dashboard
        </h1>
        <p className="text-gray-600">Manage your hospital operations</p>
      </div>

      {/* Stats */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowHospitalForm(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
          >
            <Building className="w-6 h-6 mr-2 text-gray-500" />
            Update Profile
          </button>
          <button
            onClick={() => setShowDoctorForm(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
          >
            <Plus className="w-6 h-6 mr-2 text-gray-500" />
            Add Doctor
          </button>
          <button
            onClick={() => setShowBedForm(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
          >
            <Bed className="w-6 h-6 mr-2 text-gray-500" />
            Update Beds
          </button>
          <button
            onClick={() => setShowBloodForm(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
          >
            <Droplet className="w-6 h-6 mr-2 text-gray-500" />
            Update Blood
          </button>
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Appointments</h2>
        </div>
        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 10).map((appointment) => (
                <div key={appointment._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.patientId.name}
                      </h3>
                      <p className="text-gray-600">
                        Dr. {appointment.doctorId.name} - {appointment.doctorId.specialization}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.patientId.email} | {appointment.patientId.phone}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {appointment.timeSlot}
                    </div>
                  </div>
                  {appointment.symptoms && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                      <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                    </div>
                  )}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAppointmentUpdate(appointment._id, 'confirmed')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleAppointmentUpdate(appointment._id, 'rejected')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleAppointmentUpdate(appointment._id, 'completed')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Profile Modal */}
      {showHospitalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Hospital Profile</h3>
            <form onSubmit={handleHospitalSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Hospital Name"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hospitalForm.name}
                onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
              />
              <textarea
                placeholder="Address"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={hospitalForm.address}
                onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hospitalForm.phone}
                onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hospitalForm.email}
                onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={hospitalForm.description}
                onChange={(e) => setHospitalForm({ ...hospitalForm, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Specialties (comma separated)"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hospitalForm.specialties}
                onChange={(e) => setHospitalForm({ ...hospitalForm, specialties: e.target.value })}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowHospitalForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Form Modal */}
      {showDoctorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Doctor</h3>
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Doctor Name"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Specialization"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
              />
              <input
                type="number"
                placeholder="Experience (years)"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={doctorForm.experience}
                onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
              />
              <input
                type="text"
                placeholder="Qualification"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={doctorForm.qualification}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
              />
              <input
                type="number"
                placeholder="Consultation Fee"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={doctorForm.consultationFee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
              />
              <input
                type="text"
                placeholder="Available Slots (e.g., 09:00, 10:00, 11:00)"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={doctorForm.availableSlots}
                onChange={(e) => setDoctorForm({ ...doctorForm, availableSlots: e.target.value })}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Add Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setShowDoctorForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Form Modal */}
      {showBedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Bed Availability</h3>
            <form onSubmit={handleBedSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">General Beds</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Total"
                    required
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bedForm.generalBeds.total}
                    onChange={(e) => setBedForm({
                      ...bedForm,
                      generalBeds: { ...bedForm.generalBeds, total: e.target.value }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Available"
                    required
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bedForm.generalBeds.available}
                    onChange={(e) => setBedForm({
                      ...bedForm,
                      generalBeds: { ...bedForm.generalBeds, available: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ICU Beds</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Total"
                    required
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bedForm.icuBeds.total}
                    onChange={(e) => setBedForm({
                      ...bedForm,
                      icuBeds: { ...bedForm.icuBeds, total: e.target.value }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Available"
                    required
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bedForm.icuBeds.available}
                    onChange={(e) => setBedForm({
                      ...bedForm,
                      icuBeds: { ...bedForm.icuBeds, available: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Update Beds
                </button>
                <button
                  type="button"
                  onClick={() => setShowBedForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blood Form Modal */}
      {showBloodForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Blood Inventory</h3>
            <form onSubmit={handleBloodSubmit} className="space-y-4">
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={bloodForm.bloodType}
                onChange={(e) => setBloodForm({ ...bloodForm, bloodType: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Units Available"
                required
                min="0"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={bloodForm.units}
                onChange={(e) => setBloodForm({ ...bloodForm, units: e.target.value })}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Update Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setShowBloodForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Bed, Droplet, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
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

export default function HospitalDetail() {
  const params = useParams();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bedAvailability, setBedAvailability] = useState<any>(null);
  const [bloodInventory, setBloodInventory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Appointment booking state
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    timeSlot: '',
    symptoms: '',
  });

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHospitalData();
    fetchReviews();
  }, [params.id]);

  const fetchHospitalData = async () => {
    try {
      const response = await fetch(`/api/hospitals/${params.id}`);
      const data = await response.json();
      setHospital(data.hospital);
      setDoctors(data.doctors || []);
      setBedAvailability(data.bedAvailability);
      setBloodInventory(data.bloodInventory || []);
    } catch (error) {
      toast.error('Failed to load hospital data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?hospitalId=${params.id}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'patient') {
      toast.error('Please login as a patient to book appointments');
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: params.id,
          doctorId: selectedDoctor?._id,
          ...appointmentData,
        }),
      });

      if (response.ok) {
        toast.success('Appointment booked successfully!');
        setShowBooking(false);
        setAppointmentData({ appointmentDate: '', timeSlot: '', symptoms: '' });
      } else {
        toast.error('Failed to book appointment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'patient') {
      toast.error('Please login as a patient to submit reviews');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: params.id,
          ...reviewData,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewData({ rating: 5, comment: '' });
        fetchReviews();
        fetchHospitalData();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Hospital not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hospital Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>
            <p className="text-gray-600 mb-2">{hospital.address}</p>
            <p className="text-gray-600 mb-2">Phone: {hospital.phone}</p>
            <p className="text-gray-600 mb-4">Email: {hospital.email}</p>
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="text-lg font-semibold">{hospital.rating.toFixed(1)}</span>
              <span className="text-gray-600 ml-2">({hospital.totalReviews} reviews)</span>
            </div>
          </div>
          {user && user.role === 'patient' && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Write Review
            </button>
          )}
        </div>
        {hospital.description && (
          <p className="text-gray-700 mb-4">{hospital.description}</p>
        )}
        {hospital.specialties && hospital.specialties.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Specialties:</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Bed Availability */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            Bed Availability
          </h2>
          {bedAvailability ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>General Beds:</span>
                <span className="font-semibold">
                  {bedAvailability.generalBeds.available}/{bedAvailability.generalBeds.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ICU Beds:</span>
                <span className="font-semibold">
                  {bedAvailability.icuBeds.available}/{bedAvailability.icuBeds.total}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No bed availability data</p>
          )}
        </div>

        {/* Blood Inventory */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Droplet className="w-5 h-5 mr-2" />
            Blood Inventory
          </h2>
          {bloodInventory.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {bloodInventory.map((blood) => (
                <div key={blood.bloodType} className="flex justify-between">
                  <span>{blood.bloodType}:</span>
                  <span className="font-semibold">{blood.units} units</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No blood inventory data</p>
          )}
        </div>
      </div>

      {/* Doctors */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Doctors
        </h2>
        {doctors.length > 0 ? (
          <div className="grid gap-4">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500">{doctor.qualification}</p>
                    <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
                    <p className="text-sm font-semibold text-green-600">
                      Consultation Fee: ₹{doctor.consultationFee}
                    </p>
                  </div>
                  {user && user.role === 'patient' && (
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowBooking(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Book Appointment
                    </button>
                  )}
                </div>
                {doctor.availableSlots && doctor.availableSlots.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Available Slots:</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.availableSlots.map((slot, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No doctors available</p>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold">{review.patientId?.name}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                {review.response && (
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold">Hospital Response:</p>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet</p>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Book Appointment with Dr. {selectedDoctor.name}
            </h3>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={appointmentData.appointmentDate}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Slot</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={appointmentData.timeSlot}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, timeSlot: e.target.value })
                  }
                >
                  <option value="">Select a time slot</option>
                  {selectedDoctor.availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Symptoms</label>
                <textarea
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={appointmentData.symptoms}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, symptoms: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={reviewData.rating}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, rating: parseInt(e.target.value) })
                  }
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
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
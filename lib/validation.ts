import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'hospital']),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const hospitalSchema = z.object({
  name: z.string().min(2, 'Hospital name is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  description: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

export const doctorSchema = z.object({
  name: z.string().min(2, 'Doctor name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  experience: z.number().min(0, 'Experience must be positive'),
  qualification: z.string().min(2, 'Qualification is required'),
  consultationFee: z.number().min(0, 'Fee must be positive'),
  availableSlots: z.array(z.string()).optional(),
});

export const appointmentSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  symptoms: z.string().optional(),
});
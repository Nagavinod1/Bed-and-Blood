'use client';

import Link from 'next/link';
import { Heart, Users, Calendar, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by checking for token in cookies
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        setIsLoggedIn(response.ok);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getStartedHref = isLoggedIn ? '/dashboard/patient' : '/auth/login';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hospital Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect patients with hospitals for better healthcare management
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={getStartedHref}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/hospitals"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Find Hospitals
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Healthcare Access</h3>
          <p className="text-gray-600">Easy access to quality healthcare services</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Expert Doctors</h3>
          <p className="text-gray-600">Connect with qualified medical professionals</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600">Book appointments with just a few clicks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Quality Care</h3>
          <p className="text-gray-600">Rated hospitals and trusted reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Search Hospitals</h3>
            <p className="text-gray-600">Find hospitals near you with available services</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Book Appointment</h3>
            <p className="text-gray-600">Schedule appointments with available doctors</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Get Treatment</h3>
            <p className="text-gray-600">Receive quality healthcare services</p>
          </div>
        </div>
      </div>
    </div>
  );
}
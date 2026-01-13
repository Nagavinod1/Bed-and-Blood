'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, MapPin, Filter } from 'lucide-react';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  city: string;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const cities = ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Kadapa', 'Anantapur', 'Kurnool', 'Warangal'];
  const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'Gastroenterology', 'Psychiatry'];

  const searchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        city: cityFilter,
        specialization: specializationFilter,
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/hospitals/search?${params}`);
      const data = await response.json();
      setHospitals(data.hospitals || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchHospitals();
  }, [cityFilter, specializationFilter, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchHospitals();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCityFilter('');
    setSpecializationFilter('');
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Hospitals</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hospitals by name, specialty, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {hospitals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hospitals found. Try a different search term.</p>
          </div>
        ) : (
          hospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{hospital.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hospital.address}</span>
                  </div>
                  {hospital.city && (
                    <div className="text-sm text-blue-600 mb-2">
                      📍 {hospital.city}
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {hospital.rating.toFixed(1)} ({hospital.totalReviews} reviews)
                    </span>
                  </div>
                </div>
                <Link
                  href={`/hospitals/${hospital._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
              {hospital.specialties && hospital.specialties.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
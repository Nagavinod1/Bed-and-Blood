'use client';

import { useState, useEffect } from 'react';
import { Droplet, MapPin, Phone, RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface BloodBank {
  _id: string;
  state: string;
  district: string;
  bloodBankName: string;
  category: string;
  address: string;
  contactNumber: string;
  bloodGroups: {
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'O+': number;
    'O-': number;
    'AB+': number;
    'AB-': number;
  };
  lastUpdated: string;
  source: string;
}

export default function BloodAvailability() {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const locations = ['Kadapa', 'Anantapur', 'Kurnool', 'Hyderabad', 'Warangal', 'Vijayawada', 'Visakhapatnam'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const fetchBloodAvailability = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLocation) params.append('location', selectedLocation);
      if (selectedBloodGroup) params.append('bloodGroup', selectedBloodGroup);
      
      const response = await fetch(`/api/blood/availability?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setBloodBanks(data.bloodBanks || []);
      } else {
        toast.error('Failed to fetch blood availability data');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const syncEraktKoshData = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/blood/eraktkosh', {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Blood availability data synced successfully!');
        fetchBloodAvailability();
      } else {
        toast.error('Failed to sync data');
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchBloodAvailability();
  }, [selectedLocation, selectedBloodGroup]);

  const getAvailabilityColor = (units: number) => {
    if (units === 0) return 'text-red-600 bg-red-50';
    if (units < 10) return 'text-orange-600 bg-orange-50';
    if (units < 25) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Droplet className="w-8 h-8 text-red-500" />
            Blood Availability
          </h1>
          <button
            onClick={syncEraktKoshData}
            disabled={syncing}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync eRaktKosh'}
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Real-time blood availability across Andhra Pradesh and Telangana blood banks
        </p>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Group</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedLocation('');
                    setSelectedBloodGroup('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blood availability data...</p>
        </div>
      ) : bloodBanks.length === 0 ? (
        <div className="text-center py-12">
          <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">No blood banks found</p>
          <button
            onClick={syncEraktKoshData}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Sync Data from eRaktKosh
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bloodBanks.map((bank) => (
            <div key={bank._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{bank.bloodBankName}</h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{bank.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{bank.contactNumber}</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    📍 {bank.district}, {bank.state} • {bank.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Last Updated: {new Date(bank.lastUpdated).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    Source: {bank.source}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Blood Group Availability</h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {bloodGroups.map((group) => (
                    <div
                      key={group}
                      className={`text-center p-3 rounded-lg border ${getAvailabilityColor(bank.bloodGroups[group as keyof typeof bank.bloodGroups])}`}
                    >
                      <div className="font-bold text-lg">{group}</div>
                      <div className="text-sm font-medium">{bank.bloodGroups[group as keyof typeof bank.bloodGroups]} units</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {bank.contactNumber && (
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`tel:${bank.contactNumber}`}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 inline-flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contact Blood Bank
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
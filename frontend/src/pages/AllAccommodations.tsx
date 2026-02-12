import React, { useState, useEffect } from 'react';
import { accommodationAPI } from '../api';
import { toast } from 'react-hot-toast';

interface Accommodation {
  _id: string;
  name: string;
  email: string;
  uniqueId: string;
  college: string;
  residentialAddress: string;
  city: string;
  phone: string;
  gender: string;
  day?: string;
  remarks?: string;
  vacated: boolean;
  optin: boolean;
  allocated: boolean;
}

const AllAccommodations: React.FC = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarksInput, setRemarksInput] = useState('');
  const [updatingRemarks, setUpdatingRemarks] = useState(false);

  useEffect(() => {
    fetchAllAccommodations();
  }, []);

  const fetchAllAccommodations = async () => {
    try {
      const response = await accommodationAPI.getAll();
      setAccommodations(response.data);
    } catch (error: any) {
      console.error('Error fetching accommodations:', error);
      toast.error('Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setRemarksInput(accommodation.remarks || '');
    setShowRemarksModal(true);
  };

  const handleUpdateRemarks = async () => {
    if (!selectedAccommodation) return;

    try {
      setUpdatingRemarks(true);
      await accommodationAPI.update(selectedAccommodation.uniqueId, {
        remarks: remarksInput.trim()
      });
      
      // Update local state
      setAccommodations(prev => 
        prev.map(acc => 
          acc.uniqueId === selectedAccommodation.uniqueId 
            ? { ...acc, remarks: remarksInput.trim() }
            : acc
        )
      );
      
      toast.success('Remarks updated successfully');
      setShowRemarksModal(false);
      setSelectedAccommodation(null);
      setRemarksInput('');
    } catch (error: any) {
      console.error('Error updating remarks:', error);
      toast.error(error.message || 'Failed to update remarks');
    } finally {
      setUpdatingRemarks(false);
    }
  };

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 via-purple-900/20 to-black min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-purple-500"></div>
            <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-900 via-purple-900/20 to-black min-h-screen relative overflow-hidden tomorrow-regular">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 tomorrow-bold">All Accommodations</h1>
          <p className="text-gray-400 mt-1">View all registered accommodation members</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-purple-500/30">
          <div className="grid grid-cols-1 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search by name, email, or unique ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-purple-500/30 rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-400">
            Showing {filteredAccommodations.length} of {accommodations.length} accommodations
          </div>
        </div>

        {/* Accommodation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccommodations.map((accommodation) => (
            <div
              key={accommodation._id}
              onClick={() => handleCardClick(accommodation)}
              className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 shadow-2xl hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer border border-purple-500/30 hover:border-pink-500/50 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 text-lg truncate">
                    {accommodation.name}
                  </h3>
                  <p className="text-sm text-gray-400">{accommodation.uniqueId}</p>
                  {accommodation.remarks && (
                    <p className="text-xs text-purple-300 italic mt-1 line-clamp-2">
                      "{accommodation.remarks}"
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="capitalize">{accommodation.gender}</span>
                </div>
                {accommodation.day && (
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Feb {accommodation.day}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAccommodations.length === 0 && (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-12 text-center border border-purple-500/30">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-2">No accommodations found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Remarks Edit Modal */}
        {showRemarksModal && selectedAccommodation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl w-full max-w-md shadow-2xl border border-purple-500/30">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 p-6 border-b border-purple-500/20">
                <div>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                    Edit Remarks
                  </h2>
                  <p className="text-purple-300 text-sm">{selectedAccommodation.name} ({selectedAccommodation.uniqueId})</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  placeholder="Enter remarks..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Footer */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 flex justify-end space-x-3 border-t border-purple-500/20">
                <button
                  onClick={() => {
                    setShowRemarksModal(false);
                    setSelectedAccommodation(null);
                    setRemarksInput('');
                  }}
                  disabled={updatingRemarks}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRemarks}
                  disabled={updatingRemarks}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {updatingRemarks && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  <span>{updatingRemarks ? 'Saving...' : 'Save Remarks'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAccommodations;
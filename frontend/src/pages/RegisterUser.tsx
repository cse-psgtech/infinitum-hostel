import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { userAPI, accommodationAPI } from '../api';
import { Search, UserPlus, CheckCircle, XCircle } from 'lucide-react';

interface User {
  _id: string;
  uniqueId: string;
  email: string;
  name: string;
  profilePhoto?: string;
  isPSGStudent: boolean;
  college: string;
  department?: string;
  year?: number;
  phone: string;
  verified: boolean;
  generalFeePaid: boolean;
  workshopFeePaid: boolean;
}

const RegisterUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  // Form fields
  const [city, setCity] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response);
      setFilteredUsers(response);
      toast.success(`Loaded ${response.length} users`);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowRegistrationForm(true);
    // Reset form fields
    setCity('');
    setResidentialAddress('');
    setGender('male');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    if (!city.trim() || !residentialAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const registrationData = {
        name: selectedUser.name,
        email: selectedUser.email,
        uniqueId: selectedUser.uniqueId,
        college: selectedUser.college,
        residentialAddress: residentialAddress.trim(),
        city: city.trim(),
        phone: selectedUser.phone,
        gender: gender,
        optin: false,
      };

      await accommodationAPI.register(registrationData);
      
      toast.success(`Successfully registered ${selectedUser.name} for accommodation!`);
      
      // Reset form
      setShowRegistrationForm(false);
      setSelectedUser(null);
      setCity('');
      setResidentialAddress('');
      setGender('male');
      
    } catch (error: any) {
      console.error('Error registering user:', error);
      toast.error(error.message || 'Failed to register user for accommodation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowRegistrationForm(false);
    setSelectedUser(null);
    setCity('');
    setResidentialAddress('');
    setGender('male');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
            Register User for Accommodation
          </h1>
          <p className="text-gray-400">Search and select a user to register for accommodation</p>
        </div>

        {!showRegistrationForm ? (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or Infinitum ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 hover:bg-gray-800/70 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start space-x-4">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30 group-hover:border-purple-500/50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-purple-500/30 group-hover:border-purple-500/50">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-sm text-purple-400 font-mono">{user.uniqueId}</p>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        {user.verified && (
                          <span className="flex items-center text-xs text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                        {user.generalFeePaid && (
                          <span className="flex items-center text-xs text-blue-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400 truncate">
                      <span className="font-semibold">College:</span> {user.college}
                    </p>
                    {user.department && (
                      <p className="text-xs text-gray-400 truncate">
                        <span className="font-semibold">Dept:</span> {user.department}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold">Phone:</span> {user.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No users found matching your search</p>
              </div>
            )}
          </>
        ) : (
          /* Registration Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Register for Accommodation
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* User Info Display */}
              <div className="bg-gray-900/50 border border-purple-500/20 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  {selectedUser?.profilePhoto ? (
                    <img
                      src={selectedUser.profilePhoto}
                      alt={selectedUser.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                      {selectedUser?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedUser?.name}</h3>
                    <p className="text-purple-400 font-mono">{selectedUser?.uniqueId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{selectedUser?.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400">College</p>
                    <p className="text-white">{selectedUser?.college}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Residential Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Residential Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.target.value)}
                    placeholder="Enter residential address"
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="text-white">Male</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="text-white">Female</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Register for Accommodation</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterUser;

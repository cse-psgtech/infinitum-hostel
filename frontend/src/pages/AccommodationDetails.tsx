import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { accommodationAPI } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import { useScanner } from "./ScannerContext";





// Custom OTP Input Component
const OtpInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  numInputs: number;
}> = ({ value, onChange, numInputs }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Only allow digits

    const newValue = value.split('');
    newValue[index] = val;
    const updatedValue = newValue.join('').slice(0, numInputs);
    onChange(updatedValue);

    // Auto-focus next input
    if (val && index < numInputs - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex space-x-2">
      {Array.from({ length: numInputs }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 md:w-16 md:h-16 text-center text-xl md:text-2xl font-bold border-2 border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800/50 text-white"
        />
      ))}
    </div>
  );
};

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

const AccommodationDetails: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'uniqueId' | 'email'>('uniqueId');
  const [emailValue, setEmailValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [accommodationData, setAccommodationData] = useState<Accommodation | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [updatingDay, setUpdatingDay] = useState(false);
  const [updatingAllocated, setUpdatingAllocated] = useState(false);
  const [updatingVacated, setUpdatingVacated] = useState(false);



  // Fetch accommodation by unique ID
  const fetchByUniqueId = async (uniqueId: string) => {
    if (uniqueId.length !== 4) return;

    setLoading(true);
    try {
      const response = await accommodationAPI.getByUniqueId(`INF${uniqueId}`);
      setAccommodationData(response.data.accommodation);
      setSelectedDay(response.data.accommodation.day || '');
      toast.success('Accommodation details loaded successfully');
    } catch (error: any) {
      console.error('Error fetching accommodation:', error);
      toast.error(error.message || 'Failed to fetch accommodation details');
      setAccommodationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch accommodation by email
  const fetchByEmail = async () => {
    if (!emailValue.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await accommodationAPI.getByEmail(emailValue.trim());
      setAccommodationData(response.data.accommodation);
      setSelectedDay(response.data.accommodation.day || '');
      toast.success('Accommodation details loaded successfully');
    } catch (error: any) {
      console.error('Error fetching accommodation:', error);
      toast.error(error.message || 'Failed to fetch accommodation details');
      setAccommodationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Update day only (for already allocated accommodations)
  const handleUpdateDay = async () => {
    if (!accommodationData || !selectedDay) return;

    try {
      setUpdatingDay(true);
      await accommodationAPI.update(accommodationData.uniqueId, { day: selectedDay });
      
      setAccommodationData(prev => prev ? { ...prev, day: selectedDay } : null);
      toast.success('Accommodation days updated successfully');
    } catch (error: any) {
      console.error('Error updating day:', error);
      toast.error(error.message || 'Failed to update accommodation days');
    } finally {
      setUpdatingDay(false);
    }
  };

  // Allocate with selected days (combined action)
  const handleAllocateWithDays = async () => {
    if (!accommodationData || !selectedDay) {
      toast.error('Please select accommodation days first');
      return;
    }

    try {
      setUpdatingAllocated(true);
      await accommodationAPI.update(accommodationData.uniqueId, { 
        day: selectedDay,
        allocated: true 
      });
      
      setAccommodationData(prev => prev ? { ...prev, day: selectedDay, allocated: true } : null);
      toast.success('Accommodation allocated successfully');
    } catch (error: any) {
      console.error('Error allocating accommodation:', error);
      toast.error(error.message || 'Failed to allocate accommodation');
    } finally {
      setUpdatingAllocated(false);
    }
  };

  const handleRevertAllocation = async () => {
    if (!accommodationData) return;

    try {
      setUpdatingAllocated(true);
      await accommodationAPI.update(accommodationData.uniqueId, { allocated: false });
      
      setAccommodationData(prev => prev ? { ...prev, allocated: false } : null);
      toast.success('Allocation reverted successfully');
    } catch (error: any) {
      console.error('Error reverting allocation:', error);
      toast.error(error.message || 'Failed to revert allocation');
    } finally {
      setUpdatingAllocated(false);
    }
  };

  const handleVacate = async () => {
    if (!accommodationData) return;

    try {
      setUpdatingVacated(true);
      await accommodationAPI.update(accommodationData.uniqueId, { vacated: true });
      
      setAccommodationData(prev => prev ? { ...prev, vacated: true } : null);
      toast.success('Marked as vacated successfully');
    } catch (error: any) {
      console.error('Error marking as vacated:', error);
      toast.error(error.message || 'Failed to mark as vacated');
    } finally {
      setUpdatingVacated(false);
    }
  };

  const handleRevertVacated = async () => {
    if (!accommodationData) return;

    try {
      setUpdatingVacated(true);
      await accommodationAPI.update(accommodationData.uniqueId, { vacated: false });
      
      setAccommodationData(prev => prev ? { ...prev, vacated: false } : null);
      toast.success('Vacated status reverted successfully');
    } catch (error: any) {
      console.error('Error reverting vacated status:', error);
      toast.error(error.message || 'Failed to revert vacated status');
    } finally {
      setUpdatingVacated(false);
    }
  };


  const { scannerMode, deskSession, scannerConnected, socket, enableScannerMode, disableScannerMode, uniqueIdValue, setUniqueIdValue } = useScanner();

  useEffect(() => {
    if (!socket) return;

    const handleClearScan = () => {
      setUniqueIdValue("");
      setAccommodationData(null);
      setSelectedDay('');
      toast.success("Cleared by scanner");
    };

    socket.on("clear-scan", handleClearScan);

    return () => {
      socket.off("clear-scan", handleClearScan);
    };
  }, [socket]);
  
  // Auto-fetch when unique ID is complete
  useEffect(() => {
    if (uniqueIdValue.length === 4 && activeTab === 'uniqueId') {
      fetchByUniqueId(uniqueIdValue);
    }
  }, [uniqueIdValue, activeTab]);

  const clearScan = () => {
    setUniqueIdValue("");
    setAccommodationData(null);
    setSelectedDay('');

    if (socket && scannerMode) {
      socket.emit("clear-scan");
      socket.emit("resume-scanning");
      toast.success("Ready for next scan");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black relative overflow-hidden p-6 tomorrow-regular">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f0e6ff] via-[#ff6b9d] to-[#8b5cf6] tomorrow-bold">Accommodation Details</h1>
            <p className="text-gray-300">View and manage guest accommodation information</p>
          </div>

          {/* Scanner Mode Toggle */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={scannerMode ? disableScannerMode : enableScannerMode}
              className={`w-full md:w-auto px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group ${scannerMode
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-500/50 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 text-white'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {scannerMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                )}
              </svg>
              <span>{scannerMode ? 'Disable' : 'Enable'} Scanner Mode</span>
            </button>
            {scannerMode && (
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${scannerConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={scannerConnected ? 'text-green-400' : 'text-gray-400'}>
                  {scannerConnected ? 'Connected' : 'Waiting...'}
                </span>
              </div>
            )}
          </div>
        </div>




        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-purple-500/30 overflow-x-auto">
            <nav className="-mb-px flex space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab('uniqueId')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'uniqueId'
                  ? 'border-pink-500 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300'
                  : 'border-transparent text-gray-400 hover:text-purple-300'
                  }`}
              >
                Search by Unique ID
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'email'
                  ? 'border-pink-500 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300'
                  : 'border-transparent text-gray-400 hover:text-purple-300'
                  }`}
              >
                Search by Email
              </button>
            </nav>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          {activeTab === 'uniqueId' ? (
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-purple-500/30 relative">
              {uniqueIdValue && (
                <button
                  onClick={clearScan}
                  className="absolute top-4 right-4 px-4 py-2 overflow-hidden rounded-xl text-white font-medium transition-all duration-200 flex items-center group z-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm">Clear & Scan Next</span>
                  </div>
                </button>
              )}
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                {scannerMode && deskSession && (
                  <div className="flex-shrink-0">
                    <div className="bg-white p-3 rounded-lg shadow-lg">
                      <QRCodeSVG
                        value={`${window.location.origin}/scanner?deskId=${deskSession.deskId}&signature=${deskSession.signature}`}
                        size={100}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-2">Scan with mobile</p>
                  </div>
                )}
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-lg font-semibold text-white text-center md:text-left">
                      Enter 4-digit Unique ID
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f0e6ff] to-[#ff6b9d]">INF</span>
                      <OtpInput
                        value={uniqueIdValue}
                        onChange={setUniqueIdValue}
                        numInputs={4}
                      />
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2 text-purple-400">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading accommodation details...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-purple-500/30">
              <div className="flex flex-col space-y-4">
                <label className="block text-sm font-medium text-white">
                  Email Address
                </label>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-3 border border-purple-500/30 rounded-xl placeholder-gray-500 bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-500/50"
                  />
                  <button
                    onClick={fetchByEmail}
                    disabled={loading}
                    className="relative w-full md:w-auto px-6 py-3 overflow-hidden rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                    <div className="relative flex items-center"
                    >
                      {loading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Search
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accommodation Details Display */}
        {accommodationData && (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-2xl border border-purple-500/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{accommodationData.name}</h2>
                <p className="text-purple-100">ID: {accommodationData.uniqueId}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - User Details */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <p className="text-white">{accommodationData.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Phone</label>
                        <p className="text-white">{accommodationData.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Gender</label>
                        <p className="text-white capitalize">{accommodationData.gender}</p>
                      </div>
                      {accommodationData.day && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400">Accommodation Days</label>
                          <p className="text-white">Feb {accommodationData.day}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-400">College</label>
                        <p className="text-white">{accommodationData.college}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border-b border-purple-500/20 pb-2">
                      Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={accommodationData.optin}
                          readOnly
                          className="rounded border-purple-500/30 text-purple-500 focus:ring-purple-500"
                        />
                        <label className="text-sm text-gray-300">Opt-in for additional services</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!accommodationData.vacated}
                          readOnly
                          className="rounded border-purple-500/30 text-purple-500 focus:ring-purple-500"
                        />
                        <label className="text-sm text-gray-300">Currently Occupying</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Day Selection, Remarks & Actions */}
                <div className="space-y-6">
                  {/* Remarks Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border-b border-purple-500/20 pb-2">
                      Remarks
                    </h3>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/20">
                      {accommodationData.remarks ? (
                        <p className="text-gray-300 italic">"{accommodationData.remarks}"</p>
                      ) : (
                        <p className="text-gray-500 italic">No remarks added</p>
                      )}
                    </div>
                  </div>

                  {!accommodationData.allocated ? (
                    /* Day Selection & Allocation (Combined for unallocated) */
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border-b border-purple-500/20 pb-2">
                        Select Days & Allocate
                      </h3>
                      <div className="space-y-2">
                        {['12', '13', '14', '12 & 13', '13 & 14', '12, 13 & 14'].map((day) => (
                          <label key={day} className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all">
                            <input
                              type="radio"
                              name="day"
                              value={day}
                              checked={selectedDay === day}
                              onChange={(e) => setSelectedDay(e.target.value)}
                              className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-500"
                            />
                            <span className="text-white">Feb {day}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleAllocateWithDays}
                        disabled={updatingAllocated || !selectedDay}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {updatingAllocated && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        )}
                        <span>{updatingAllocated ? 'Allocating...' : 'Allocate with Selected Days'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Allocated - Show status and update controls */
                    <>
                      {/* Allocation Status */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border-b border-purple-500/20 pb-2">
                          Allocation Status
                        </h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-300">Accommodation allocated</span>
                          </div>
                          <button
                            onClick={handleRevertAllocation}
                            disabled={updatingAllocated}
                            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {updatingAllocated && (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            )}
                            <span>{updatingAllocated ? 'Reverting...' : 'Revert Allocation'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Day Update (Only for allocated) */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border-b border-purple-500/20 pb-2">
                          Update Accommodation Days
                        </h3>
                        <div className="space-y-2">
                          {['12', '13', '14', '12 & 13', '13 & 14', '12, 13 & 14'].map((day) => (
                            <label key={day} className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all">
                              <input
                                type="radio"
                                name="day"
                                value={day}
                                checked={selectedDay === day}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-500"
                              />
                              <span className="text-white">Feb {day}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={handleUpdateDay}
                          disabled={updatingDay || !selectedDay || selectedDay === accommodationData.day}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {updatingDay && (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          )}
                          <span>{updatingDay ? 'Updating...' : 'Update Days'}</span>
                        </button>
                      </div>

                      {/* Vacate Section (Only for allocated) */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border-b border-purple-500/20 pb-2">
                          Vacancy Status
                        </h3>
                        {accommodationData.vacated ? (
                          <div className="space-y-3">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center space-x-2">
                              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="text-orange-300">Accommodation vacated</span>
                            </div>
                            <button
                              onClick={handleRevertVacated}
                              disabled={updatingVacated}
                              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              {updatingVacated && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              )}
                              <span>{updatingVacated ? 'Reverting...' : 'Revert Vacated Status'}</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleVacate}
                            disabled={updatingVacated}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {updatingVacated && (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            )}
                            <span>{updatingVacated ? 'Marking...' : 'Mark as Vacated'}</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Section - Address Information */}
              <div className="mt-8 pt-6 border-t border-[rgba(67,2,105,0.3)]">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#f0e6ff] to-[#ff6b9d] border-b border-[rgba(67,2,105,0.3)] pb-2">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Residential Address</label>
                      <p className="text-white">{accommodationData.residentialAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">City</label>
                      <p className="text-white">{accommodationData.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!accommodationData && !loading && (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-2xl border border-[rgba(67,2,105,0.3)] p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgba(67,2,105,0.3)]">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {activeTab === 'uniqueId' ? 'Enter a Unique ID' : 'Search for Accommodation'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'uniqueId'
                  ? 'Enter the 4-digit unique ID to view accommodation details'
                  : 'Enter an email address and click search to view accommodation details'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationDetails;

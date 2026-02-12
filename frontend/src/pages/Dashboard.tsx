import React, { useState, useEffect } from 'react';
import { accommodationAPI } from '../api';
import { toast } from 'react-hot-toast';

interface DayStats {
  day: string;
  total: number;
  male: number;
  female: number;
  vacated: number;
  remaining: number;
  totalAllocated: number;
}

interface StatsData {
  totalAccommodations: number;
  totalAllocated: number;
  totalNotAllocated: number;
  totalVacated: number;
  totalOccupied: number;
  genderStats: {
    male: number;
    female: number;
    other: number;
  };
  dayStats: DayStats[];
  allocatedOccupiedByGender: {
    male: number;
    female: number;
    total: number;
  };
  vacatedStats: {
    totalAllocatedVacated: number;
    totalAllocatedRemaining: number;
  };
  statusBreakdown: {
    allocatedOccupied: number;
    allocatedVacated: number;
    notAllocatedOccupied: number;
    notAllocatedVacated: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await accommodationAPI.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className={`bg-gray-900/90 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-purple-500/20 ${color} group relative`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400">{value}</p>
        </div>
        <div className="text-purple-500/50 group-hover:text-pink-500/70 transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900/90 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="flex items-center justify-center h-96 relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-purple-500"></div>
            <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900/90 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="text-center py-12 relative z-10">
          <p className="text-gray-500">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900/90 backdrop-blur-xl relative overflow-hidden tomorrow-regular">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 tomorrow-bold">Hostel Portal</h1>
          <p className="text-gray-400 mt-1">Accommodation Statistics Overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Accommodations"
            value={stats.totalAccommodations}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            color="hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
          />
          <StatCard
            title="Allocated"
            value={stats.totalAllocated}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300"
          />
          <StatCard
            title="Vacated (Allocated)"
            value={stats.vacatedStats.totalAllocatedVacated}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
            color="hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300"
          />
          <StatCard
            title="Remaining (To Vacate)"
            value={stats.vacatedStats.totalAllocatedRemaining}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            color="hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
          />
        </div>

        {/* Allocated & Occupied Stats by Gender */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4">Allocated & Occupied by Gender</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total (Allocated & Occupied)"
              value={stats.allocatedOccupiedByGender.total}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
            />
            <StatCard
              title="Male"
              value={stats.allocatedOccupiedByGender.male}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              color="hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
            />
            <StatCard
              title="Female"
              value={stats.allocatedOccupiedByGender.female}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              color="hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Day-wise Statistics (Allocated & Occupied) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4">Day-wise Stats (Allocated & Occupied)</h2>
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-2xl border border-purple-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Day</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-300">Male</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-pink-300">Female</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Occupied</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-orange-300">Vacated</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">Total Allocated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {stats.dayStats.map((dayStat) => (
                    <tr key={dayStat.day} className="hover:bg-purple-500/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Feb {dayStat.day}</td>
                      <td className="px-6 py-4 text-center text-blue-300">{dayStat.male}</td>
                      <td className="px-6 py-4 text-center text-pink-300">{dayStat.female}</td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{dayStat.remaining}</td>
                      <td className="px-6 py-4 text-center text-orange-300 font-semibold">{dayStat.vacated}</td>
                      <td className="px-6 py-4 text-center text-green-300 font-semibold">{dayStat.totalAllocated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useState, useEffect } from 'react';
import { QrCode, Clock, Filter, Download, Calendar, User, LogIn, LogOut, RefreshCw, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [shiftFilter, setShiftFilter] = useState('All');
  const [employeeId, setEmployeeId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const { attendanceRecords, loading, error, recordClockIn, recordClockOut, loadFromGoogleSheets } = useAttendance(selectedDate);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleClockIn = async () => {
    if (!employeeId) {
      showMessage('error', 'Please enter an employee ID');
      return;
    }
    
    setIsProcessing(true);
    try {
      await recordClockIn(employeeId);
      showMessage('success', 'Clock-in recorded successfully');
      setEmployeeId('');
    } catch (error) {
      showMessage('error', 'Error recording clock-in');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (!employeeId) {
      showMessage('error', 'Please enter an employee ID');
      return;
    }
    
    setIsProcessing(true);
    try {
      await recordClockOut(employeeId);
      showMessage('success', 'Clock-out recorded successfully');
      setEmployeeId('');
    } catch (error) {
      showMessage('error', 'Error recording clock-out');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadFromSheets = async () => {
    try {
      await loadFromGoogleSheets();
      showMessage('success', 'Attendance data loaded from Google Sheets');
    } catch (error) {
      showMessage('error', 'Error loading data from Google Sheets');
    }
  };

  const filteredRecords = shiftFilter === 'All' 
    ? attendanceRecords 
    : attendanceRecords.filter(record => record.shift === shiftFilter);

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit' 
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800">Error loading data</h3>
          <p className="text-red-600 mt-2">Failed to fetch attendance data</p>
          <button
            onClick={handleLoadFromSheets}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry Load from Google Sheets
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
              <p className="text-gray-600">Track employee attendance with Google Sheets + Firebase</p>
            </div>
            <button
              onClick={handleLoadFromSheets}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Load from Sheets
            </button>
          </div>
        </motion.div>
        
        {/* Message display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('scanner')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'scanner'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Attendance Scanner
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'history'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Attendance History
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'scanner' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-full max-w-md">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID (OPS ID)
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="Enter employee OPS ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClockIn}
                      disabled={!employeeId || isProcessing || loading}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      {isProcessing ? 'Processing...' : 'Clock In'}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClockOut}
                      disabled={!employeeId || isProcessing || loading}
                      className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      {isProcessing ? 'Processing...' : 'Clock Out'}
                    </motion.button>
                  </div>
                </div>
                
                <div className="mt-12 w-full max-w-md">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Or Scan Barcode</h3>
                    <p className="text-gray-600">Scan employee barcode to record attendance</p>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto cursor-pointer"
                  >
                    <QrCode className="w-24 h-24 text-indigo-600" />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={shiftFilter}
                        onChange={(e) => setShiftFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="All">All Shifts</option>
                        <option value="Day">Day Shift</option>
                        <option value="Night">Night Shift</option>
                      </select>
                    </div>
                    
                    <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record, index) => (
                            <motion.tr
                              key={`${record.employeeId}-${record.date}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {record.employeeId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDateForDisplay(record.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.timeIn || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.timeOut || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.shift}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.status === 'present' 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.status === 'late'
                                    ? 'bg-amber-100 text-amber-800'
                                    : record.status === 'absent'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              No attendance records found for this date
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
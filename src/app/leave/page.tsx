'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useState } from 'react';
import { Calendar, CheckCircle, X, Plus, Filter, User } from 'lucide-react';
import { LeaveRequest } from '@/types';
import { motion } from 'framer-motion';

const mockLeaveRequests: LeaveRequest[] = [
  { id: '1', employeeId: '1', type: 'Annual', startDate: '2023-06-20', endDate: '2023-06-22', status: 'Pending', reason: 'Family vacation', createdAt: '2023-06-10', updatedAt: '2023-06-10' },
  { id: '2', employeeId: '2', type: 'Sick', startDate: '2023-06-18', endDate: '2023-06-18', status: 'Approved', reason: 'Medical appointment', createdAt: '2023-06-17', updatedAt: '2023-06-18' },
  { id: '3', employeeId: '3', type: 'Personal', startDate: '2023-06-25', endDate: '2023-06-26', status: 'Pending', reason: 'Personal matters', createdAt: '2023-06-15', updatedAt: '2023-06-15' },
];

export default function LeaveManagementPage() {
  const [filter, setFilter] = useState('All');

  const filteredRequests = filter === 'All' 
    ? mockLeaveRequests 
    : mockLeaveRequests.filter(req => req.status === filter);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage employee leave requests and approvals</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Leave Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">15</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">42</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </motion.button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">Employee {request.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.type} Leave</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'Pending' 
                          ? 'bg-amber-100 text-amber-800' 
                          : request.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'Pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                          <button className="text-red-600 hover:text-red-900">Reject</button>
                        </>
                      )}
                      {request.status !== 'Pending' && (
                        <button className="text-indigo-600 hover:text-indigo-900">View</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
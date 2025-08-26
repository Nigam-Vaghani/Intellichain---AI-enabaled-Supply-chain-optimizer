import React, { useState } from 'react';
import { X, User, Lock, Building, Warehouse } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => void;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: 'store_manager' | 'warehouse_manager';
  location: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    role: 'store_manager',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(credentials);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mr-3">
              <User className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Manager Portal Login</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCredentials({ ...credentials, role: 'store_manager' })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  credentials.role === 'store_manager'
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-700 hover:border-blue-500 text-gray-300'
                }`}
              >
                <Building className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Store Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setCredentials({ ...credentials, role: 'warehouse_manager' })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  credentials.role === 'warehouse_manager'
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-700 hover:border-blue-500 text-gray-300'
                }`}
              >
                <Warehouse className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Warehouse Manager</span>
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {credentials.role === 'store_manager' ? 'Store Location' : 'Warehouse Location'}
            </label>
            <select
              value={credentials.location}
              onChange={(e) => setCredentials({ ...credentials, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select location...</option>
              {credentials.role === 'store_manager' ? (
                <>
                  <option value="downtown">Downtown Plaza, NY</option>
                  <option value="eastside">Eastside Mall, NY</option>
                  <option value="westfield">Westfield Avenue, NY</option>
                </>
              ) : (
                <>
                  <option value="central">Central Warehouse - NY</option>
                  <option value="north">North Distribution Center - NY</option>
                  <option value="south">South Fulfillment Center - NY</option>
                </>
              )}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
          >
            Login to {credentials.role === 'store_manager' ? 'Store' : 'Warehouse'} Portal
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Demo credentials: admin/password for both roles
          </p>
        </div>
      </div>
    </div>
  );
};

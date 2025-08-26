import React from 'react';
import { ShoppingCart, Bell, User, LogOut } from 'lucide-react';
import { LoginCredentials } from './LoginModal';

interface HeaderProps {
  user: LoginCredentials | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md shadow-xl border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo & Title */}
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent ml-3">
                Walmart IntelliChain
              </h1>
              <p className="text-xs text-gray-400 ml-3">AI-Powered Inventory Management</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            {user && (
              <div className="hidden md:flex items-center space-x-2 bg-green-900/20 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-300">
                  {user.role === 'store_manager' ? 'Store' : 'Warehouse'} Manager
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative group">
              <Bell className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-all duration-200 group-hover:scale-110" />
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                6
              </span>
            </div>

            {/* User Info or Login */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-blue-900/20 px-4 py-2 rounded-full border border-blue-500/30">
                  <div className="relative">
                    <User className="h-5 w-5 text-blue-400" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <span className="text-sm font-medium text-blue-200">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/10 rounded-full transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

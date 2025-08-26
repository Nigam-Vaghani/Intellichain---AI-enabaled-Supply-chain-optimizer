import React, { useState } from 'react'
import { Alert } from '../services/api'
import { AlertTriangle, Clock, X } from 'lucide-react'

interface AlertsPanelProps {
  alerts: Alert[]
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const totalPages = Math.ceil(alerts.length / pageSize)

  const paginatedAlerts = alerts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-900/30'
      case 'medium':
        return 'border-yellow-500 bg-yellow-800/30'
      default:
        return 'border-blue-500 bg-blue-900/30'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className='h-5 w-5 text-red-400' />
      case 'medium':
        return <Clock className='h-5 w-5 text-yellow-300' />
      default:
        return <AlertTriangle className='h-5 w-5 text-blue-400' />
    }
  }

  return (
    <div className='bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-8'>
      <div className='flex items-center mb-6'>
        <div className='p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl mr-3'>
          <AlertTriangle className='h-5 w-5 text-white' />
        </div>
        <h3 className='text-xl font-bold text-white'>Active Alerts</h3>
        <div className='ml-auto'>
          <span className='bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full'>
            {alerts.length} Active
          </span>
        </div>
      </div>

      <div className='space-y-4'>
        {paginatedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-xl border-l-4 ${getSeverityColor(
              alert.severity
            )} hover:shadow-md transition-all duration-300`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-start'>
                {getSeverityIcon(alert.severity)}
                <div className='ml-4'>
                  <p className='text-sm font-bold text-white'>
                    {alert.message}
                  </p>
                  <p className='text-xs text-gray-400 mt-2 flex items-center'>
                    <Clock className='h-3 w-3 mr-1' />
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button className='text-gray-400 hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-red-900/40'>
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex justify-center items-center mt-6 gap-2'>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className='px-3 py-1 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50'
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm font-bold rounded-full ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='px-3 py-1 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

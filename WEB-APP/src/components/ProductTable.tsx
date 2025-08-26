import React, { useState } from 'react'
import { Product } from '../services/api'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Package,
} from 'lucide-react'

interface ProductTableProps {
  products: Product[]
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const totalPages = Math.ceil(products.length / pageSize)

  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className='h-4 w-4 text-green-400' />
      case 'decreasing':
        return <TrendingDown className='h-4 w-4 text-red-400' />
      default:
        return <Minus className='h-4 w-4 text-gray-400' />
    }
  }

  const getStockStatus = (product: Product) => {
    const percentage = (product.currentStock / product.maxCapacity) * 100
    if (percentage <= 25) return 'critical'
    if (percentage <= 50) return 'low'
    return 'good'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-700 text-red-100'
      case 'low':
        return 'bg-yellow-700 text-yellow-100'
      default:
        return 'bg-green-700 text-green-100'
    }
  }

  const visibleProducts = paginatedProducts

  return (
    <div className='bg-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden'>
      <div className='px-8 py-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700'>
        <div className='flex items-center'>
          <div className='w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-4'></div>
          <h3 className='text-xl font-bold text-white'>Product Inventory</h3>
          <Package className='h-5 w-5 text-gray-300 ml-2' />
          <div className='ml-auto'>
            <span className='bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full'>
              {products.length} Products
            </span>
          </div>
        </div>
      </div>

      {products.length === 0 && (
        <div className='text-center py-12'>
          <Package className='h-16 w-16 text-gray-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-white mb-2'>
            No Products Found
          </h3>
          <p className='text-gray-400'>
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead className='bg-gray-800'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider'>
                Product
              </th>
              <th className='px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider'>
                Current Stock
              </th>
              <th className='px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider'>
                Trend
              </th>
              <th className='px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider'>
                Predicted Out
              </th>
              <th className='px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider'>
                Holiday Impact
              </th>
            </tr>
          </thead>
          <tbody className='bg-gray-900 divide-y divide-gray-800'>
            {visibleProducts.map((product) => {
              const status = getStockStatus(product)
              const isLowStock = product.currentStock <= product.minThreshold

              return (
                <tr
                  key={product.id}
                  className='hover:bg-gray-800 transition-all duration-200'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      {isLowStock && (
                        <AlertTriangle className='h-4 w-4 text-red-400 mr-2' />
                      )}
                      <div>
                        <div className='text-sm font-bold text-white'>
                          {product.name}
                        </div>
                        <div className='text-sm font-medium text-gray-400'>
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-white'>
                      {product.currentStock} units
                    </div>
                    <div className='text-xs text-gray-400'>
                      Min: {product.minThreshold} | Max: {product.maxCapacity}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      {getTrendIcon(product.trend)}
                      <span className='ml-2 text-sm font-medium text-gray-300 capitalize'>
                        {product.trend}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-white'>
                    {new Date(product.predictedOutOfStock).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        product.holidayImpact > 1.5
                          ? 'bg-orange-700 text-orange-100'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      {product.holidayImpact}x
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center py-6 gap-2'>
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
                      ? 'bg-blue-600 text-white'
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
    </div>
  )
}

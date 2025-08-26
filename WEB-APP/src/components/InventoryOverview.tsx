import React from 'react'
import { Store, Product } from '../services/api'
import { Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'

interface InventoryOverviewProps {
  store: Store
  products: Product[]
}

export const InventoryOverview: React.FC<InventoryOverviewProps> = ({
  store,
  products,
}) => {
  const totalProducts = products.length
  const lowStockCount = products.filter((p) => {
    const percent = (p.currentStock / p.maxCapacity) * 100
    return percent > 25 && percent <= 50
  }).length

  const criticalStockCount = products.filter((p) => {
    const percent = (p.currentStock / p.maxCapacity) * 100
    return percent <= 25
  }).length

  const avgStockLevel =
    totalProducts > 0
      ? products.reduce((sum, p) => sum + p.currentStock / p.maxCapacity, 0) /
        totalProducts
      : 0

  return (
    <div className='bg-zinc-900 rounded-2xl shadow-xl border border-zinc-700 p-8 text-white'>
      <div className='flex items-center mb-6'>
        <div className='w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-4'></div>
        <h3 className='text-xl font-bold'>Inventory Overview</h3>
        <div className='ml-auto'>
          <span className='text-sm bg-zinc-800 text-gray-300 px-3 py-1 rounded-full'>
            {store.name}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {/* Total Products */}
        <div className='bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-2xl border border-zinc-600 hover:shadow-lg transition-all duration-300 group'>
          <div className='flex items-center justify-between'>
            <div className='p-3 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300'>
              <Package className='h-6 w-6 text-white' />
            </div>
            <span className='text-3xl font-bold text-blue-400'>
              {totalProducts}
            </span>
          </div>
          <p className='text-sm font-medium text-blue-300 mt-3'>
            Total Products
          </p>
        </div>

        {/* Low Stock */}
        <div className='bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-2xl border border-zinc-600 hover:shadow-lg transition-all duration-300 group'>
          <div className='flex items-center justify-between'>
            <div className='p-3 bg-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300'>
              <TrendingDown className='h-6 w-6 text-white' />
            </div>
            <span className='text-3xl font-bold text-amber-400'>
              {lowStockCount}
            </span>
          </div>
          <p className='text-sm font-medium text-amber-300 mt-3'>Low Stock</p>
        </div>

        {/* Critical Stock */}
        <div className='bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-2xl border border-zinc-600 hover:shadow-lg transition-all duration-300 group'>
          <div className='flex items-center justify-between'>
            <div className='p-3 bg-red-600 rounded-xl group-hover:scale-110 transition-transform duration-300'>
              <AlertTriangle className='h-6 w-6 text-white' />
            </div>
            <span className='text-3xl font-bold text-red-400'>
              {criticalStockCount}
            </span>
          </div>
          <p className='text-sm font-medium text-red-300 mt-3'>
            Critical Stock
          </p>
        </div>

        {/* Avg Stock Level */}
        <div className='bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-2xl border border-zinc-600 hover:shadow-lg transition-all duration-300 group'>
          <div className='flex items-center justify-between'>
            <div className='p-3 bg-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300'>
              <TrendingUp className='h-6 w-6 text-white' />
            </div>
            <span className='text-3xl font-bold text-emerald-400'>
              {(avgStockLevel * 100).toFixed(1)}%
            </span>
          </div>
          <p className='text-sm font-medium text-emerald-300 mt-3'>
            Avg Stock Level
          </p>
        </div>
      </div>
    </div>
  )
}

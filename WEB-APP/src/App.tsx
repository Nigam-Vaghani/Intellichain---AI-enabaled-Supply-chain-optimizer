import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { LoginModal, LoginCredentials } from './components/LoginModal'
import { FilterPanel, FilterOptions } from './components/FilterPanel'
import { InventoryOverview } from './components/InventoryOverview'
import { ProductTable } from './components/ProductTable'
import { AIInsights } from './components/AIInsights'
import { AlertsPanel } from './components/AlertsPanel'
import { EmergencyRebalancer } from './components/EmergencyRebalancer'
import { apiService, Store, Product, Alert, AIInsight } from './services/api'
import { Loader2, Building, Warehouse, User } from 'lucide-react'

function App() {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStoreDropdown, setShowStoreDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<LoginCredentials | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    status: '',
    trend: '',
    stockLevel: '',
    holidayImpact: '',
  })

  // Load initial data
  useEffect(() => {
    loadStores()
  }, [])

  // Load store-specific data when store changes
  useEffect(() => {
    if (selectedStore) {
      loadStoreData(selectedStore)
    }
  }, [selectedStore])

  // Auto-refresh every 30 seconds to simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      if (selectedStore) {
        loadStoreData(selectedStore)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedStore])

  // Filter products based on current filters
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.category.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((product) => {
        const percentage = (product.currentStock / product.maxCapacity) * 100
        switch (filters.status) {
          case 'critical':
            return percentage <= 25
          case 'low':
            return percentage > 25 && percentage <= 50
          case 'good':
            return percentage > 50
          default:
            return true
        }
      })
    }

    // Trend filter
    if (filters.trend) {
      filtered = filtered.filter((product) => product.trend === filters.trend)
    }

    // Stock level filter
    if (filters.stockLevel) {
      filtered = filtered.filter((product) => {
        const percentage = (product.currentStock / product.maxCapacity) * 100
        switch (filters.stockLevel) {
          case 'high':
            return percentage > 75
          case 'medium':
            return percentage >= 25 && percentage <= 75
          case 'low':
            return percentage < 25
          default:
            return true
        }
      })
    }

    // Holiday impact filter
    if (filters.holidayImpact) {
      filtered = filtered.filter((product) => {
        switch (filters.holidayImpact) {
          case 'high':
            return product.holidayImpact > 2
          case 'medium':
            return product.holidayImpact >= 1.5 && product.holidayImpact <= 2
          case 'low':
            return product.holidayImpact < 1.5
          default:
            return true
        }
      })
    }

    setFilteredProducts(filtered)
  }, [products, filters])

  const loadStores = async () => {
    try {
      setLoading(true)
      const storesData = await apiService.fetchStores()
      setStores(storesData)
      if (storesData.length > 0) {
        setSelectedStore(storesData[0].id)
      }
    } catch (err) {
      setError('Failed to load stores. Using sample data.')
      console.error('Error loading stores:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStoreData = async (storeId: string) => {
    try {
      const [productsData, alertsData, insightsData] = await Promise.all([
        apiService.fetchStoreProducts(storeId),
        apiService.fetchStoreAlerts(storeId),
        apiService.fetchAIInsights(storeId),
      ])

      setProducts(productsData)

      // 🔽 Insert this block right after setProducts
      const generatedAlerts: Alert[] = productsData
        .filter((product) => {
          const percent = (product.currentStock / product.maxCapacity) * 100
          return percent <= 50 // Show alerts for low or critical
        })
        .map((product) => {
          const percent = (product.currentStock / product.maxCapacity) * 100
          return {
            id: `alert-${product.id}`,
            message: `${product.name} running low - only ${product.currentStock} units left`,
            timestamp: new Date().toISOString(),
            severity: percent <= 25 ? 'high' : 'medium',
          }
        })

      setAlerts(generatedAlerts) // 🔁 override backend alerts with frontend-generated ones
      setStores((prevStores) =>
        prevStores.map((store) =>
          store.id === storeId
            ? { ...store, alertCount: generatedAlerts.length }
            : store
        )
      )
      setInsights(insightsData)
    } catch (err) {
      setError('Failed to load store data')
      console.error('Error loading store data:', err)
    }
  }

  const handleLogin = (credentials: LoginCredentials) => {
    // In a real app, you would validate credentials with the backend
    setUser(credentials)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map((product) => product.category))]

  const currentStore = stores.find((store) => store.id === selectedStore)

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-500 mx-auto mb-4' />
          <p className='text-gray-400'>Loading Walmart IntelliChain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      <Header
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl shadow-sm backdrop-blur-sm'>
            <p className='text-yellow-400 font-medium'>{error}</p>
          </div>
        )}

        {/* Header Section with Store Filter */}
        <div className='mb-8'>
          <div className='flex flex-col xl:flex-row xl:items-center xl:justify-between mb-6'>
            <div>
              <div className='flex items-center mb-2'>
                {user?.role === 'warehouse_manager' ? (
                  <Warehouse className='h-8 w-8 text-purple-400 mr-3' />
                ) : (
                  <Building className='h-8 w-8 text-blue-400 mr-3' />
                )}
                <h2 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                  {user?.role === 'warehouse_manager' ? 'Warehouse' : 'Store'}{' '}
                  Inventory Dashboard
                </h2>
              </div>
              <p className='text-gray-400 mt-2 flex items-center'>
                <span className='inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></span>
                Last updated: {currentTime.toLocaleTimeString()} | Auto-refresh
                enabled
              </p>
            </div>

            {/* Store Filter Dropdown */}
            {currentStore && user && (
              <div className='mt-4 xl:mt-0 relative'>
                <button
                  onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                  className='flex items-center justify-between w-full lg:w-80 px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50'
                >
                  <div className='flex items-center'>
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        user.role === 'warehouse_manager'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                    ></div>
                    <div className='text-left'>
                      <p className='font-semibold text-gray-100 truncate'>
                        {user.role === 'warehouse_manager'
                          ? `${currentStore.name} - Warehouse`
                          : currentStore.name}
                      </p>
                      <p className='text-sm text-gray-400 truncate'>
                        {currentStore.location}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center ml-4'>
                    {currentStore.alertCount > 0 && (
                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 mr-2'>
                        {currentStore.alertCount}
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        showStoreDropdown ? 'rotate-180' : ''
                      }`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </button>

                {showStoreDropdown && (
                  <div className='absolute right-0 mt-2 w-full lg:w-96 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto'>
                    <div className='p-2'>
                      <div className='px-4 py-2 border-b border-gray-700/50 mb-2'>
                        <h4 className='font-semibold text-gray-100'>
                          {user.role === 'warehouse_manager'
                            ? 'Select Warehouse'
                            : 'Select Store'}
                        </h4>
                      </div>
                      {stores.map((store) => (
                        <button
                          key={store.id}
                          onClick={() => {
                            setSelectedStore(store.id)
                            setShowStoreDropdown(false)
                          }}
                          className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                            selectedStore === store.id
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50'
                              : 'hover:bg-gray-700/50 border-2 border-transparent'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              <div
                                className={`w-4 h-4 rounded-full mr-3 ${
                                  selectedStore === store.id
                                    ? user.role === 'warehouse_manager'
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                    : 'bg-gray-600'
                                }`}
                              ></div>
                              <div>
                                <h4 className='font-semibold text-gray-100'>
                                  {user.role === 'warehouse_manager'
                                    ? `${store.name} - Warehouse`
                                    : store.name}
                                </h4>
                                <p className='text-sm text-gray-400'>
                                  {store.location}
                                </p>
                                <p className='text-xs text-gray-500 mt-1'>
                                  Manager: {store.manager}
                                </p>
                              </div>
                            </div>
                            <div className='text-right'>
                              <p className='text-sm font-bold text-green-400'>
                                ${store.totalValue.toLocaleString()}
                              </p>
                              {store.alertCount > 0 && (
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 mt-1'>
                                  {store.alertCount} alerts
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {currentStore && user && (
          <div className='space-y-8'>
            {/* Filter Panel */}
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />

            {/* Inventory Overview */}
            <InventoryOverview
              store={currentStore}
              products={filteredProducts}
            />

            {/* AI Insights and Alerts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <AIInsights insights={insights} />
              <AlertsPanel alerts={alerts} />
            </div>

            {/* Emergency Rebalancing System - Only for Warehouse Managers */}
            {user?.role === 'warehouse_manager' && <EmergencyRebalancer />}

            {/* Product Table */}
            <ProductTable products={filteredProducts} />
          </div>
        )}

        {!user && (
          <div className='text-center py-16'>
            <div className='max-w-md mx-auto'>
              <div className='p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50'>
                <User className='h-16 w-16 text-gray-500 mx-auto mb-4' />
                <h3 className='text-xl font-bold text-gray-100 mb-2'>
                  Manager Login Required
                </h3>
                <p className='text-gray-400 mb-6'>
                  Please login as a Store Manager or Warehouse Manager to access
                  the inventory dashboard.
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200'
                >
                  Login to Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
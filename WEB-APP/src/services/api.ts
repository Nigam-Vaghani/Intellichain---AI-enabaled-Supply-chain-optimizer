const API_BASE_URL = '/api'

export interface Store {
  id: string
  name: string
  location: string
  manager: string
  totalValue: number
  alertCount: number
}

export interface Product {
  id: string
  name: string
  category: string
  currentStock: number
  minThreshold: number
  maxCapacity: number
  price: number
  lastRestocked: string
  predictedOutOfStock: string
  trend: 'increasing' | 'decreasing' | 'stable'
  holidayImpact: number
}

export interface Alert {
  id: string
  storeId: string
  productId: string
  type: 'low_stock' | 'predicted_shortage' | 'holiday_demand'
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
}

export interface AIInsight {
  type: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high'
  action: string
}

export interface RebalanceSuggestion {
  from_store: string
  to_store: string
  product_name: string
  transfer_qty: number
  distance: number
  priority: number
}

export interface WarehouseOrder {
  store_id: string
  product_name: string
  product_id: string
  order_qty: number
  urgency: string
  estimated_delivery: string
  warehouse_location: string
}

export interface EmergencyDashboard {
  critical_shortages: number
  pending_transfers: number
  pending_warehouse_orders: number
  rebalance_suggestions: RebalanceSuggestion[]
  warehouse_orders: WarehouseOrder[]
}
class ApiService {
  async fetchStores(): Promise<Store[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stores`)
      if (!response.ok) throw new Error('Failed to fetch stores')
      return await response.json()
    } catch (error) {
      console.error('Error fetching stores:', error)
      throw error
    }
  }

  async fetchStoreProducts(storeId: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/products`)
      if (!response.ok) throw new Error('Failed to fetch products')
      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  async fetchStoreAlerts(storeId: string): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/alerts`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      return await response.json()
    } catch (error) {
      console.error('Error fetching alerts:', error)
      throw error
    }
  }

  async fetchAIInsights(storeId: string): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/insights`)
      if (!response.ok) throw new Error('Failed to fetch insights')
      return await response.json()
    } catch (error) {
      console.error('Error fetching insights:', error)
      throw error
    }
  }

  async fetchAnalyticsOverview() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }

  async fetchEmergencyDashboard(): Promise<EmergencyDashboard> {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/dashboard`)
      if (!response.ok) throw new Error('Failed to fetch emergency dashboard')
      return await response.json()
    } catch (error) {
      console.error('Error fetching emergency dashboard:', error)
      throw error
    }
  }

  async executeRebalance(suggestion: RebalanceSuggestion): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}/rebalance/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      })
      if (!response.ok) throw new Error('Failed to execute rebalance')
      return await response.json()
    } catch (error) {
      console.error('Error executing rebalance:', error)
      throw error
    }
  }

  async placeWarehouseOrder(order: WarehouseOrder): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouse/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      if (!response.ok) throw new Error('Failed to place warehouse order')
      return await response.json()
    } catch (error) {
      console.error('Error placing warehouse order:', error)
      throw error
    }
  }
}

const loadStoreData = async (storeId: string) => {
  try {
    const [productsData, alertsData, insightsData] = await Promise.all([
      apiService.fetchStoreProducts(storeId),
      apiService.fetchStoreAlerts(storeId),
      apiService.fetchAIInsights(storeId),
    ])

    console.log('Products:', productsData) // 🧪
    console.log('Alerts:', alertsData) // 🧪
    console.log('Insights:', insightsData) // 🧪

    setProducts(productsData)
    setAlerts(alertsData)
    setInsights(insightsData)
  } catch (err) {
    setError('Failed to load store data')
    console.error('Error loading store data:', err)
  }
}

export const apiService = new ApiService()

import React, { useState, useEffect } from 'react';
import {
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Warehouse,
  Store,
} from 'lucide-react';

interface RebalanceSuggestion {
  from_store: string;
  to_store: string;
  product_name: string;
  transfer_qty: number;
  distance: number;
  priority: number;
}

interface WarehouseOrder {
  store_id: string;
  product_name: string;
  product_id: string;
  order_qty: number;
  urgency: string;
  estimated_delivery: string;
  warehouse_location: string;
}

interface EmergencyDashboard {
  critical_shortages: number;
  pending_transfers: number;
  pending_warehouse_orders: number;
  rebalance_suggestions: RebalanceSuggestion[];
  warehouse_orders: WarehouseOrder[];
}

export const EmergencyRebalancer: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<EmergencyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rebalance' | 'warehouse'>('rebalance');
  const [executingTransfer, setExecutingTransfer] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/emergency/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading emergency dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async (suggestion: RebalanceSuggestion) => {
    setExecutingTransfer(`${suggestion.from_store}-${suggestion.to_store}-${suggestion.product_name}`);
    try {
      const response = await fetch('/api/rebalance/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      });
      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error executing transfer:', error);
    } finally {
      setExecutingTransfer(null);
    }
  };

  const placeWarehouseOrder = async (order: WarehouseOrder) => {
    setPlacingOrder(order.product_id);
    try {
      const response = await fetch('/api/warehouse/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error placing warehouse order:', error);
    } finally {
      setPlacingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl mr-3">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Emergency Rebalancing System</h3>
        </div>
        <div className="flex space-x-2">
          <span className="bg-red-800 text-red-100 text-xs font-bold px-3 py-1 rounded-full">
            {dashboardData.critical_shortages} Critical
          </span>
        </div>
      </div>

      {/* Emergency Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-950 p-4 rounded-xl border border-red-700">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-red-300">{dashboardData.critical_shortages}</span>
          </div>
          <p className="text-sm text-red-400 mt-2">Critical Shortages</p>
        </div>

        <div className="bg-blue-950 p-4 rounded-xl border border-blue-700">
          <div className="flex items-center justify-between">
            <Truck className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-blue-300">{dashboardData.pending_transfers}</span>
          </div>
          <p className="text-sm text-blue-400 mt-2">Store Transfers</p>
        </div>

        <div className="bg-purple-950 p-4 rounded-xl border border-purple-700">
          <div className="flex items-center justify-between">
            <Warehouse className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-purple-300">{dashboardData.pending_warehouse_orders}</span>
          </div>
          <p className="text-sm text-purple-400 mt-2">Warehouse Orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('rebalance')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === 'rebalance'
              ? 'bg-gray-900 text-blue-400 shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Truck className="h-4 w-4 inline mr-2" />
          Store-to-Store Transfers
        </button>
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === 'warehouse'
              ? 'bg-gray-900 text-purple-400 shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Warehouse className="h-4 w-4 inline mr-2" />
          Warehouse Orders
        </button>
      </div>

      {/* Store-to-Store Transfers */}
      {activeTab === 'rebalance' && (
        <div className="space-y-4">
          {dashboardData.rebalance_suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400">No rebalancing needed at this time</p>
            </div>
          ) : (
            dashboardData.rebalance_suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-gray-800 p-5 rounded-xl border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Store className="h-5 w-5 text-blue-400" />
                      <span className="font-bold text-blue-300">{suggestion.from_store}</span>
                      <ArrowRight className="h-4 w-4 text-gray-500" />
                      <Store className="h-5 w-5 text-green-400" />
                      <span className="font-bold text-green-300">{suggestion.to_store}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {suggestion.distance.toFixed(1)} km
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold text-white">{suggestion.product_name}</p>
                      <p className="text-sm text-gray-400">{suggestion.transfer_qty} units</p>
                    </div>
                    <button
                      onClick={() => executeTransfer(suggestion)}
                      disabled={executingTransfer === `${suggestion.from_store}-${suggestion.to_store}-${suggestion.product_name}`}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow transition-all duration-200 disabled:opacity-50"
                    >
                      {executingTransfer === `${suggestion.from_store}-${suggestion.to_store}-${suggestion.product_name}` ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        'Execute Transfer'
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    suggestion.priority > 10
                      ? 'bg-red-800 text-red-100'
                      : suggestion.priority > 5
                      ? 'bg-yellow-800 text-yellow-100'
                      : 'bg-green-800 text-green-100'
                  }`}>
                    Priority: {suggestion.priority.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">ETA: 2–4 hours</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Warehouse Orders */}
      {activeTab === 'warehouse' && (
        <div className="space-y-4">
          {dashboardData.warehouse_orders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400">No warehouse orders needed at this time</p>
            </div>
          ) : (
            dashboardData.warehouse_orders.map((order, index) => (
              <div
                key={index}
                className="bg-gray-800 p-5 rounded-xl border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Warehouse className="h-5 w-5 text-purple-400" />
                    <span className="font-bold text-purple-300">{order.warehouse_location}</span>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                    <Store className="h-5 w-5 text-blue-400" />
                    <span className="font-bold text-blue-300">{order.store_id}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold text-white">{order.product_name}</p>
                      <p className="text-sm text-gray-400">{order.order_qty} units</p>
                    </div>
                    <button
                      onClick={() => placeWarehouseOrder(order)}
                      disabled={placingOrder === order.product_id}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow transition-all duration-200 disabled:opacity-50"
                    >
                      {placingOrder === order.product_id ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.urgency === 'high'
                      ? 'bg-red-800 text-red-100'
                      : 'bg-yellow-800 text-yellow-100'
                  }`}>
                    {order.urgency.toUpperCase()} Priority
                  </span>
                  <span className="text-xs text-gray-500">
                    ETA: {new Date(order.estimated_delivery).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

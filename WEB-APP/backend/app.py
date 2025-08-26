from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import json
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')
import math
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Configuration for CSV file paths
CSV_CONFIG = {
    'stores': 'data/stores.csv',
    'products': 'data/products.csv',
    'sales_history': 'data/sales_history.csv',
    'holidays': 'data/holidays.csv',
    'warehouse_inventory': 'data/warehouse_inventory.csv',
    'store_distances': 'data/store_distances.csv',
    'pending_orders': 'data/pending_orders.csv',
    'transfer_history': 'data/transfer_history.csv'
}

class InventoryPredictor:
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        
    def predict_shortage(self, sales_data, current_stock, holiday_impact=1.0):
        """Predict when a product will run out of stock"""
        now = datetime.now()

        if current_stock <= 0:
            return (now + timedelta(days=1)).isoformat()

        if len(sales_data) < 5 or sum(sales_data) == 0:
            # Not enough data or zero sales, return far future date
            return (now + timedelta(days=30)).isoformat()

        # Prepare features (day number, holiday impact)
        X = np.array([[i, holiday_impact] for i in range(len(sales_data))])
        y = np.array(sales_data)

        # Fit model
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)

        # Predict next 30 days
        future_days = 30
        future_X = np.array([[len(sales_data) + i, holiday_impact] for i in range(future_days)])
        future_X_scaled = self.scaler.transform(future_X)
        predictions = self.model.predict(future_X_scaled)

        cumulative_sales = 0
        for i, daily_sales in enumerate(predictions):
            cumulative_sales += max(0, daily_sales)  # No negative sales
            if cumulative_sales >= current_stock:
                predicted_day = max(i + 1, 2)  # At least 2 days ahead
                return (now + timedelta(days=predicted_day)).isoformat()

        # If still in stock after 30 days
        return (now + timedelta(days=30)).isoformat()

class EmergencyRebalancer:
    def __init__(self):
        self.safety_buffer = 0.2  # 20% safety buffer
        self.max_transfer_distance = 50  # km
        
    def calculate_priority_score(self, shortage_qty, urgency_factor, availability_score):
        """Calculate emergency priority score"""
        if availability_score == 0:
            return float('inf')
        return (shortage_qty * urgency_factor) / availability_score
    
    def get_store_distance(self, store1_id, store2_id, distances_df):
        """Get distance between two stores"""
        distance_row = distances_df[
            ((distances_df['store1_id'] == store1_id) & (distances_df['store2_id'] == store2_id)) |
            ((distances_df['store1_id'] == store2_id) & (distances_df['store2_id'] == store1_id))
        ]
        return distance_row['distance_km'].iloc[0] if not distance_row.empty else 999
    
    def find_rebalance_opportunities(self, products_df, distances_df):
        """Find store-to-store rebalancing opportunities"""
        rebalance_suggestions = []
        
        # Group products by product name across stores
        product_groups = products_df.groupby('name')
        
        for product_name, group in product_groups:
            # Find stores with shortages and surpluses
            shortages = []
            surpluses = []
            
            for _, product in group.iterrows():
                stock_ratio = product['current_stock'] / product['max_capacity']
                safety_level = product['min_threshold'] * (1 + self.safety_buffer)
                
                if product['current_stock'] <= product['min_threshold']:
                    shortage_qty = safety_level - product['current_stock']
                    urgency = 3 if product['current_stock'] <= product['min_threshold'] * 0.5 else 2
                    shortages.append({
                        'store_id': product['store_id'],
                        'product_id': product['product_id'],
                        'shortage_qty': shortage_qty,
                        'urgency': urgency,
                        'current_stock': product['current_stock']
                    })
                elif product['current_stock'] > safety_level:
                    surplus_qty = product['current_stock'] - safety_level
                    surpluses.append({
                        'store_id': product['store_id'],
                        'product_id': product['product_id'],
                        'surplus_qty': surplus_qty,
                        'current_stock': product['current_stock']
                    })
            
            # Match shortages with surpluses
            for shortage in shortages:
                best_match = None
                best_distance = float('inf')
                
                for surplus in surpluses:
                    if surplus['store_id'] == shortage['store_id']:
                        continue
                    
                    distance = self.get_store_distance(
                        shortage['store_id'], surplus['store_id'], distances_df
                    )
                    
                    if distance <= self.max_transfer_distance and distance < best_distance:
                        transfer_qty = min(shortage['shortage_qty'], surplus['surplus_qty'])
                        if transfer_qty > 0:
                            best_match = {
                                'from_store': surplus['store_id'],
                                'to_store': shortage['store_id'],
                                'product_name': product_name,
                                'transfer_qty': transfer_qty,
                                'distance': distance,
                                'priority': self.calculate_priority_score(
                                    shortage['shortage_qty'], 
                                    shortage['urgency'], 
                                    surplus['surplus_qty']
                                )
                            }
                            best_distance = distance
                
                if best_match:
                    rebalance_suggestions.append(best_match)
        
        # Sort by priority score (highest first)
        return sorted(rebalance_suggestions, key=lambda x: x['priority'], reverse=True)
    
    def generate_warehouse_orders(self, products_df, warehouse_df):
        """Generate warehouse orders for products that can't be rebalanced"""
        warehouse_orders = []
        
        for _, product in products_df.iterrows():
            if product['current_stock'] <= product['min_threshold']:
                # Check if warehouse has stock
                warehouse_stock = warehouse_df[
                    warehouse_df['product_name'] == product['name']
                ]
                
                if not warehouse_stock.empty:
                    warehouse_item = warehouse_stock.iloc[0]
                    if warehouse_item['available_stock'] > 0:
                        order_qty = min(
                            product['max_capacity'] - product['current_stock'],
                            warehouse_item['available_stock']
                        )
                        
                        urgency = 'high' if product['current_stock'] <= product['min_threshold'] * 0.5 else 'medium'
                        delivery_time = 24 if urgency == 'high' else 48  # hours
                        
                        warehouse_orders.append({
                            'store_id': product['store_id'],
                            'product_name': product['name'],
                            'product_id': product['product_id'],
                            'order_qty': order_qty,
                            'urgency': urgency,
                            'estimated_delivery': (datetime.now() + timedelta(hours=delivery_time)).isoformat(),
                            'warehouse_location': warehouse_item['warehouse_location']
                        })
        
        return sorted(warehouse_orders, key=lambda x: x['urgency'] == 'high', reverse=True)
predictor = InventoryPredictor()
rebalancer = EmergencyRebalancer()

def load_csv_data(file_path):
    """Load CSV data with error handling"""
    try:
        if os.path.exists(file_path):
            return pd.read_csv(file_path)
        else:
            print(f"Warning: {file_path} not found. Using sample data.")
            return create_sample_data(file_path)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return create_sample_data(file_path)

def create_sample_data(file_path):
    """Create sample data if CSV files don't exist"""
    filename = os.path.basename(file_path)
    
    if filename == 'stores.csv':
        return pd.DataFrame({
            'store_id': ['S001', 'S002', 'S003'],
            'store_name': ['Walmart Supercenter - Downtown', 'Walmart Neighborhood Market - Eastside', 'Walmart Supercenter - Westfield'],
            'location': ['Downtown Plaza, NY', 'Eastside Mall, NY', 'Westfield Avenue, NY'],
            'manager': ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez'],
            'total_value': [125000, 98000, 142000]
        })
    
    elif filename == 'products.csv':
        products = []
        store_ids = ['S001', 'S002', 'S003']
        base_products = [
            {'name': 'Milk (1 Gallon)', 'category': 'Dairy', 'price': 3.49},
            {'name': 'Bread (Whole Wheat)', 'category': 'Bakery', 'price': 2.99},
            {'name': 'Bananas (per lb)', 'category': 'Produce', 'price': 0.68},
            {'name': 'Ground Beef (1 lb)', 'category': 'Meat', 'price': 5.99},
            {'name': 'Coca Cola (12 pack)', 'category': 'Beverages', 'price': 4.99}
        ]
        
        for store_id in store_ids:
            for i, product in enumerate(base_products):
                products.append({
                    'product_id': f'P{i+1:03d}_{store_id}',
                    'store_id': store_id,
                    'name': product['name'],
                    'category': product['category'],
                    'current_stock': np.random.randint(10, 200),
                    'min_threshold': np.random.randint(20, 50),
                    'max_capacity': np.random.randint(100, 300),
                    'price': product['price'],
                    'last_restocked': (datetime.now() - timedelta(days=np.random.randint(1, 7))).strftime('%Y-%m-%d'),
                    'trend': np.random.choice(['increasing', 'decreasing', 'stable']),
                    'holiday_impact': round(np.random.uniform(1.0, 3.0), 1)
                })
        
        return pd.DataFrame(products)
    
    elif filename == 'sales_history.csv':
        sales = []
        for store_id in ['S001', 'S002', 'S003']:
            for product_num in range(1, 6):
                product_id = f'P{product_num:03d}_{store_id}'
                for day in range(30):  # 30 days of history
                    date = datetime.now() - timedelta(days=day)
                    sales.append({
                        'product_id': product_id,
                        'store_id': store_id,
                        'date': date.strftime('%Y-%m-%d'),
                        'units_sold': np.random.randint(1, 20),
                        'revenue': np.random.uniform(10, 100)
                    })
        
        return pd.DataFrame(sales)
    
    elif filename == 'holidays.csv':
        return pd.DataFrame({
            'holiday_name': ['Christmas', 'Thanksgiving', 'New Year', 'Easter'],
            'date': ['2024-12-25', '2024-11-28', '2024-12-31', '2024-03-31'],
            'impact_multiplier': [2.5, 3.0, 1.8, 2.0],
            'affected_categories': ['Food,Beverages,Seasonal', 'Food,Beverages', 'Beverages,Seasonal', 'Food,Seasonal']
        })
    
    elif filename == 'warehouse_inventory.csv':
        warehouse_products = [
            {'product_name': 'Milk (1 Gallon)', 'available_stock': 500, 'warehouse_location': 'Central Warehouse'},
            {'product_name': 'Bread (Whole Wheat)', 'available_stock': 300, 'warehouse_location': 'Central Warehouse'},
            {'product_name': 'Bananas (per lb)', 'available_stock': 800, 'warehouse_location': 'Central Warehouse'},
            {'product_name': 'Ground Beef (1 lb)', 'available_stock': 200, 'warehouse_location': 'Central Warehouse'},
            {'product_name': 'Coca Cola (12 pack)', 'available_stock': 400, 'warehouse_location': 'Central Warehouse'}
        ]
        return pd.DataFrame(warehouse_products)
    
    elif filename == 'store_distances.csv':
        distances = [
            {'store1_id': 'S001', 'store2_id': 'S002', 'distance_km': 15.5},
            {'store1_id': 'S001', 'store2_id': 'S003', 'distance_km': 22.3},
            {'store1_id': 'S002', 'store2_id': 'S003', 'distance_km': 18.7}
        ]
        return pd.DataFrame(distances)
    
    elif filename == 'pending_orders.csv':
        return pd.DataFrame(columns=['order_id', 'store_id', 'product_name', 'quantity', 'status', 'created_at', 'estimated_delivery'])
    
    elif filename == 'transfer_history.csv':
        return pd.DataFrame(columns=['transfer_id', 'from_store', 'to_store', 'product_name', 'quantity', 'status', 'created_at', 'completed_at'])

# Load data
stores_df = load_csv_data(CSV_CONFIG['stores'])
products_df = load_csv_data(CSV_CONFIG['products'])
sales_df = load_csv_data(CSV_CONFIG['sales_history'])
holidays_df = load_csv_data(CSV_CONFIG['holidays'])
warehouse_df = load_csv_data(CSV_CONFIG['warehouse_inventory'])
distances_df = load_csv_data(CSV_CONFIG['store_distances'])
pending_orders_df = load_csv_data(CSV_CONFIG['pending_orders'])
transfer_history_df = load_csv_data(CSV_CONFIG['transfer_history'])

@app.route('/api/stores', methods=['GET'])
def get_stores():
    """Get all stores with alert counts"""
    stores_list = []
    
    for _, store in stores_df.iterrows():
        store_products = products_df[products_df['store_id'] == store['store_id']]
        alert_count = len(store_products[store_products['current_stock'] <= store_products['min_threshold']])
        
        stores_list.append({
            'id': store['store_id'],
            'name': store['store_name'],
            'location': store['location'],
            'manager': store['manager'],
            'totalValue': int(store['total_value']),
            'alertCount': alert_count
        })
    
    return jsonify(stores_list)

@app.route('/api/stores/<store_id>/products', methods=['GET'])
def get_store_products(store_id):
    """Get all products for a specific store"""
    store_products = products_df[products_df['store_id'] == store_id]
    products_list = []
    
    for _, product in store_products.iterrows():
        # Get sales history for prediction
        product_sales = sales_df[sales_df['product_id'] == product['product_id']]
        sales_data = product_sales.sort_values('date')['units_sold'].tolist()
        
        # Get holiday impact
        holiday_impact = get_holiday_impact(product['category'])
        
        # Predict shortage
        predicted_out = predictor.predict_shortage(
            sales_data, 
            product['current_stock'], 
            holiday_impact
        )
        
        products_list.append({
            'id': product['product_id'],
            'name': product['name'],
            'category': product['category'],
            'currentStock': int(product['current_stock']),
            'minThreshold': int(product['min_threshold']),
            'maxCapacity': int(product['max_capacity']),
            'price': float(product['price']),
            'lastRestocked': product['last_restocked'],
            'predictedOutOfStock': predicted_out,
            'trend': product['trend'],
            'holidayImpact': float(product['holiday_impact'])
        })
    
    return jsonify(products_list)

@app.route('/api/stores/<store_id>/alerts', methods=['GET'])
def get_store_alerts(store_id):
    """Get alerts for a specific store"""
    store_products = products_df[products_df['store_id'] == store_id]
    alerts = []
    
    for _, product in store_products.iterrows():
        if product['current_stock'] <= product['min_threshold']:
            severity = 'high' if product['current_stock'] <= product['min_threshold'] * 0.5 else 'medium'
            alerts.append({
                'id': f"alert_{product['product_id']}",
                'storeId': store_id,
                'productId': product['product_id'],
                'type': 'low_stock',
                'message': f"{product['name']} running low - only {product['current_stock']} units left",
                'severity': severity,
                'timestamp': datetime.now().isoformat()
            })
    
    return jsonify(alerts)

@app.route('/api/stores/<store_id>/insights', methods=['GET'])
def get_ai_insights(store_id):
    """Get AI insights for a specific store"""
    store_products = products_df[products_df['store_id'] == store_id]
    
    low_stock_products = store_products[store_products['current_stock'] <= store_products['min_threshold']]
    high_demand_products = store_products[store_products['holiday_impact'] > 1.5]
    
    insights = [
        {
            'type': 'prediction',
            'title': 'Stock Shortage Prediction',
            'message': f"{len(low_stock_products)} products predicted to run out within 3 days",
            'severity': 'high' if len(low_stock_products) > 2 else 'medium',
            'action': 'Review restock schedule'
        },
        {
            'type': 'holiday',
            'title': 'Holiday Demand Analysis',
            'message': f"{len(high_demand_products)} products show increased holiday demand patterns",
            'severity': 'medium',
            'action': 'Increase order quantities'
        },
        {
            'type': 'trend',
            'title': 'Sales Trend Analysis',
            'message': 'Dairy products showing 15% increase in demand this week',
            'severity': 'low',
            'action': 'Monitor closely'
        }
    ]
    
    return jsonify(insights)

def get_holiday_impact(category):
    """Calculate holiday impact for a category"""
    upcoming_holidays = holidays_df[pd.to_datetime(holidays_df['date']) > datetime.now()]
    
    for _, holiday in upcoming_holidays.iterrows():
        affected_categories = holiday['affected_categories'].split(',')
        if category in affected_categories:
            return holiday['impact_multiplier']
    
    return 1.0

@app.route('/api/rebalance/suggestions', methods=['GET'])
def get_rebalance_suggestions():
    """Get store-to-store rebalancing suggestions"""
    try:
        suggestions = rebalancer.find_rebalance_opportunities(products_df, distances_df)
        return jsonify(suggestions[:10])  # Return top 10 suggestions
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """Get overall analytics across all stores"""
    total_products = len(products_df)
    low_stock_count = len(products_df[products_df['current_stock'] <= products_df['min_threshold']])
    critical_stock_count = len(products_df[products_df['current_stock'] <= products_df['min_threshold'] * 0.5])
    avg_stock_level = (products_df['current_stock'] / products_df['max_capacity']).mean()
    
    return jsonify({
        'totalProducts': total_products,
        'lowStockCount': low_stock_count,
        'criticalStockCount': critical_stock_count,
        'avgStockLevel': round(avg_stock_level * 100, 1)
    })

@app.route('/api/rebalance/execute', methods=['POST'])
def execute_rebalance():
    """Execute a store-to-store transfer"""
    try:
        data = request.json
    finally:
        print("ok")
@app.route('/api/warehouse/orders', methods=['GET'])
def get_warehouse_orders():
    """Get warehouse order suggestions"""
    try:
        orders = rebalancer.generate_warehouse_orders(products_df, warehouse_df)
        return jsonify(orders[:10])  # Return top 10 orders
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        from_store = data['from_store']
@app.route('/api/warehouse/place-order', methods=['POST'])
def place_warehouse_order():
    """Place an order from warehouse to store"""
    try:
        data = request.json
        store_id = data['store_id']
        product_name = data['product_name']
        order_qty = data['order_qty']
        urgency = data['urgency']
        
        # Create order record
        order_id = f"WO{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # In a real system, you would update the database
        # For demo, we'll just return success
        
        return jsonify({
            'success': True,
            'order_id': order_id,
            'message': f'Warehouse order for {order_qty} units of {product_name} to {store_id} placed successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        to_store = data['to_store']
@app.route('/api/emergency/dashboard', methods=['GET'])
def get_emergency_dashboard():
    """Get emergency dashboard data"""
    try:
        rebalance_suggestions = rebalancer.find_rebalance_opportunities(products_df, distances_df)
        warehouse_orders = rebalancer.generate_warehouse_orders(products_df, warehouse_df)
        
        # Calculate emergency metrics
        critical_shortages = len(products_df[products_df['current_stock'] <= products_df['min_threshold'] * 0.5])
        pending_transfers = len(rebalance_suggestions)
        pending_warehouse_orders = len(warehouse_orders)
        
        return jsonify({
            'critical_shortages': critical_shortages,
            'pending_transfers': pending_transfers,
            'pending_warehouse_orders': pending_warehouse_orders,
            'rebalance_suggestions': rebalance_suggestions[:5],
            'warehouse_orders': warehouse_orders[:5]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        product_name = data['product_name']
        transfer_qty = data['transfer_qty']
        
        # Create transfer record
        transfer_id = f"T{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # In a real system, you would update the database
        # For demo, we'll just return success
        
        return jsonify({
            'success': True,
            'transfer_id': transfer_id,
            'message': f'Transfer of {transfer_qty} units of {product_name} from {from_store} to {to_store} initiated'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    app.run(debug=True, port=5000)
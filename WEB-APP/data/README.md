# CSV Data Files

Place your CSV files in this directory with the following structure:

## stores.csv
Required columns:
- store_id: Unique identifier for each store
- store_name: Name of the store
- location: Store location
- manager: Store manager name
- total_value: Total inventory value

## products.csv
Required columns:
- product_id: Unique identifier for each product
- store_id: Store identifier (foreign key)
- name: Product name
- category: Product category
- current_stock: Current stock level
- min_threshold: Minimum stock threshold
- max_capacity: Maximum storage capacity
- price: Product price
- last_restocked: Last restock date (YYYY-MM-DD)
- trend: Sales trend (increasing/decreasing/stable)
- holiday_impact: Holiday impact multiplier

## sales_history.csv
Required columns:
- product_id: Product identifier (foreign key)
- store_id: Store identifier (foreign key)
- date: Sale date (YYYY-MM-DD)
- units_sold: Number of units sold
- revenue: Revenue generated

## holidays.csv
Required columns:
- holiday_name: Name of the holiday
- date: Holiday date (YYYY-MM-DD)
- impact_multiplier: Impact on sales (multiplier)
- affected_categories: Comma-separated list of affected categories

## Sample Data
If CSV files are not found, the system will automatically generate sample data for demonstration purposes.
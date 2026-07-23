#!/bin/bash

echo "Resetting database connections..."

# Stop all services
echo "1. Stopping Docker containers..."
docker compose down

# Wait for complete shutdown
sleep 3

# Start database with new settings
echo "2. Starting database with increased max_connections..."
docker compose up -d db

# Wait for database to be ready
echo "3. Waiting for database to be ready..."
sleep 5

# Show database connection info
echo "4. Checking database status..."
docker compose exec db psql -U myuser -d mydb -c "SELECT count(*) FROM pg_stat_activity WHERE datname='mydb';"

echo "✅ Database reset complete!"
echo ""
echo "Now you can start your dev servers:"
echo "  npm run dev (in the root directory)"

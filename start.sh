#!/bin/sh

echo "🚀 Starting Railway deployment..."
echo "🔧 Environment: $NODE_ENV"

# Database migration
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Database migrations completed successfully"
else
  echo "❌ Database migrations failed"
  exit 1
fi

# Start the application
echo "🚀 Starting the application..."
node dist/index.js

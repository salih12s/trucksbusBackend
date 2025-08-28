FROM node:20-alpine

WORKDIR /app

# 1) Package files kopyala ve dependencies yükle
COPY package*.json ./
RUN npm ci

# 2) Prisma client generate
COPY prisma ./prisma/
RUN npx prisma generate

# 3) Source code kopyala
COPY . .

# 4) TypeScript compile
RUN npx tsc

# Production environment
ENV NODE_ENV=production
EXPOSE 3000

# Database migration ve server start script
COPY start.sh ./
RUN chmod +x start.sh

# Start script ile migration + server
CMD ["./start.sh"]

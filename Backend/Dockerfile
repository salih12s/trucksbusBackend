# Railway için Dockerfile (opsiyonel - Node.js detect edilir)

FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Package files kopyala
COPY package*.json ./
COPY prisma ./prisma/

# Dependencies yükle
RUN npm ci --only=production

# Source code kopyala
COPY . .

# TypeScript build
RUN npm run build

# Prisma generate
RUN npx prisma generate

# Port expose
EXPOSE 3005

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3005/api/health || exit 1

# Start command
CMD ["npm", "start"]

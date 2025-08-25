# Railway için optimized Dockerfile

FROM node:20-alpine

# Çalışma dizini
WORKDIR /app

# Package files kopyala
COPY package*.json ./

# Dependencies yükle (production only)
RUN npm ci --omit=dev

# Prisma schema kopyala ve generate et
COPY prisma ./prisma/
RUN npx prisma generate

# Source code kopyala
COPY . .

# TypeScript build
RUN npm run build

# Production environment
ENV NODE_ENV=production

# Railway kendi PORT'unu verir
EXPOSE 3000

# Start command
CMD ["npm", "start"]

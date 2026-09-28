FROM node:21-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:21-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]

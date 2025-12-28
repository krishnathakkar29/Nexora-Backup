
FROM node:22-alpine AS dependencies
RUN apk add --no-cache libc6-compat

ARG DATABASE_URL

WORKDIR /app

COPY package*.json ./

RUN npm ci 

FROM node:22-alpine AS builder

ARG DATABASE_URL

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN npm run build
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate --schema=./prisma/schema.prisma

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./


EXPOSE 8181

CMD ["npm", "start"]
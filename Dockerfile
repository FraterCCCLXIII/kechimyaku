FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN mkdir -p /app/data
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data && npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0 --port ${PORT}"]

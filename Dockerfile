FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN npm ci --ignore-scripts

COPY . .

RUN mkdir -p /app/data
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data && npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0 --port ${PORT}"]

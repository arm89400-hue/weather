FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

FROM base AS deps
RUN npm install --workspace backend --include-workspace-root

FROM deps AS build
COPY backend/ backend/
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY backend/package.json backend/package.json

WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "dist/server.js"]

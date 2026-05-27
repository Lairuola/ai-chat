# ── Build stage ──
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# Install root deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Install ui deps
COPY ui/package.json ui/pnpm-lock.yaml ./ui/
RUN cd ui && pnpm install --frozen-lockfile

# Install server deps
COPY server/package.json server/pnpm-lock.yaml ./server/
RUN cd server && pnpm install --frozen-lockfile

# Build frontend
COPY . .
RUN cd ui && pnpm build

# ── Runtime stage ──
FROM node:22-alpine
WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production

COPY --from=build /app/server /app/server
COPY --from=build /app/ui/dist /app/ui/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/server/node_modules /app/server/node_modules
COPY --from=build /app/package.json /app/package.json

EXPOSE 3090

CMD ["node", "server/server.js"]

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (cache layer)
COPY package*.json ./
RUN npm ci

# Build-time env: empty VITE_API_BASE makes all API calls relative (/api/...)
# nginx proxies /api/* → backend:8000 so the frontend and API share one origin
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE

COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

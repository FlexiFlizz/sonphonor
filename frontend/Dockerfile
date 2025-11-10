# =================================
# Frontend Dockerfile - Optimisé pour Portainer
# =================================

# Étape 1: Construction
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments de build
ARG REACT_APP_API_URL=/api

# Installation des dépendances système
RUN apk add --no-cache libc6-compat

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances
RUN npm ci --prefer-offline --no-audit

# Copie du code source
COPY . .

# Variables d'environnement pour le build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production

# Build de l'application avec optimisations
RUN npm run build

# =================================
# Étape 2: Production avec Nginx
# =================================
FROM nginx:alpine AS production

# Installation de wget pour healthcheck
RUN apk add --no-cache wget

# Copie des fichiers buildés depuis l'étape builder
COPY --from=builder /app/build /usr/share/nginx/html

# Configuration Nginx optimisée pour React Router et API Proxy
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Cache des assets statiques \
    location ~* \\.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Proxy API vers le backend \
    location /api { \
        proxy_pass http://backend:4000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_cache_bypass $http_upgrade; \
        proxy_read_timeout 300s; \
        proxy_connect_timeout 75s; \
    } \
    \
    # Health check endpoint \
    location /health { \
        access_log off; \
        return 200 "OK\\n"; \
        add_header Content-Type text/plain; \
    } \
    \
    # React Router - toutes les routes vers index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Créer un utilisateur nginx non-root
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Passer à l'utilisateur non-root
USER nginx-user

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

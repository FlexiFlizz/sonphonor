# Frontend Dockerfile
# Étape 1: Construction
FROM node:20-alpine as builder

WORKDIR /app

# Arguments de build
ARG REACT_APP_API_URL=http://localhost:4000

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Variables d'environnement pour le build
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build de l'application
RUN npm run build

# Étape 2: Production
FROM nginx:alpine

# Copie des fichiers buildés
COPY --from=builder /app/build /usr/share/nginx/html

# Configuration Nginx pour React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:4000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

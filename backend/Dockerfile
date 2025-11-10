# =================================
# Backend Dockerfile - Optimisé pour Portainer
# =================================

# Étape 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma
RUN apk add --no-cache \
    openssl \
    libc6-compat

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation de toutes les dépendances (dev + prod)
RUN npm ci

# Génération du client Prisma
RUN npx prisma generate

# Copie du code source
COPY . .

# Build de l'application (si applicable - TypeScript, etc.)
# RUN npm run build

# =================================
# Étape 2: Production
# =================================
FROM node:20-alpine AS production

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    wget \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copie des dépendances et du build depuis l'étape builder
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copie du code source
COPY --chown=nodejs:nodejs . .

# Création du dossier uploads avec les bonnes permissions
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Passer à l'utilisateur non-root
USER nodejs

# Exposition du port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

# Commande de démarrage
CMD ["npm", "run", "start:prod"]

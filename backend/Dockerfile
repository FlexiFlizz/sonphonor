# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl

# Copie des fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci --only=production

# Génération du client Prisma
RUN npx prisma generate

# Copie du code source
COPY . .

# Création du dossier uploads
RUN mkdir -p /app/uploads

# Exposition du port
EXPOSE 4000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]

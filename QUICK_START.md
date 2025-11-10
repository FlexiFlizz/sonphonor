# 🚀 Démarrage ultra-rapide - Portainer

## Méthode la plus simple (Web Editor)

### 1️⃣ Ouvrir Portainer
- Accédez à : `http://votre-serveur:9000`
- Connectez-vous

### 2️⃣ Créer un nouveau Stack
1. Menu latéral : **Stacks**
2. Bouton : **+ Add stack**
3. Nom du stack : `sonphonor`
4. Build method : **Web editor**

### 3️⃣ Copier la configuration Docker Compose

Copiez et collez **tout** le contenu ci-dessous dans l'éditeur :

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sonphonor-db
    restart: always
    environment:
      POSTGRES_DB: sonphonor
      POSTGRES_USER: sonphonor_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sonphonor-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sonphonor_user -d sonphonor"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sonphonor-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - sonphonor-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: node:20-alpine
    container_name: sonphonor-backend
    restart: always
    working_dir: /app
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://sonphonor_user:${DB_PASSWORD}@postgres:5432/sonphonor
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 4000
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - backend_modules:/app/node_modules
    networks:
      - sonphonor-network
    command: sh -c "npm install && npm run prisma:generate && node src/index.js"

  frontend:
    image: node:20-alpine
    container_name: sonphonor-frontend
    restart: always
    working_dir: /app
    environment:
      REACT_APP_API_URL: ${API_URL}
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - frontend_modules:/app/node_modules
    networks:
      - sonphonor-network
    command: sh -c "npm install && npm start"

volumes:
  postgres_data:
  redis_data:
  backend_modules:
  frontend_modules:

networks:
  sonphonor-network:
    driver: bridge
```

### 4️⃣ Ajouter les variables d'environnement

Descendez jusqu'à la section **Environment variables** et ajoutez :

**Cliquez sur "+ add an environment variable"** pour chaque ligne :

| Name | Value |
|------|-------|
| `DB_PASSWORD` | `VotreMotDePasse123!` ⚠️ **À CHANGER** |
| `JWT_SECRET` | `VotreSecretJWT456!` ⚠️ **À CHANGER** |
| `FRONTEND_URL` | `http://VOTRE_IP:3000` |
| `API_URL` | `http://VOTRE_IP:4000` |

**Remplacez `VOTRE_IP`** par l'adresse IP de votre serveur !

### 5️⃣ Déployer

1. Cliquez sur **Deploy the stack** en bas
2. Attendez quelques secondes
3. Les conteneurs vont se créer et démarrer

### 6️⃣ Uploader les fichiers de code

**Vous devez uploader les dossiers `backend` et `frontend` sur votre serveur :**

#### Via SFTP/SCP :
```bash
# Depuis votre machine locale
scp -r backend/ user@votre-serveur:/var/lib/docker/volumes/sonphonor_backend/_data/
scp -r frontend/ user@votre-serveur:/var/lib/docker/volumes/sonphonor_frontend/_data/
```

#### Ou via Git sur le serveur :
```bash
# Se connecter au serveur
ssh user@votre-serveur

# Créer un dossier pour le projet
mkdir -p /opt/sonphonor
cd /opt/sonphonor

# Cloner le repository
git clone https://github.com/FlexiFlizz/sonphonor.git .
git checkout claude/audio-equipment-management-011CUygZTptpRDHMqmscWY2t
```

Puis dans Portainer, modifiez le stack pour pointer vers `/opt/sonphonor` :
```yaml
volumes:
  - /opt/sonphonor/backend:/app
```

### 7️⃣ Initialiser la base de données

Dans Portainer :

1. **Containers** → Cliquez sur `sonphonor-backend`
2. **Console** → Sélectionnez `/bin/sh`
3. Cliquez sur **Connect**
4. Exécutez ces commandes **une par une** :

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 8️⃣ Accéder à l'application

Ouvrez votre navigateur :
- Frontend : `http://VOTRE_IP:3000`
- API : `http://VOTRE_IP:4000/health`

### 9️⃣ Première connexion

- Email : `admin@sonphonor.com`
- Mot de passe : `admin123`

⚠️ **Changez ce mot de passe immédiatement !**

---

## ⚡ Méthode alternative : Clone Git direct

Si vous préférez utiliser Git directement :

```bash
# 1. Connexion SSH au serveur
ssh user@votre-serveur

# 2. Créer le dossier
sudo mkdir -p /opt/sonphonor
cd /opt/sonphonor

# 3. Cloner le projet
sudo git clone https://github.com/FlexiFlizz/sonphonor.git .
sudo git checkout claude/audio-equipment-management-011CUygZTptpRDHMqmscWY2t

# 4. Configuration
sudo cp .env.example .env
sudo nano .env  # Modifier les valeurs

# 5. Lancer
sudo docker-compose up -d

# 6. Initialiser la DB
sudo docker-compose exec backend npm run prisma:generate
sudo docker-compose exec backend npm run prisma:migrate
sudo docker-compose exec backend npm run prisma:seed

# 7. Vérifier
sudo docker-compose ps
```

---

## 🔍 Vérification

### Les conteneurs sont-ils actifs ?

Dans Portainer → **Containers**, vous devez voir :
- ✅ `sonphonor-backend` - **running**
- ✅ `sonphonor-frontend` - **running**
- ✅ `sonphonor-db` - **running** (healthy)
- ✅ `sonphonor-redis` - **running** (healthy)

### Test de l'API

Ouvrez dans votre navigateur :
```
http://VOTRE_IP:4000/health
```

Vous devriez voir :
```json
{
  "status": "healthy",
  "timestamp": "...",
  "service": "sonphonor-api"
}
```

### Test du Frontend

Ouvrez :
```
http://VOTRE_IP:3000
```

Vous devriez voir la page de connexion.

---

## ❌ Problèmes courants

### "Cannot connect to backend"

➡️ Vérifiez que `API_URL` dans les variables d'environnement est correct

### "Database connection error"

➡️ Attendez que PostgreSQL soit ready (healthy) avant de lancer le backend

### "Port already in use"

➡️ Les ports 3000, 4000, 5432 ou 6379 sont déjà utilisés. Changez-les dans le docker-compose.

### Les conteneurs redémarrent en boucle

➡️ Regardez les logs dans Portainer → Containers → (cliquez sur le conteneur) → Logs

---

## 📞 Besoin d'aide ?

Consultez les fichiers détaillés :
- **PORTAINER_DEPLOY.md** - Guide complet de déploiement
- **INSTRUCTIONS.md** - Manuel d'utilisation
- **README.md** - Documentation générale

---

**C'est parti ! 🎵**

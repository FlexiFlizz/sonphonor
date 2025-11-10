# 🚀 Déploiement Sonphonor sur Portainer

Guide complet pour déployer Sonphonor comme une stack Docker sur Portainer.

## 📋 Prérequis

- ✅ Portainer installé et accessible (version 2.0+)
- ✅ Docker Engine 20.10+ et Docker Compose v2
- ✅ Serveur avec au minimum 2GB RAM et 10GB d'espace disque
- ✅ Accès au repository Git ou aux fichiers du projet

---

## 🎯 Méthode 1 : Déploiement via Repository Git (Recommandé)

### Étape 1 : Se connecter à Portainer

1. Accédez à votre instance Portainer : `https://votre-serveur:9443`
2. Connectez-vous avec vos identifiants

### Étape 2 : Créer une nouvelle Stack

1. Dans le menu principal, cliquez sur **"Stacks"**
2. Cliquez sur **"+ Add stack"**
3. Donnez un nom à votre stack : `sonphonor`

### Étape 3 : Configuration de la Stack

#### Option A : Depuis un Repository Git

1. Sélectionnez **"Repository"** comme méthode de build
2. Configurez les paramètres Git :
   ```
   Repository URL: https://github.com/FlexiFlizz/sonphonor.git
   Repository reference: refs/heads/main
   Compose path: docker-compose.yml
   ```

3. **Variables d'environnement** - Ajoutez les variables suivantes :

   ```env
   # Base de données
   POSTGRES_DB=sonphonor
   POSTGRES_USER=sonphonor_user
   POSTGRES_PASSWORD=VotreMotDePasseSecurisé123!

   # Redis (laissez vide pour pas de mot de passe)
   REDIS_PASSWORD=

   # Sécurité
   JWT_SECRET=VotreSecretJWTTresLongEtComplexe!
   JWT_EXPIRES_IN=7d

   # Domaines
   FRONTEND_DOMAIN=sonphonor.votredomaine.com
   API_DOMAIN=api.sonphonor.votredomaine.com
   REACT_APP_API_URL=/api

   # CORS
   CORS_ORIGIN=*

   # Ports
   HTTP_PORT=80
   HTTPS_PORT=443

   # Application
   MAX_FILE_SIZE=10485760
   NODE_ENV=production
   ```

4. Cliquez sur **"Deploy the stack"**

#### Option B : Upload manuel du docker-compose.yml

1. Sélectionnez **"Upload"** comme méthode
2. Cliquez sur **"Upload file"** et sélectionnez `docker-compose.yml`
3. Ajoutez les variables d'environnement (voir ci-dessus)
4. Cliquez sur **"Deploy the stack"**

#### Option C : Web editor (Copier-Coller)

1. Sélectionnez **"Web editor"** comme méthode
2. Copiez-collez le contenu du fichier `docker-compose.yml`
3. Ajoutez les variables d'environnement
4. Cliquez sur **"Deploy the stack"**

---

## 🎯 Méthode 2 : Déploiement via CLI (Alternative)

Si vous préférez utiliser la ligne de commande :

```bash
# 1. Se connecter au serveur
ssh user@votre-serveur.com

# 2. Créer le dossier du projet
mkdir -p /opt/sonphonor
cd /opt/sonphonor

# 3. Cloner le repository
git clone https://github.com/FlexiFlizz/sonphonor.git .

# 4. Créer le fichier .env
cp .env.example .env
nano .env  # Éditer avec vos valeurs

# 5. Déployer via Portainer CLI (si installé)
portainer stack deploy sonphonor --stack-file docker-compose.yml --env-file .env

# OU déployer directement avec docker compose
docker compose up -d
```

---

## ⚙️ Configuration Post-Déploiement

### 1. Vérifier le statut des services

Dans Portainer :
1. Allez dans **"Stacks"** → **"sonphonor"**
2. Vérifiez que tous les conteneurs sont **"Running"** (vert)
3. Services attendus :
   - ✅ `postgres` - Base de données
   - ✅ `redis` - Cache
   - ✅ `backend` - API Node.js
   - ✅ `frontend` - Interface React
   - ✅ `nginx` - Reverse proxy

### 2. Vérifier les logs

Pour chaque service, cliquez sur l'icône de logs 📋 pour vérifier qu'il n'y a pas d'erreurs.

**Logs importants à vérifier** :
- **Backend** : Doit afficher "Server is running on port 4000"
- **Postgres** : Doit afficher "database system is ready to accept connections"
- **Redis** : Doit afficher "Ready to accept connections"
- **Frontend** : Pas d'erreurs Nginx

### 3. Initialiser la base de données

Exécutez les migrations Prisma dans le conteneur backend :

**Via Portainer** :
1. Allez dans **"Containers"**
2. Cliquez sur le conteneur **"backend"**
3. Cliquez sur **"Console"** → **"Connect"**
4. Exécutez :
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # Si vous avez des données de démo
   ```

**Via CLI** :
```bash
# Depuis votre serveur
docker exec -it sonphonor-backend-1 npx prisma migrate deploy
docker exec -it sonphonor-backend-1 npx prisma db seed
```

### 4. Tester l'application

Accédez à votre application via :
- **Frontend** : `http://votre-serveur:80` ou `https://votre-domaine.com`
- **API** : `http://votre-serveur:80/api/health`

---

## 🔒 Configuration HTTPS/SSL

### Option 1 : Avec un reverse proxy externe (Traefik/Caddy)

Si vous utilisez déjà Traefik ou Caddy, les labels sont déjà configurés dans le docker-compose.yml :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.sonphonor-web.rule=Host(`${FRONTEND_DOMAIN}`)"
```

### Option 2 : Avec Let's Encrypt et Certbot

1. **Installer Certbot dans le conteneur Nginx** :
   ```bash
   docker exec -it sonphonor-nginx-1 sh
   apk add certbot certbot-nginx
   certbot --nginx -d votredomaine.com -d api.votredomaine.com
   ```

2. **Renouvellement automatique** :
   Ajoutez un cron job :
   ```bash
   0 12 * * * docker exec sonphonor-nginx-1 certbot renew --quiet
   ```

### Option 3 : Certificat SSL personnalisé

1. Créez le dossier SSL :
   ```bash
   mkdir -p /opt/sonphonor/nginx/ssl
   ```

2. Copiez vos certificats :
   ```bash
   cp votre-certificat.crt /opt/sonphonor/nginx/ssl/
   cp votre-cle-privee.key /opt/sonphonor/nginx/ssl/
   ```

3. Ajoutez la configuration dans `/opt/sonphonor/nginx/conf.d/ssl.conf`

---

## 📊 Monitoring et Maintenance

### Surveiller les ressources

Dans Portainer :
1. **"Containers"** → Sélectionnez un conteneur
2. Onglet **"Stats"** pour voir CPU, RAM, Network

### Sauvegardes automatiques

**Script de sauvegarde** (`/opt/sonphonor/backup.sh`) :

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/sonphonor"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
docker exec sonphonor-postgres-1 pg_dump -U sonphonor_user sonphonor > "$BACKUP_DIR/db_$DATE.sql"

# Sauvegarder les uploads
docker cp sonphonor-backend-1:/app/uploads "$BACKUP_DIR/uploads_$DATE"

# Compresser
tar -czf "$BACKUP_DIR/sonphonor_backup_$DATE.tar.gz" "$BACKUP_DIR/db_$DATE.sql" "$BACKUP_DIR/uploads_$DATE"

# Nettoyer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/sonphonor_backup_$DATE.tar.gz"
```

**Automatiser avec cron** :
```bash
chmod +x /opt/sonphonor/backup.sh
crontab -e
# Ajouter : 0 2 * * * /opt/sonphonor/backup.sh
```

### Mise à jour de l'application

**Via Portainer** :
1. Allez dans **"Stacks"** → **"sonphonor"**
2. Cliquez sur **"Editor"**
3. Cliquez sur **"Pull and redeploy"** si vous utilisez Git
4. OU cliquez sur **"Update the stack"** après avoir modifié la configuration

**Via CLI** :
```bash
cd /opt/sonphonor
git pull
docker compose pull
docker compose up -d --build
docker exec sonphonor-backend-1 npx prisma migrate deploy
```

---

## 🐛 Dépannage

### Problème : Les conteneurs ne démarrent pas

**Vérifications** :
1. Logs du conteneur dans Portainer
2. Variables d'environnement correctement définies
3. Ports disponibles (80, 443 non utilisés par un autre service)

```bash
# Vérifier les ports utilisés
netstat -tulpn | grep -E ':(80|443|5432|6379|4000)'

# Vérifier les logs
docker compose logs -f
```

### Problème : Frontend ne peut pas accéder au Backend

**Solution** :
1. Vérifier que `REACT_APP_API_URL=/api` dans les variables d'environnement
2. Vérifier que le proxy Nginx fonctionne :
   ```bash
   docker exec sonphonor-frontend-1 cat /etc/nginx/conf.d/default.conf
   ```
3. Tester l'API directement :
   ```bash
   curl http://localhost/api/health
   ```

### Problème : Erreurs de base de données

**Solutions** :
1. Vérifier que le conteneur postgres est en "Running"
2. Vérifier les credentials :
   ```bash
   docker exec -it sonphonor-postgres-1 psql -U sonphonor_user -d sonphonor
   ```
3. Réinitialiser la base (⚠️ PERTE DE DONNÉES) :
   ```bash
   docker compose down -v
   docker compose up -d postgres
   docker exec sonphonor-postgres-1 psql -U sonphonor_user -d sonphonor
   # Puis redémarrer backend
   docker compose up -d backend
   docker exec sonphonor-backend-1 npx prisma migrate deploy
   ```

### Problème : Permissions sur les volumes

```bash
# Vérifier les volumes
docker volume ls
docker volume inspect sonphonor_postgres_data

# Réparer les permissions
docker exec sonphonor-backend-1 chown -R nodejs:nodejs /app/uploads
```

---

## 📈 Optimisations avancées

### 1. Limiter les ressources

Dans Portainer, éditez la stack et ajoutez pour chaque service :

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### 2. Mise en place de réplicas (Swarm mode)

Si vous utilisez Docker Swarm :

```yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
  restart_policy:
    condition: on-failure
```

### 3. Network isolation

Améliorer la sécurité en isolant les réseaux :

```yaml
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true
```

---

## ✅ Checklist de déploiement

- [ ] Portainer installé et accessible
- [ ] Variables d'environnement configurées
- [ ] Stack déployée sans erreurs
- [ ] Tous les conteneurs en état "Running"
- [ ] Migrations de base de données exécutées
- [ ] Application accessible via navigateur
- [ ] HTTPS/SSL configuré (production)
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Firewall configuré (ports 80, 443)
- [ ] Mots de passe par défaut changés

---

## 📞 Support et Ressources

### Documentation
- [Documentation Portainer](https://docs.portainer.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### Commandes utiles

```bash
# Status de la stack
docker compose ps

# Logs en temps réel
docker compose logs -f

# Redémarrer un service
docker compose restart backend

# Arrêter la stack
docker compose down

# Supprimer tout (⚠️ y compris les volumes)
docker compose down -v

# Nettoyer les images inutilisées
docker system prune -a

# Voir l'utilisation disque
docker system df
```

---

## 🎉 Félicitations !

Votre application Sonphonor est maintenant déployée et prête à être utilisée !

**Premiers pas** :
1. Connectez-vous avec les credentials par défaut
2. **Changez immédiatement le mot de passe admin**
3. Créez vos utilisateurs
4. Importez votre matériel

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation complète.

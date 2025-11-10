# 🐳 Guide de déploiement Portainer

## Option 1 : Déploiement via l'interface Web de Portainer (Recommandé)

### Étape 1 : Copier le docker-compose.yml

1. Connectez-vous à **Portainer** : http://votre-serveur:9000
2. Allez dans **Stacks** → **Add stack**
3. Donnez un nom : `sonphonor`
4. Choisissez **Web editor**

### Étape 2 : Coller la configuration

Copiez-collez le contenu du fichier `docker-compose.yml` dans l'éditeur.

### Étape 3 : Configurer les variables d'environnement

Dans la section "Environment variables", ajoutez :

```env
DB_PASSWORD=VotreMotDePasseSecurisé123!
JWT_SECRET=VotreSecretJWTTresLongEtAleatoire456!
FRONTEND_URL=http://votre-serveur:3000
API_URL=http://votre-serveur:4000
NODE_ENV=production
```

**IMPORTANT** : Changez ces valeurs !

### Étape 4 : Déployer

1. Cliquez sur **Deploy the stack**
2. Attendez que tous les conteneurs soient lancés (vert)

### Étape 5 : Initialiser la base de données

Dans Portainer, allez dans **Containers** :

1. Cliquez sur le conteneur `sonphonor-backend`
2. Cliquez sur **Console** → **Connect**
3. Exécutez ces commandes :

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Étape 6 : Accéder à l'application

- **Frontend** : http://votre-serveur:3000
- **API** : http://votre-serveur:4000
- **Adminer** : http://votre-serveur:8080

Connectez-vous avec :
- Email : admin@sonphonor.com
- Mot de passe : admin123

---

## Option 2 : Déploiement via Git Repository

Si vous souhaitez déployer depuis Git, suivez ces étapes :

### Sur votre serveur (via SSH)

```bash
# 1. Cloner le repository
git clone https://github.com/FlexiFlizz/sonphonor.git
cd sonphonor

# 2. Checkout de la branche
git checkout claude/audio-equipment-management-011CUygZTptpRDHMqmscWY2t

# 3. Configurer les variables
cp .env.example .env
nano .env  # Éditez avec vos valeurs

# 4. Lancer avec Docker
docker-compose up -d

# 5. Initialiser la base de données
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed

# 6. Vérifier que tout fonctionne
docker-compose ps
```

### Dans Portainer

Une fois que vous avez cloné le repository sur votre serveur :

1. **Stacks** → **Add stack**
2. **Upload** → Sélectionnez le fichier `docker-compose.yml`
3. Ou utilisez **Repository** avec le chemin local : `/chemin/vers/sonphonor`
4. Configurez les variables d'environnement
5. **Deploy the stack**

---

## Option 3 : Déploiement manuel fichier par fichier

Si Git ne fonctionne pas, vous pouvez :

1. Télécharger tous les fichiers du projet
2. Les uploader via SFTP/SCP sur votre serveur
3. Suivre les instructions de l'Option 2

---

## ⚙️ Configuration importante

### Variables d'environnement essentielles

Modifiez **obligatoirement** ces valeurs dans votre fichier `.env` :

```env
# Sécurité - CHANGEZ CES VALEURS !
DB_PASSWORD=VotreMotDePasseTresFort789!
JWT_SECRET=UnSecretJWTTresLongEtComplexe123456!

# URLs de votre serveur
FRONTEND_URL=http://votre-domaine.com:3000
API_URL=http://votre-domaine.com:4000

# Ou avec un nom de domaine complet
FRONTEND_URL=https://sonphonor.votre-domaine.com
API_URL=https://api.sonphonor.votre-domaine.com
```

### Configuration base de données

```env
DB_NAME=sonphonor
DB_USER=sonphonor_user
DB_HOST=postgres
DB_PORT=5432
```

### Ports exposés

- **3000** : Frontend React
- **4000** : Backend API
- **5432** : PostgreSQL (optionnel, peut être fermé)
- **6379** : Redis (optionnel, peut être fermé)
- **8080** : Adminer (à fermer en production)
- **80/443** : Nginx (si utilisé)

---

## 🔒 Sécurité pour la production

### 1. Firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3000/tcp    # Frontend
sudo ufw allow 4000/tcp    # API
sudo ufw enable
```

### 2. Fermer les ports de développement

Dans `docker-compose.yml`, commentez ces lignes :

```yaml
# postgres:
#   ports:
#     - "5432:5432"  # ← Commentez cette ligne

# redis:
#   ports:
#     - "6379:6379"  # ← Commentez cette ligne

# adminer:  # ← Commentez tout ce service en production
#   ...
```

### 3. SSL/HTTPS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d sonphonor.votre-domaine.com
```

---

## 📊 Vérifier le déploiement

### Dans Portainer

1. **Stacks** → Cliquez sur votre stack `sonphonor`
2. Vérifiez que tous les services sont **running** (vert)
3. Si un service est en erreur, cliquez dessus pour voir les logs

### En ligne de commande

```bash
# Voir tous les conteneurs
docker ps

# Voir les logs
docker logs sonphonor-backend
docker logs sonphonor-frontend
docker logs sonphonor-db

# Vérifier la santé
docker-compose ps
```

### Tester l'API

```bash
# Test de santé
curl http://votre-serveur:4000/health

# Devrait retourner :
# {"status":"healthy","timestamp":"...","service":"sonphonor-api"}
```

---

## 🔧 Dépannage

### Le stack ne démarre pas

1. Vérifiez les logs dans Portainer
2. Vérifiez que les ports ne sont pas déjà utilisés
3. Vérifiez les variables d'environnement

### La base de données ne se connecte pas

```bash
# Vérifier PostgreSQL
docker exec -it sonphonor-db psql -U sonphonor_user -d sonphonor -c "SELECT version();"
```

### Le frontend ne se connecte pas au backend

Vérifiez que `REACT_APP_API_URL` dans le frontend pointe vers la bonne URL du backend.

### Réinitialiser complètement

```bash
docker-compose down -v  # ⚠️ Supprime toutes les données !
docker-compose up -d
# Puis réexécutez les migrations et le seed
```

---

## 📝 Commandes utiles dans Portainer

### Via la Console d'un conteneur

**Backend** :
```bash
# Voir les logs en temps réel
npm run dev

# Migrations
npm run prisma:migrate

# Reset DB
npm run prisma:migrate reset
```

**Frontend** :
```bash
# Rebuild
npm run build
```

**PostgreSQL** :
```bash
# Connexion à la DB
psql -U sonphonor_user -d sonphonor

# Backup
pg_dump -U sonphonor_user sonphonor > backup.sql
```

---

## 🎯 Checklist de déploiement

- [ ] Stack créé dans Portainer
- [ ] Variables d'environnement configurées
- [ ] Tous les conteneurs sont running
- [ ] Base de données initialisée (migrate + seed)
- [ ] Frontend accessible sur le port 3000
- [ ] API accessible sur le port 4000
- [ ] Connexion avec admin@sonphonor.com fonctionne
- [ ] Mot de passe admin changé
- [ ] Firewall configuré
- [ ] Adminer désactivé en production
- [ ] Sauvegardes automatiques configurées

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans Portainer
2. Vérifiez la configuration des variables d'environnement
3. Assurez-vous que tous les services sont en état "running"
4. Consultez les logs de chaque conteneur

**Logs à vérifier en priorité :**
- `sonphonor-backend` : Erreurs d'API ou de connexion DB
- `sonphonor-db` : Problèmes de base de données
- `sonphonor-frontend` : Problèmes de build ou de connexion API

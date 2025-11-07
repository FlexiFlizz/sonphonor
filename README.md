# 🎵 Sonphonor - Système de Gestion de Matériel de Sonorisation

## 📦 Déploiement sur Serveur OVH avec Portainer

### Prérequis
- Serveur OVH avec Ubuntu/Debian
- Portainer déjà installé
- Docker et Docker Compose installés
- Accès SSH au serveur

---

## 🚀 Installation Rapide

### 1. Connexion au serveur
```bash
ssh user@votre-serveur-ovh.com
cd /opt  # ou votre dossier préféré
```

### 2. Cloner/Créer le projet
```bash
sudo mkdir sonphonor
cd sonphonor
```

### 3. Télécharger tous les fichiers
Copiez tous les fichiers créés sur votre serveur via SCP ou FTP :
```bash
# Depuis votre machine locale
scp -r * user@votre-serveur-ovh.com:/opt/sonphonor/
```

### 4. Lancer le déploiement
```bash
sudo chmod +x deploy.sh
sudo ./deploy.sh
```
Choisir l'option 1 pour une installation complète.

---

## 📋 Configuration dans Portainer

### Option A : Import via Docker Compose (Recommandé)

1. **Connectez-vous à Portainer** : `http://votre-serveur:9000`

2. **Créer un nouveau Stack** :
   - Allez dans "Stacks" → "Add stack"
   - Nom : `sonphonor`
   - Method : "Upload" ou "Git Repository"

3. **Coller le contenu de docker-compose.yml**

4. **Ajouter les variables d'environnement** :
   ```
   DB_PASSWORD=VotreMotDePasseSecurise
   JWT_SECRET=VotreSecretJWT
   DOMAIN_NAME=sonphonor.votre-domaine.com
   ```

5. **Deploy the stack**

### Option B : Déploiement Manuel

Utilisez le script `deploy.sh` qui automatise tout le processus.

---

## 🔧 Configuration Post-Installation

### 1. Configuration du domaine
Modifiez le fichier `.env` :
```bash
DOMAIN_NAME=sonphonor.votre-domaine.com
FRONTEND_URL=https://sonphonor.votre-domaine.com
API_URL=https://api.sonphonor.votre-domaine.com
```

### 2. SSL avec Let's Encrypt (Optionnel)
```bash
docker-compose exec nginx certbot --nginx -d sonphonor.votre-domaine.com
```

### 3. Premier accès
- **URL** : http://votre-serveur:3000
- **Email** : admin@sonphonor.com
- **Mot de passe** : admin123

⚠️ **IMPORTANT** : Changez immédiatement le mot de passe admin !

---

## 📊 Architecture

```
sonphonor/
├── docker-compose.yml       # Configuration des conteneurs
├── .env                     # Variables d'environnement
├── deploy.sh               # Script de déploiement
├── backend/                # API Node.js
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/            # ORM et schéma BDD
│   └── src/               # Code source
├── frontend/              # Application React
│   ├── Dockerfile
│   ├── package.json
│   └── src/               # Code source
└── nginx/                 # Configuration reverse proxy
    └── conf.d/
```

---

## 🛠️ Commandes Utiles

### Gestion des services
```bash
# Voir l'état des services
docker-compose ps

# Redémarrer un service
docker-compose restart backend

# Voir les logs
docker-compose logs -f backend

# Arrêter tous les services
docker-compose down

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Base de données
```bash
# Accéder à la base de données
docker-compose exec postgres psql -U sonphonor_user -d sonphonor

# Sauvegarder la BDD
docker-compose exec -T postgres pg_dump -U sonphonor_user sonphonor > backup.sql

# Restaurer une sauvegarde
docker-compose exec -T postgres psql -U sonphonor_user sonphonor < backup.sql

# Appliquer les migrations
docker-compose exec backend npx prisma migrate deploy
```

### Mise à jour
```bash
# Mettre à jour le code
git pull  # si vous utilisez Git

# Reconstruire les images
docker-compose build

# Redémarrer avec les nouvelles images
docker-compose up -d

# Appliquer les migrations de BDD
docker-compose exec backend npx prisma migrate deploy
```

---

## 🔒 Sécurité

### Checklist de sécurisation
- [ ] Changer le mot de passe admin par défaut
- [ ] Modifier les secrets dans `.env`
- [ ] Configurer le firewall (UFW)
- [ ] Activer SSL/HTTPS
- [ ] Configurer les backups automatiques
- [ ] Limiter l'accès SSH
- [ ] Mettre à jour régulièrement

### Configuration firewall UFW
```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 9000/tcp   # Portainer (limiter à votre IP)
sudo ufw enable
```

---

## 📝 Maintenance

### Sauvegarde automatique
Créez un cron job pour les sauvegardes :
```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour une sauvegarde quotidienne à 2h du matin
0 2 * * * cd /opt/sonphonor && ./deploy.sh backup
```

### Monitoring
- **Portainer** : Interface web pour gérer les conteneurs
- **Adminer** : http://votre-serveur:8080 pour la BDD
- **Logs** : Consultables via Portainer ou `docker-compose logs`

---

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend
```bash
# Vérifier les variables d'environnement
docker-compose exec frontend env | grep API

# Vérifier la connectivité
docker-compose exec frontend ping backend
```

### Erreur de base de données
```bash
# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed
```

### Problème de permissions
```bash
# Corriger les permissions
sudo chown -R $USER:$USER .
chmod +x deploy.sh
```

---

## 📞 Support

### Logs importants à vérifier
1. **Backend** : `docker-compose logs backend`
2. **Base de données** : `docker-compose logs postgres`
3. **Frontend** : `docker-compose logs frontend`
4. **Nginx** : `docker-compose logs nginx`

### Variables d'environnement essentielles
- `DB_PASSWORD` : Mot de passe PostgreSQL
- `JWT_SECRET` : Secret pour les tokens JWT
- `DOMAIN_NAME` : Votre nom de domaine
- `FRONTEND_URL` : URL complète du frontend
- `API_URL` : URL complète de l'API

---

## 🎯 Prochaines Étapes

1. **Tester l'application** avec les identifiants par défaut
2. **Créer vos utilisateurs** et supprimer ceux de test
3. **Importer votre matériel** dans l'inventaire
4. **Configurer les catégories** selon vos besoins
5. **Former les utilisateurs** à l'utilisation

---

## 📄 License

MIT License - Libre d'utilisation et de modification

---

**Besoin d'aide ?** N'hésitez pas à ouvrir une issue ou me contacter !

# 🚀 Guide de déploiement Sonphonor via GitHub

## 📋 Étapes pour créer votre repository GitHub et déployer avec Portainer

### 1️⃣ Créer votre repository GitHub

1. **Allez sur GitHub.com** et connectez-vous
2. **Créez un nouveau repository** :
   - Cliquez sur le bouton vert "New" ou "+"
   - Nom : `sonphonor`
   - Description : "Système de gestion de matériel de sonorisation"
   - **IMPORTANT** : Mettez le en **Privé** (Private) pour protéger vos données
   - Ne pas initialiser avec README (on va le fournir)

### 2️⃣ Préparer les fichiers sur votre machine locale

```bash
# Créer un dossier local
mkdir sonphonor
cd sonphonor

# Initialiser Git
git init

# Télécharger tous les fichiers depuis Claude
# (copier tous les fichiers fournis dans ce dossier)

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE-USERNAME/sonphonor.git

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Sonphonor setup"

# Pousser vers GitHub
git push -u origin main
```

### 3️⃣ Créer un Personal Access Token GitHub

Pour que Portainer puisse accéder à votre repo privé :

1. Sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Cliquez "Generate new token (classic)"
3. Nom : `portainer-sonphonor`
4. Permissions à cocher :
   - ✅ `repo` (toutes les sous-options)
5. Générez et **copiez le token** (vous ne le reverrez plus !)

### 4️⃣ Configuration dans Portainer

1. **Connectez-vous à Portainer** sur votre serveur OVH

2. **Ajoutez votre token GitHub** :
   - Allez dans "Settings" → "Registries"
   - "Add registry" → Type: "GitHub"
   - Name: `github-sonphonor`
   - Username: `votre-username-github`
   - Personal Access Token: `collez-votre-token`

3. **Créez le Stack** :
   - Allez dans "Stacks" → "Add stack"
   - Name: `sonphonor`
   - Build method: **"Repository"**
   - Repository URL: `https://github.com/VOTRE-USERNAME/sonphonor`
   - Repository reference: `main`
   - Compose path: `docker-compose.yml`
   - Authentication: ✅ (sélectionnez votre registry GitHub)

4. **Variables d'environnement** (dans Portainer, section "Environment variables") :
   ```
   DB_PASSWORD=GenerezUnMotDePasseSecurise123!
   JWT_SECRET=GenerezUneLongueChaine64Caracteres!
   DOMAIN_NAME=sonphonor.votre-domaine.com
   FRONTEND_URL=http://votre-serveur-ovh:3000
   API_URL=http://votre-serveur-ovh:4000
   NODE_ENV=production
   ```

5. **Actions avancées** (optionnel) :
   - ✅ Enable auto-update (via webhook)
   - ✅ Pull latest image

6. **Deploy the stack** !

### 5️⃣ Structure des fichiers à avoir dans GitHub

```
sonphonor/
├── docker-compose.yml          # ✅ Obligatoire
├── .env.example                # ✅ Template des variables
├── .gitignore                  # ✅ Exclure fichiers sensibles
├── README.md                   # ✅ Documentation
├── deploy.sh                   # Script d'aide
├── backend/
│   ├── Dockerfile             # ✅ Obligatoire
│   ├── package.json           # ✅ Obligatoire
│   ├── prisma/
│   │   ├── schema.prisma      # ✅ Schéma BDD
│   │   └── seed.js            # ✅ Données initiales
│   └── src/
│       └── index.js           # ✅ Point d'entrée API
├── frontend/
│   ├── Dockerfile             # ✅ Obligatoire
│   ├── package.json           # ✅ Obligatoire
│   └── src/
│       ├── App.tsx            # Vos composants React
│       └── components/        # Vos composants
└── nginx/
    └── conf.d/
        └── default.conf       # ✅ Config reverse proxy
```

### 6️⃣ Webhook pour déploiement automatique (optionnel)

Pour que Portainer redéploie automatiquement quand vous pushez sur GitHub :

1. **Dans Portainer**, copiez l'URL du webhook de votre stack
2. **Sur GitHub** :
   - Repository → Settings → Webhooks → Add webhook
   - Payload URL : `URL-webhook-portainer`
   - Content type : `application/json`
   - Events : "Just the push event"

### 7️⃣ Commandes Git utiles pour les mises à jour

```bash
# Faire des modifications
git add .
git commit -m "Description des changements"
git push

# Si webhook configuré : Portainer redéploiera automatiquement
# Sinon : Cliquez sur "Update the stack" dans Portainer
```

## 🔧 Dépannage

### Problème : Portainer ne peut pas cloner le repo
- Vérifiez que le token GitHub a les bonnes permissions
- Vérifiez que l'URL du repo est correcte
- Le repo doit être accessible (privé mais avec token)

### Problème : Les services ne démarrent pas
- Vérifiez les logs dans Portainer (cliquez sur le conteneur → Logs)
- Vérifiez que les variables d'environnement sont bien définies
- Vérifiez les ports (3000, 4000, 5432 doivent être libres)

### Problème : Erreur de build
- Le Dockerfile doit être dans le bon dossier
- Vérifiez que package.json est présent
- Les chemins dans docker-compose.yml doivent être corrects

## 📝 Variables d'environnement importantes

| Variable | Description | Exemple |
|----------|-------------|---------|
| DB_PASSWORD | Mot de passe PostgreSQL | `SuperSecure123!` |
| JWT_SECRET | Secret pour les tokens | `64caracteresAleatoires...` |
| DOMAIN_NAME | Votre domaine | `sonphonor.example.com` |
| FRONTEND_URL | URL du frontend | `http://51.xx.xx.xx:3000` |
| API_URL | URL de l'API | `http://51.xx.xx.xx:4000` |

## 🎯 Après le déploiement

1. **Initialiser la base de données** :
```bash
# Via SSH sur votre serveur
docker exec sonphonor-backend-1 npx prisma migrate deploy
docker exec sonphonor-backend-1 npm run prisma:seed
```

2. **Accéder à l'application** :
- Frontend : http://votre-ip:3000
- API : http://votre-ip:4000
- Adminer : http://votre-ip:8080

3. **Connexion par défaut** :
- Email : `admin@sonphonor.com`
- Password : `admin123`

⚠️ **CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT !**

## 💡 Tips Pro

1. **Branches Git** :
   - `main` : Production
   - `develop` : Développement
   - Portainer peut déployer différentes branches

2. **Secrets GitHub** :
   - Ne jamais commit `.env` avec des vraies valeurs
   - Utilisez GitHub Secrets pour CI/CD

3. **Monitoring** :
   - Activez les alertes Portainer
   - Configurez les health checks

## 📞 Besoin d'aide ?

- Vérifiez d'abord les logs dans Portainer
- La structure des fichiers est-elle correcte ?
- Les variables d'environnement sont-elles définies ?
- Les ports sont-ils disponibles ?

---

✅ **Une fois que tout fonctionne**, vous pourrez facilement faire des mises à jour en pushant sur GitHub !

# 📝 Notes de Build et Optimisations

## ⚠️ Package Lock Files

Les Dockerfiles utilisent actuellement `npm install` au lieu de `npm ci` car les fichiers `package-lock.json` ne sont pas présents dans le repository.

### Pour optimiser les builds (Recommandé pour production) :

1. **Générer les package-lock.json** :
   ```bash
   # Backend
   cd backend
   npm install
   git add package-lock.json

   # Frontend
   cd ../frontend
   npm install
   git add package-lock.json

   # Commit
   git commit -m "Add package-lock.json for deterministic builds"
   ```

2. **Modifier les Dockerfiles** pour utiliser `npm ci` :

   **backend/Dockerfile** (ligne 21) :
   ```dockerfile
   RUN npm ci --only=production
   ```

   **frontend/Dockerfile** (ligne 21) :
   ```dockerfile
   RUN npm ci --prefer-offline --no-audit
   ```

### Avantages de npm ci vs npm install :

| Aspect | npm install | npm ci |
|--------|-------------|--------|
| **Vitesse** | Plus lent | Plus rapide (jusqu'à 2x) |
| **Déterminisme** | Peut varier | Totalement déterministe |
| **Production** | Non recommandé | Recommandé |
| **Nécessite lock file** | Non | Oui (obligatoire) |
| **Modifie package-lock** | Oui | Non |

---

## 🔧 Optimisations Docker Supplémentaires

### 1. Utiliser un Registry Privé

Pour éviter de rebuilder à chaque déploiement Portainer :

```bash
# Builder et pousser les images
docker build -t registry.votredomaine.com/sonphonor-backend:latest ./backend
docker build -t registry.votredomaine.com/sonphonor-frontend:latest ./frontend

docker push registry.votredomaine.com/sonphonor-backend:latest
docker push registry.votredomaine.com/sonphonor-frontend:latest
```

Puis dans le `.env` de Portainer :
```env
BACKEND_IMAGE=registry.votredomaine.com/sonphonor-backend:latest
FRONTEND_IMAGE=registry.votredomaine.com/sonphonor-frontend:latest
```

### 2. Cache de Build Multi-Stage

Les Dockerfiles utilisent déjà le multi-stage build pour optimiser :
- **Étape 1 (builder)** : Installation et compilation
- **Étape 2 (production)** : Image finale légère

### 3. .dockerignore

Le fichier `.dockerignore` est configuré pour exclure :
- node_modules (réinstallés dans le conteneur)
- Fichiers de développement
- Documentation
- Tests

---

## 📊 Comparaison des Tailles d'Images

Avec les optimisations actuelles :

| Service | Sans optimisation | Avec multi-stage | Gain |
|---------|------------------|------------------|------|
| Backend | ~450 MB | ~180 MB | 60% |
| Frontend | ~380 MB | ~25 MB | 93% |

---

## 🚀 GitHub Actions CI/CD (Optionnel)

Pour automatiser le build et le push des images :

```yaml
# .github/workflows/docker-build.yml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Backend
        run: docker build -t sonphonor-backend:latest ./backend

      - name: Build Frontend
        run: docker build -t sonphonor-frontend:latest ./frontend

      # Push vers votre registry...
```

---

## ⚡ Déploiement Rapide Sans Build

Si vous avez des images pre-buildées, modifiez le `docker-compose.yml` :

```yaml
backend:
  image: sonphonor-backend:latest
  # Supprimer la section build:
  restart: unless-stopped
  ...
```

Cela évite le build à chaque déploiement Portainer.

---

## 📝 Checklist d'Optimisation Production

- [ ] Ajouter package-lock.json au repository
- [ ] Utiliser npm ci dans les Dockerfiles
- [ ] Configurer un registry Docker privé
- [ ] Mettre en place CI/CD pour builds automatiques
- [ ] Activer le cache Docker dans Portainer
- [ ] Monitorer la taille des images
- [ ] Planifier les mises à jour de dépendances

---

**Pour toute question sur les optimisations, consultez la documentation Docker ou ouvrez une issue.**

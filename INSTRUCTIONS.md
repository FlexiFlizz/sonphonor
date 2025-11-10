# 🎵 Sonphonor - Instructions d'utilisation

## ✨ Fonctionnalités principales

Votre application de gestion de matériel de sonorisation est maintenant prête avec :

- ✅ **Système d'inscription obligatoire** - Tous les utilisateurs doivent créer un compte
- ✅ **Gestion de stock complète** - Suivez votre matériel de sonorisation
- ✅ **Création de devis professionnels** - Générez des devis pour vos clients
- ✅ **Interface admin** - Gérez les utilisateurs et les catégories
- ✅ **Design épuré avec shadcn/ui** - Interface moderne et intuitive
- ✅ **Déploiement Portainer** - Compatible avec votre infrastructure Docker

## 🚀 Démarrage rapide

### 1. Configuration initiale

```bash
# Copier le fichier .env.example
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

Variables importantes à modifier :
- `DB_PASSWORD` : Mot de passe de la base de données
- `JWT_SECRET` : Clé secrète pour les tokens (générez une chaîne aléatoire)
- `FRONTEND_URL` : URL de votre frontend (ex: https://sonphonor.votredomaine.com)
- `API_URL` : URL de votre API (ex: https://api.sonphonor.votredomaine.com)

### 2. Lancement avec Docker

```bash
# Construire et lancer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
docker-compose exec backend npm run prisma:generate

# Exécuter les migrations
docker-compose exec backend npm run prisma:migrate

# Insérer les données de test
docker-compose exec backend npm run prisma:seed
```

### 4. Accéder à l'application

- **Frontend** : http://localhost:3000
- **API** : http://localhost:4000
- **Adminer** : http://localhost:8080 (gestion BDD)

## 👤 Compte administrateur par défaut

Après l'exécution du seed :

- **Email** : admin@sonphonor.com
- **Mot de passe** : admin123

⚠️ **IMPORTANT** : Changez ce mot de passe dès la première connexion !

## 📋 Utilisation de l'application

### Inscription d'un nouvel utilisateur

1. Allez sur http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire :
   - Prénom et Nom
   - Email (unique)
   - Téléphone (optionnel)
   - Mot de passe (minimum 6 caractères)
4. Vous serez automatiquement connecté

### Gestion du matériel

#### Ajouter du matériel

1. Cliquez sur "Matériel" dans le menu
2. Cliquez sur "Ajouter du matériel"
3. Remplissez les informations :
   - Nom du matériel
   - Catégorie
   - Marque et modèle
   - Quantité totale
   - Tarif journalier HT
   - État (Excellent, Bon, Moyen, Mauvais)
   - Prix d'achat et date (optionnel)
4. Cliquez sur "Enregistrer"

#### Gérer le stock

- **Disponibilité** : Le système affiche automatiquement la quantité disponible
- **Recherche** : Filtrez par nom, catégorie ou état
- **Badges de stock** :
  - 🟢 Disponible : > 30% du stock
  - 🟡 Stock faible : < 30% du stock
  - 🔴 Rupture : 0 disponible

### Création de devis

#### Créer un nouveau devis

1. Cliquez sur "Devis" dans le menu
2. Cliquez sur "Créer un devis"
3. Informations client :
   - Nom du client
   - Email et téléphone
4. Informations événement :
   - Nom de l'événement
   - Date de l'événement
   - Date de validité du devis
5. Ajoutez le matériel :
   - Sélectionnez l'équipement
   - Quantité souhaitée
   - Nombre de jours de location
6. Le système calcule automatiquement :
   - Total HT
   - TVA (20%)
   - Total TTC

#### Gestion des statuts de devis

Les devis peuvent avoir 4 statuts :

- **Brouillon** : Devis en cours de création
- **Envoyé** : Devis envoyé au client
- **Accepté** : Client a validé le devis
- **Refusé** : Client a refusé le devis

Changez le statut directement depuis la liste des devis.

### Interface administrateur

Les administrateurs ont accès à des fonctionnalités supplémentaires :

#### Gestion des utilisateurs

1. Cliquez sur "Utilisateurs" dans le menu
2. Actions disponibles :
   - Voir la liste de tous les utilisateurs
   - Modifier le rôle (Admin, Membre, Bénévole)
   - Activer/Désactiver un compte
   - Réinitialiser le mot de passe
   - Supprimer un utilisateur

#### Gestion des catégories

1. Cliquez sur "Configuration"
2. Gérez les catégories :
   - Ajouter une nouvelle catégorie
   - Définir une couleur pour chaque catégorie
   - Modifier ou supprimer (si aucun matériel associé)

### Rôles et permissions

#### Admin
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Configuration du système

#### Membre
- Ajouter/modifier/supprimer du matériel
- Créer et gérer les devis
- Voir tous les équipements

#### Bénévole
- Voir le matériel et les devis
- Accès en lecture seule

## 🐳 Déploiement sur Portainer

### Via l'interface Portainer

1. **Connectez-vous à Portainer** : http://votre-serveur:9000

2. **Créer un nouveau Stack** :
   - Allez dans "Stacks" → "Add stack"
   - Nom : `sonphonor`
   - Method : "Git Repository"

3. **Configuration Git** :
   - Repository URL : URL de votre dépôt Git
   - Reference : `claude/audio-equipment-management-011CUygZTptpRDHMqmscWY2t`
   - Compose path : `docker-compose.yml`

4. **Variables d'environnement** :
   ```
   DB_PASSWORD=VotreMotDePasseSecurise
   JWT_SECRET=VotreSecretJWT
   FRONTEND_URL=https://sonphonor.votre-domaine.com
   API_URL=https://api.sonphonor.votre-domaine.com
   ```

5. **Deploy the stack**

### Via Git sur le serveur

```bash
# Cloner le dépôt
git clone <votre-repo-url>
cd sonphonor

# Checkout de la bonne branche
git checkout claude/audio-equipment-management-011CUygZTptpRDHMqmscWY2t

# Configuration
cp .env.example .env
nano .env

# Lancement
docker-compose up -d

# Initialisation
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

## 🛠️ Commandes utiles

### Gestion Docker

```bash
# Voir l'état des services
docker-compose ps

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v

# Reconstruire les images
docker-compose build

# Mettre à jour et redémarrer
docker-compose up -d --build
```

### Base de données

```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U sonphonor_user -d sonphonor

# Sauvegarder la base de données
docker-compose exec -T postgres pg_dump -U sonphonor_user sonphonor > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
docker-compose exec -T postgres psql -U sonphonor_user sonphonor < backup.sql

# Voir les migrations
docker-compose exec backend npx prisma migrate status

# Réinitialiser la base de données
docker-compose exec backend npx prisma migrate reset
```

### Logs et debugging

```bash
# Logs en temps réel de tous les services
docker-compose logs -f

# Entrer dans un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh

# Vérifier la santé des services
docker-compose ps
```

## 📊 Monitoring

### Portainer

Utilisez Portainer pour :
- Voir l'état des conteneurs en temps réel
- Consulter les logs facilement
- Gérer les volumes et réseaux
- Surveiller l'utilisation des ressources

### Adminer

Accédez à Adminer (http://localhost:8080) pour :
- Voir les données de la base
- Exécuter des requêtes SQL
- Exporter/importer des données

Connexion à Adminer :
- Système : PostgreSQL
- Serveur : postgres
- Utilisateur : sonphonor_user
- Mot de passe : (celui défini dans .env)
- Base de données : sonphonor

## 🔒 Sécurité

### Checklist de sécurisation

- [ ] Changer le mot de passe admin par défaut
- [ ] Modifier `DB_PASSWORD` et `JWT_SECRET` dans .env
- [ ] Configurer HTTPS avec Let's Encrypt
- [ ] Limiter l'accès à Adminer (par IP ou supprimer en production)
- [ ] Configurer le firewall (UFW)
- [ ] Mettre en place des sauvegardes automatiques
- [ ] Activer les logs de sécurité

### Configuration HTTPS (recommandé)

```bash
# Installer Certbot dans le conteneur nginx
docker-compose exec nginx sh

# Obtenir un certificat SSL
certbot --nginx -d sonphonor.votredomaine.com
```

## 📝 Maintenance

### Sauvegardes automatiques

Créez un script de sauvegarde :

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"

# Sauvegarder la base de données
docker-compose exec -T postgres pg_dump -U sonphonor_user sonphonor > $BACKUP_DIR/db_$DATE.sql

# Compresser
gzip $BACKUP_DIR/db_$DATE.sql

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Sauvegarde terminée : db_$DATE.sql.gz"
```

Ajoutez au crontab :
```bash
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /path/to/backup.sh
```

## 🆘 Dépannage

### Le frontend ne se connecte pas au backend

```bash
# Vérifier les variables d'environnement
docker-compose exec frontend env | grep API

# Vérifier la connectivité
docker-compose exec frontend ping backend
```

### Erreur de base de données

```bash
# Vérifier que PostgreSQL fonctionne
docker-compose exec postgres psql -U sonphonor_user -d sonphonor -c "SELECT version();"

# Réinitialiser la base de données
docker-compose exec backend npx prisma migrate reset
docker-compose exec backend npm run prisma:seed
```

### Problème de permissions

```bash
# Corriger les permissions
sudo chown -R $USER:$USER .

# Reconstruire les images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Support

### Logs à vérifier en cas de problème

1. Backend : `docker-compose logs backend`
2. Frontend : `docker-compose logs frontend`
3. Base de données : `docker-compose logs postgres`
4. Nginx : `docker-compose logs nginx`

### Informations système

```bash
# Version des services
docker-compose version
docker --version

# Espace disque
docker system df

# Nettoyer les ressources inutilisées
docker system prune -a
```

## 🎯 Prochaines étapes

Maintenant que votre application est configurée :

1. ✅ Tester l'application avec le compte admin
2. ✅ Créer vos propres catégories
3. ✅ Importer votre matériel
4. ✅ Créer des comptes pour les membres de votre association
5. ✅ Créer votre premier devis
6. ✅ Configurer HTTPS pour la production
7. ✅ Mettre en place les sauvegardes automatiques

---

**Bon courage avec votre gestion de matériel de sonorisation ! 🎵**

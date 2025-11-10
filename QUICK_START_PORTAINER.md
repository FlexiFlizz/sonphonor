# ⚡ Quick Start - Déploiement Portainer en 5 minutes

## 🎯 Déploiement Express

### Étape 1 : Accéder à Portainer
```
https://votre-serveur:9443
```

### Étape 2 : Créer la Stack
1. **Stacks** → **+ Add stack**
2. **Nom** : `sonphonor`
3. **Method** : Choisir **"Web editor"**

### Étape 3 : Copier-Coller la Configuration

Copiez le contenu du fichier `docker-compose.yml` du repository dans l'éditeur web.

### Étape 4 : Variables d'Environnement

Ajoutez ces variables d'environnement (section en bas de page) :

```env
POSTGRES_PASSWORD=VotreMotDePasseSecurisé123!
JWT_SECRET=VotreSecretJWTTresLongEtComplexe!
CORS_ORIGIN=*
HTTP_PORT=80
HTTPS_PORT=443
```

**Variables optionnelles** (pour domaine personnalisé) :
```env
FRONTEND_DOMAIN=sonphonor.votredomaine.com
API_DOMAIN=api.sonphonor.votredomaine.com
```

### Étape 5 : Déployer

Cliquez sur **"Deploy the stack"** et attendez quelques minutes.

---

## ✅ Vérification

### 1. Statut des conteneurs
Dans **Containers**, vérifiez que ces 5 services sont **"Running"** :
- ✅ `postgres` (base de données)
- ✅ `redis` (cache)
- ✅ `backend` (API)
- ✅ `frontend` (interface)
- ✅ `nginx` (proxy)

### 2. Initialiser la base de données

**Via Portainer Console** :
1. **Containers** → Cliquez sur `sonphonor-backend-X`
2. **Console** → Cliquez **"Connect"**
3. Exécutez :
   ```bash
   npx prisma migrate deploy
   ```

### 3. Accéder à l'application

Ouvrez votre navigateur :
```
http://votre-serveur
```

---

## 🎉 C'est tout !

Votre application Sonphonor est maintenant opérationnelle.

**Premiers pas** :
- Créez votre compte administrateur
- Configurez votre inventaire
- Commencez à gérer votre matériel

---

## 📚 Documentation complète

Pour une configuration avancée (SSL, monitoring, backups, etc.) :
➡️ [Guide complet de déploiement Portainer](./PORTAINER_DEPLOYMENT.md)

---

## 🆘 Problèmes ?

### Les conteneurs ne démarrent pas
➡️ Vérifiez les logs dans Portainer : **Containers** → Sélectionner le conteneur → **Logs**

### "Port already in use"
➡️ Changez les ports dans les variables d'environnement :
```env
HTTP_PORT=8080
HTTPS_PORT=8443
```

### "Cannot connect to database"
➡️ Vérifiez que le conteneur `postgres` est bien démarré et en bonne santé

---

**Besoin d'aide ?** Consultez le [guide complet](./PORTAINER_DEPLOYMENT.md) ou ouvrez une issue sur GitHub.

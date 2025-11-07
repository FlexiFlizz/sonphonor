#!/bin/bash

# Script de déploiement Sonphonor
# Ce script automatise le déploiement de l'application sur votre serveur OVH

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de Sonphonor"
echo "=========================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification de Docker et Docker Compose
check_docker() {
    echo -e "${YELLOW}Vérification de Docker...${NC}"
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker n'est pas installé. Installation...${NC}"
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    else
        echo -e "${GREEN}✓ Docker est installé${NC}"
    fi

    echo -e "${YELLOW}Vérification de Docker Compose...${NC}"
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose n'est pas installé. Installation...${NC}"
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        echo -e "${GREEN}✓ Docker Compose est installé${NC}"
    fi
}

# Configuration initiale
setup_environment() {
    echo -e "${YELLOW}Configuration de l'environnement...${NC}"
    
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Création du fichier .env...${NC}"
        cp .env.example .env
        
        # Génération de mots de passe sécurisés
        DB_PASSWORD=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -base64 48)
        
        # Mise à jour du fichier .env
        sed -i "s/ChangeMe123!/$DB_PASSWORD/g" .env
        sed -i "s/ChangeThisToAVeryLongRandomString123!/$JWT_SECRET/g" .env
        
        echo -e "${GREEN}✓ Fichier .env créé avec des mots de passe sécurisés${NC}"
        echo -e "${YELLOW}⚠️  Pensez à modifier les autres variables dans .env${NC}"
    else
        echo -e "${GREEN}✓ Fichier .env existe déjà${NC}"
    fi
}

# Création de la structure des dossiers
create_directories() {
    echo -e "${YELLOW}Création des dossiers...${NC}"
    
    # Backend
    mkdir -p backend/src/{controllers,routes,middleware,services,utils}
    mkdir -p backend/prisma
    mkdir -p backend/uploads
    
    # Frontend
    mkdir -p frontend/src/{components,pages,services,utils,hooks}
    mkdir -p frontend/public
    
    # Nginx
    mkdir -p nginx/{conf.d,ssl}
    
    # Logs
    mkdir -p logs/{nginx,backend}
    
    echo -e "${GREEN}✓ Structure des dossiers créée${NC}"
}

# Transfert des fichiers React existants
transfer_react_files() {
    echo -e "${YELLOW}Transfert des fichiers React...${NC}"
    
    # Création du dossier components si nécessaire
    mkdir -p frontend/src/components
    
    # Les fichiers ont été uploadés, on va les copier
    if [ -d "/mnt/user-data/uploads" ]; then
        cp /mnt/user-data/uploads/*.tsx frontend/src/components/ 2>/dev/null || true
        cp /mnt/user-data/uploads/*.css frontend/src/ 2>/dev/null || true
        cp /mnt/user-data/uploads/*.md frontend/ 2>/dev/null || true
        echo -e "${GREEN}✓ Fichiers React transférés${NC}"
    else
        echo -e "${YELLOW}⚠️  Dossier uploads non trouvé, transfert manuel nécessaire${NC}"
    fi
}

# Initialisation de la base de données
init_database() {
    echo -e "${YELLOW}Initialisation de la base de données...${NC}"
    
    # Attendre que PostgreSQL soit prêt
    echo "Attente du démarrage de PostgreSQL..."
    sleep 10
    
    # Exécuter les migrations Prisma
    docker-compose exec backend npx prisma migrate deploy
    
    # Exécuter le seed
    docker-compose exec backend npm run prisma:seed
    
    echo -e "${GREEN}✓ Base de données initialisée${NC}"
}

# Démarrage des services
start_services() {
    echo -e "${YELLOW}Démarrage des services...${NC}"
    
    # Arrêter les conteneurs existants
    docker-compose down 2>/dev/null || true
    
    # Construire et démarrer les services
    docker-compose up -d --build
    
    echo -e "${GREEN}✓ Services démarrés${NC}"
}

# Menu principal
main_menu() {
    echo ""
    echo "Que voulez-vous faire ?"
    echo "1) Installation complète (première fois)"
    echo "2) Mise à jour de l'application"
    echo "3) Redémarrer les services"
    echo "4) Voir les logs"
    echo "5) Arrêter les services"
    echo "6) Sauvegarder la base de données"
    echo "7) Restaurer la base de données"
    echo "8) Quitter"
    
    read -p "Choix: " choice
    
    case $choice in
        1)
            check_docker
            setup_environment
            create_directories
            transfer_react_files
            start_services
            sleep 15  # Attendre que les services démarrent
            init_database
            echo -e "${GREEN}✅ Installation terminée !${NC}"
            echo ""
            echo "Accès à l'application:"
            echo "- Frontend: http://localhost:3000"
            echo "- Backend API: http://localhost:4000"
            echo "- Adminer (DB): http://localhost:8080"
            echo ""
            echo "Identifiants par défaut:"
            echo "- Email: admin@sonphonor.com"
            echo "- Mot de passe: admin123"
            ;;
        2)
            docker-compose pull
            docker-compose up -d --build
            docker-compose exec backend npx prisma migrate deploy
            echo -e "${GREEN}✅ Mise à jour terminée${NC}"
            ;;
        3)
            docker-compose restart
            echo -e "${GREEN}✅ Services redémarrés${NC}"
            ;;
        4)
            echo "Logs de quel service ?"
            echo "1) Tous"
            echo "2) Frontend"
            echo "3) Backend"
            echo "4) PostgreSQL"
            echo "5) Nginx"
            read -p "Choix: " log_choice
            
            case $log_choice in
                1) docker-compose logs -f ;;
                2) docker-compose logs -f frontend ;;
                3) docker-compose logs -f backend ;;
                4) docker-compose logs -f postgres ;;
                5) docker-compose logs -f nginx ;;
            esac
            ;;
        5)
            docker-compose down
            echo -e "${GREEN}✅ Services arrêtés${NC}"
            ;;
        6)
            echo -e "${YELLOW}Sauvegarde de la base de données...${NC}"
            mkdir -p backups
            BACKUP_FILE="backups/sonphonor_$(date +%Y%m%d_%H%M%S).sql"
            docker-compose exec -T postgres pg_dump -U sonphonor_user sonphonor > $BACKUP_FILE
            echo -e "${GREEN}✅ Sauvegarde créée: $BACKUP_FILE${NC}"
            ;;
        7)
            echo "Fichiers de sauvegarde disponibles:"
            ls -la backups/*.sql 2>/dev/null || echo "Aucune sauvegarde trouvée"
            read -p "Entrez le nom du fichier à restaurer: " backup_file
            if [ -f "$backup_file" ]; then
                docker-compose exec -T postgres psql -U sonphonor_user sonphonor < $backup_file
                echo -e "${GREEN}✅ Base de données restaurée${NC}"
            else
                echo -e "${RED}Fichier non trouvé${NC}"
            fi
            ;;
        8)
            echo "Au revoir !"
            exit 0
            ;;
        *)
            echo -e "${RED}Option invalide${NC}"
            ;;
    esac
    
    # Retour au menu
    main_menu
}

# Vérification si on est root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Ce script doit être exécuté avec sudo${NC}"
    echo "Utilisation: sudo ./deploy.sh"
    exit 1
fi

# Démarrage
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║     🎵 SONPHONOR - Déploiement 🎵     ║"
echo "║   Gestion de matériel de sonorisation ║"
echo "╚═══════════════════════════════════════╝"
echo ""

main_menu

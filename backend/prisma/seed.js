const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Création des catégories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Microphones',
        description: 'Microphones filaires et sans fil',
        color: '#3b82f6'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Enceintes',
        description: 'Enceintes actives et passives',
        color: '#22c55e'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Tables de mixage',
        description: 'Consoles de mixage analogiques et numériques',
        color: '#8b5cf6'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Amplificateurs',
        description: 'Amplificateurs de puissance',
        color: '#f97316'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Câbles',
        description: 'Câbles audio et alimentation',
        color: '#64748b'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Accessoires',
        description: 'Pieds, supports et accessoires divers',
        color: '#ec4899'
      }
    })
  ]);

  console.log('✅ Catégories créées');

  // Création de l'utilisateur admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Sonphonor',
      email: 'admin@sonphonor.com',
      password: hashedPassword,
      phone: '06 00 00 00 00',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Utilisateur admin créé');

  // Création des utilisateurs de test
  const users = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        password: await bcrypt.hash('password123', 10),
        phone: '06 12 34 56 78',
        role: 'MEMBER',
        status: 'ACTIVE'
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@email.com',
        password: await bcrypt.hash('password123', 10),
        phone: '06 23 45 67 89',
        role: 'MEMBER',
        status: 'ACTIVE'
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'Pierre',
        lastName: 'Bernard',
        email: 'pierre.bernard@email.com',
        password: await bcrypt.hash('password123', 10),
        phone: '06 34 56 78 90',
        role: 'VOLUNTEER',
        status: 'ACTIVE'
      }
    })
  ]);

  console.log('✅ Utilisateurs de test créés');

  // Création du matériel
  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        name: 'Microphone sans fil Shure SM58',
        categoryId: categories[0].id,
        brand: 'Shure',
        model: 'SM58',
        quantity: 8,
        availableQuantity: 8,
        dailyRateHT: 15,
        description: 'Microphone dynamique professionnel',
        serialNumbers: ['SH001', 'SH002', 'SH003', 'SH004', 'SH005', 'SH006', 'SH007', 'SH008'],
        condition: 'EXCELLENT'
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Enceinte JBL EON615',
        categoryId: categories[1].id,
        brand: 'JBL',
        model: 'EON615',
        quantity: 4,
        availableQuantity: 4,
        dailyRateHT: 80,
        description: 'Enceinte amplifiée 15" 1000W',
        serialNumbers: ['JBL001', 'JBL002', 'JBL003', 'JBL004'],
        condition: 'GOOD'
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Console Yamaha MG16XU',
        categoryId: categories[2].id,
        brand: 'Yamaha',
        model: 'MG16XU',
        quantity: 2,
        availableQuantity: 2,
        dailyRateHT: 120,
        description: 'Console 16 canaux avec effets et interface USB',
        serialNumbers: ['YAM001', 'YAM002'],
        condition: 'EXCELLENT'
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Amplificateur Crown XTi2002',
        categoryId: categories[3].id,
        brand: 'Crown',
        model: 'XTi2002',
        quantity: 3,
        availableQuantity: 3,
        dailyRateHT: 60,
        description: 'Amplificateur 2x800W',
        serialNumbers: ['CRW001', 'CRW002', 'CRW003'],
        condition: 'GOOD'
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Câble XLR 5m',
        categoryId: categories[4].id,
        brand: 'Cordial',
        model: 'CFM5FP',
        quantity: 20,
        availableQuantity: 20,
        dailyRateHT: 3,
        description: 'Câble XLR mâle/femelle 5m',
        serialNumbers: [],
        condition: 'GOOD'
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Pied de micro',
        categoryId: categories[5].id,
        brand: 'K&M',
        model: '210/9',
        quantity: 10,
        availableQuantity: 10,
        dailyRateHT: 5,
        description: 'Pied de microphone avec perche télescopique',
        serialNumbers: [],
        condition: 'GOOD'
      }
    })
  ]);

  console.log('✅ Équipement créé');

  // Création de FlightCases
  const flightCases = await Promise.all([
    prisma.flightCase.create({
      data: {
        name: 'Flight Microphones',
        description: 'Flightcase contenant les micros sans fil',
        color: '#3b82f6',
        items: {
          create: [
            {
              equipmentId: equipment[0].id,
              quantity: 4
            }
          ]
        }
      }
    }),
    prisma.flightCase.create({
      data: {
        name: 'Flight Câbles',
        description: 'Ensemble des câbles XLR et alimentation',
        color: '#22c55e',
        items: {
          create: [
            {
              equipmentId: equipment[4].id,
              quantity: 10
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ FlightCases créés');

  // Création d'un devis exemple
  const quote = await prisma.quote.create({
    data: {
      clientName: 'Association des Fêtes',
      clientEmail: 'contact@fetes.com',
      clientPhone: '01 23 45 67 89',
      eventName: 'Concert de printemps',
      eventDate: new Date('2024-06-15'),
      validUntil: new Date('2024-05-15'),
      status: 'SENT',
      totalAmount: 240,
      taxAmount: 40,
      createdById: adminUser.id,
      items: {
        create: [
          {
            equipmentId: equipment[0].id,
            quantity: 4,
            days: 2,
            unitPrice: 15,
            totalPrice: 120
          },
          {
            equipmentId: equipment[4].id,
            quantity: 10,
            days: 2,
            unitPrice: 3,
            totalPrice: 60
          }
        ]
      }
    }
  });

  console.log('✅ Devis exemple créé');

  // Création d'un événement exemple
  const event = await prisma.event.create({
    data: {
      name: 'Concert école de musique',
      description: 'Concert annuel des élèves',
      startDate: new Date('2024-06-10T18:00:00'),
      endDate: new Date('2024-06-10T23:00:00'),
      location: 'Salle des fêtes',
      clientName: 'École de musique',
      clientEmail: 'ecole@musique.com',
      clientPhone: '01 23 45 67 89',
      status: 'PLANNED',
      createdById: adminUser.id,
      equipmentAssigned: {
        create: [
          {
            equipmentId: equipment[1].id,
            quantity: 2,
            assignedBy: adminUser.id
          },
          {
            equipmentId: equipment[2].id,
            quantity: 1,
            assignedBy: adminUser.id
          }
        ]
      },
      techniciansAssigned: {
        create: [
          {
            userId: users[0].id,
            role: 'Ingénieur son'
          },
          {
            userId: users[1].id,
            role: 'Assistant'
          }
        ]
      }
    }
  });

  console.log('✅ Événement exemple créé');

  console.log('🎉 Seeding terminé avec succès!');
  console.log('');
  console.log('📝 Informations de connexion:');
  console.log('Email: admin@sonphonor.com');
  console.log('Mot de passe: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

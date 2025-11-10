const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Lister tout le matériel
exports.getAllEquipment = async (req, res) => {
  try {
    const { categoryId, condition, search } = req.query;

    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (condition) {
      where.condition = condition;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ equipment });
  } catch (error) {
    console.error('Get all equipment error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du matériel' });
  }
};

// Récupérer un équipement par ID
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        damageReports: {
          include: {
            reportedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            reportedAt: 'desc'
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }

    res.json({ equipment });
  } catch (error) {
    console.error('Get equipment by id error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'équipement' });
  }
};

// Créer un équipement
exports.createEquipment = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      brand,
      model,
      quantity,
      dailyRateHT,
      description,
      serialNumbers,
      condition,
      purchaseDate,
      purchasePrice,
      imageUrl
    } = req.body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        categoryId,
        brand,
        model,
        quantity,
        availableQuantity: quantity, // Par défaut, tout est disponible
        dailyRateHT,
        description,
        serialNumbers: serialNumbers || [],
        condition: condition || 'GOOD',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice,
        imageUrl
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      message: 'Équipement créé avec succès',
      equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'équipement' });
  }
};

// Mettre à jour un équipement
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convertir la date si fournie
    if (updateData.purchaseDate) {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    res.json({
      message: 'Équipement mis à jour avec succès',
      equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'équipement' });
  }
};

// Supprimer un équipement
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.equipment.delete({
      where: { id }
    });

    res.json({ message: 'Équipement supprimé avec succès' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'équipement' });
  }
};

// Obtenir les statistiques de stock
exports.getStockStats = async (req, res) => {
  try {
    const totalEquipment = await prisma.equipment.count();

    const totalValue = await prisma.equipment.aggregate({
      _sum: {
        purchasePrice: true
      }
    });

    const lowStock = await prisma.equipment.count({
      where: {
        availableQuantity: {
          lt: 3
        }
      }
    });

    const outOfStock = await prisma.equipment.count({
      where: {
        availableQuantity: 0
      }
    });

    const byCondition = await prisma.equipment.groupBy({
      by: ['condition'],
      _count: true
    });

    res.json({
      totalEquipment,
      totalValue: totalValue._sum.purchasePrice || 0,
      lowStock,
      outOfStock,
      byCondition
    });
  } catch (error) {
    console.error('Get stock stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Signaler un dommage
exports.reportDamage = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { description, incidentDate, incidentLocation } = req.body;

    const damageReport = await prisma.damageReport.create({
      data: {
        equipmentId,
        reportedById: req.user.id,
        description,
        incidentDate: new Date(incidentDate),
        incidentLocation
      },
      include: {
        equipment: true,
        reportedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Dommage signalé avec succès',
      damageReport
    });
  } catch (error) {
    console.error('Report damage error:', error);
    res.status(500).json({ error: 'Erreur lors du signalement du dommage' });
  }
};

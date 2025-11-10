const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Lister tous les devis
exports.getAllQuotes = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientEmail: { contains: search, mode: 'insensitive' } },
        { eventName: { contains: search, mode: 'insensitive' } },
        { quoteNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        items: {
          include: {
            equipment: {
              include: {
                category: true
              }
            }
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ quotes });
  } catch (error) {
    console.error('Get all quotes error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des devis' });
  }
};

// Récupérer un devis par ID
exports.getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            equipment: {
              include: {
                category: true
              }
            }
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.json({ quote });
  } catch (error) {
    console.error('Get quote by id error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du devis' });
  }
};

// Créer un devis
exports.createQuote = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      eventDate,
      validUntil,
      items,
      notes
    } = req.body;

    // Calculer les montants
    let totalAmount = 0;
    const quoteItems = [];

    for (const item of items) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: item.equipmentId }
      });

      if (!equipment) {
        return res.status(404).json({ error: `Équipement ${item.equipmentId} non trouvé` });
      }

      const totalPrice = equipment.dailyRateHT * item.quantity * item.days;
      totalAmount += totalPrice;

      quoteItems.push({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
        days: item.days,
        unitPrice: equipment.dailyRateHT,
        totalPrice
      });
    }

    // TVA 20%
    const taxAmount = totalAmount * 0.20;

    // Créer le devis
    const quote = await prisma.quote.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        eventName,
        eventDate: new Date(eventDate),
        validUntil: new Date(validUntil),
        totalAmount,
        taxAmount,
        notes,
        createdById: req.user.id,
        items: {
          create: quoteItems
        }
      },
      include: {
        items: {
          include: {
            equipment: {
              include: {
                category: true
              }
            }
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Devis créé avec succès',
      quote
    });
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du devis' });
  }
};

// Mettre à jour un devis
exports.updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convertir les dates si fournies
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate);
    }
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil);
    }

    // Ne pas mettre à jour les items ici (utiliser une route séparée)
    delete updateData.items;

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            equipment: {
              include: {
                category: true
              }
            }
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Devis mis à jour avec succès',
      quote
    });
  } catch (error) {
    console.error('Update quote error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du devis' });
  }
};

// Changer le statut d'un devis
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quote = await prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            equipment: true
          }
        }
      }
    });

    res.json({
      message: 'Statut du devis mis à jour avec succès',
      quote
    });
  } catch (error) {
    console.error('Update quote status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Supprimer un devis
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.quote.delete({
      where: { id }
    });

    res.json({ message: 'Devis supprimé avec succès' });
  } catch (error) {
    console.error('Delete quote error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression du devis' });
  }
};

// Obtenir les statistiques des devis
exports.getQuoteStats = async (req, res) => {
  try {
    const totalQuotes = await prisma.quote.count();

    const byStatus = await prisma.quote.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        totalAmount: true
      }
    });

    const totalValue = await prisma.quote.aggregate({
      _sum: {
        totalAmount: true
      }
    });

    const acceptedValue = await prisma.quote.aggregate({
      where: {
        status: 'ACCEPTED'
      },
      _sum: {
        totalAmount: true
      }
    });

    res.json({
      totalQuotes,
      totalValue: totalValue._sum.totalAmount || 0,
      acceptedValue: acceptedValue._sum.totalAmount || 0,
      byStatus
    });
  } catch (error) {
    console.error('Get quote stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Lister toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { equipment: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

// Récupérer une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        equipment: true,
        _count: {
          select: { equipment: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie' });
  }
};

// Créer une catégorie
exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || '#64748b'
      }
    });

    res.status(201).json({
      message: 'Catégorie créée avec succès',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une catégorie avec ce nom existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color
      }
    });

    res.json({
      message: 'Catégorie mise à jour avec succès',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une catégorie avec ce nom existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie' });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie a des équipements
    const equipmentCount = await prisma.equipment.count({
      where: { categoryId: id }
    });

    if (equipmentCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer une catégorie contenant du matériel'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Delete category error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
  }
};

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI, categoryAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export default function Equipment() {
  const { user } = useAuthStore();
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  const canManage = user?.role === 'ADMIN' || user?.role === 'MEMBER';

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, [selectedCategory, selectedCondition, search]);

  const fetchEquipment = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (selectedCondition !== 'all') params.condition = selectedCondition;
      if (search) params.search = search;

      const response = await equipmentAPI.getAll(params);
      setEquipment(response.data.equipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      return;
    }

    try {
      await equipmentAPI.delete(id);
      fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getConditionBadge = (condition) => {
    const variants = {
      EXCELLENT: 'success',
      GOOD: 'default',
      FAIR: 'warning',
      POOR: 'destructive'
    };
    const labels = {
      EXCELLENT: 'Excellent',
      GOOD: 'Bon',
      FAIR: 'Moyen',
      POOR: 'Mauvais'
    };
    return <Badge variant={variants[condition]}>{labels[condition]}</Badge>;
  };

  const getStockBadge = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return <Badge variant="destructive">Rupture</Badge>;
    if (percentage < 30) return <Badge variant="warning">Stock faible</Badge>;
    return <Badge variant="success">Disponible</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matériel</h1>
          <p className="text-gray-600 mt-2">Gérez votre inventaire de sonorisation</p>
        </div>
        {canManage && (
          <Link to="/equipment/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter du matériel
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Bon</SelectItem>
                <SelectItem value="FAIR">Moyen</SelectItem>
                <SelectItem value="POOR">Mauvais</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">
                {equipment.length} article{equipment.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste du matériel</CardTitle>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun matériel trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Marque / Modèle</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Tarif/jour HT</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{ backgroundColor: item.category?.color + '20' }}
                      >
                        {item.category?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.brand} {item.model}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {item.availableQuantity} / {item.quantity}
                        </div>
                        {getStockBadge(item.availableQuantity, item.quantity)}
                      </div>
                    </TableCell>
                    <TableCell>{getConditionBadge(item.condition)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.dailyRateHT)}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/equipment/${item.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

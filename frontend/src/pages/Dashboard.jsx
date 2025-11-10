import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { equipmentAPI, quoteAPI, userAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../lib/utils';
import { Package, FileText, Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    equipment: null,
    quotes: null,
    users: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [equipmentRes, quotesRes] = await Promise.all([
        equipmentAPI.getStats(),
        quoteAPI.getStats()
      ]);

      let usersRes = null;
      if (user?.role === 'ADMIN') {
        usersRes = await userAPI.getStats();
      }

      setStats({
        equipment: equipmentRes.data,
        quotes: quotesRes.data,
        users: usersRes?.data || null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Matériel total',
      value: stats.equipment?.totalEquipment || 0,
      icon: Package,
      description: `Valeur: ${formatCurrency(stats.equipment?.totalValue || 0)}`,
      href: '/equipment',
      color: 'text-blue-600'
    },
    {
      title: 'Devis total',
      value: stats.quotes?.totalQuotes || 0,
      icon: FileText,
      description: `Total: ${formatCurrency(stats.quotes?.totalValue || 0)}`,
      href: '/quotes',
      color: 'text-green-600'
    },
    {
      title: 'Stock faible',
      value: stats.equipment?.lowStock || 0,
      icon: AlertTriangle,
      description: 'Articles nécessitant attention',
      href: '/equipment?filter=lowStock',
      color: 'text-orange-600'
    },
    {
      title: 'Devis acceptés',
      value: formatCurrency(stats.quotes?.acceptedValue || 0),
      icon: DollarSign,
      description: 'Chiffre d\'affaires validé',
      href: '/quotes?status=ACCEPTED',
      color: 'text-purple-600'
    }
  ];

  if (user?.role === 'ADMIN' && stats.users) {
    statCards.splice(2, 0, {
      title: 'Utilisateurs',
      value: stats.users.totalUsers || 0,
      icon: Users,
      description: `${stats.users.recentUsers || 0} ce mois`,
      href: '/users',
      color: 'text-indigo-600'
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.firstName} !
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/equipment/new">
              <Button className="w-full" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Ajouter du matériel
              </Button>
            </Link>
            <Link to="/quotes/new">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Créer un devis
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/users">
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les utilisateurs
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Could be expanded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>État du stock</CardTitle>
            <CardDescription>Aperçu de l'état de votre matériel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.equipment?.byCondition?.map((item) => (
                <div key={item.condition} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {item.condition === 'EXCELLENT' ? 'Excellent' :
                     item.condition === 'GOOD' ? 'Bon' :
                     item.condition === 'FAIR' ? 'Moyen' : 'Mauvais'}
                  </span>
                  <span className="text-sm text-gray-600">{item._count} articles</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devis par statut</CardTitle>
            <CardDescription>Répartition de vos devis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.quotes?.byStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.status === 'DRAFT' ? 'Brouillon' :
                     item.status === 'SENT' ? 'Envoyé' :
                     item.status === 'ACCEPTED' ? 'Accepté' : 'Refusé'}
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{item._count} devis</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(item._sum?.totalAmount || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

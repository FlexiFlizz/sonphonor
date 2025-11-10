import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Vérification...');
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    // Test de connexion à l'API
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus('Connecté ✓');
        setApiData(data);
      })
      .catch(err => {
        setApiStatus('Non connecté ✗');
        console.error('Erreur API:', err);
      });
  }, []);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎵 Sonphonor</h1>
          <p className="subtitle">Système de Gestion de Matériel de Sonorisation</p>
        </header>

        <div className="status-card">
          <h2>Statut de l'Application</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="label">Frontend</span>
              <span className="value success">Opérationnel ✓</span>
            </div>
            <div className="status-item">
              <span className="label">API Backend</span>
              <span className={`value ${apiStatus.includes('✓') ? 'success' : 'error'}`}>
                {apiStatus}
              </span>
            </div>
            {apiData && (
              <div className="status-item">
                <span className="label">Version API</span>
                <span className="value">{apiData.version || '1.0.0'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-card">
          <h3>🚀 Déploiement Réussi !</h3>
          <p>Votre application Sonphonor est maintenant opérationnelle.</p>
          <ul>
            <li>✓ Frontend React déployé</li>
            <li>✓ Configuration Nginx active</li>
            <li>✓ Proxy API configuré</li>
            <li>✓ Base de données PostgreSQL</li>
            <li>✓ Cache Redis</li>
          </ul>
        </div>

        <div className="next-steps">
          <h3>📋 Prochaines Étapes</h3>
          <ol>
            <li>Initialiser la base de données avec Prisma</li>
            <li>Configurer les comptes utilisateurs</li>
            <li>Personnaliser l'interface</li>
            <li>Importer votre matériel</li>
          </ol>
        </div>

        <footer className="footer">
          <p>Sonphonor v1.0.0 | Déployé avec Portainer</p>
          <p>
            <a href="/api/health" target="_blank" rel="noopener noreferrer">
              Tester l'API
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

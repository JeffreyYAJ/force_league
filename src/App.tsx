import { useState } from 'react';
import { Shield, Eye } from 'lucide-react';
import Ranking from './components/Ranking';
import RecentResults from './components/RecentResults';
import AdminCalendar from './components/AdminCalendar';
import AdminResults from './components/AdminResults';
import PlayerManagement from './components/PlayerManagement';

const ADMIN_PASSWORD = "monmotdepasse123";

function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAdminClick = () => {
    setView('admin');
    setIsAdminAuthenticated(false);
    setPassword('');
    setAuthError('');
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError("Mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Force's League
              </h1>
              <p className="text-gray-600 mt-1">
                Gestion et Classement
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setView('public')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  view === 'public'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                Public
              </button>
              <button
                onClick={handleAdminClick}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  view === 'admin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'public' ? (
          <div className="space-y-8">
            <Ranking />
            <RecentResults />
          </div>
        ) : !isAdminAuthenticated ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto mt-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès Admin</h2>
            <form onSubmit={handleAuth}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                required
              />
              {authError && (
                <div className="mb-2 text-red-600">{authError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Se connecter
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <PlayerManagement />
            <AdminCalendar />
            <AdminResults />
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Force's League</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2 } from 'lucide-react';
import { supabase, Player } from '../lib/supabase';

export default function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error loading players:', error);
    } else if (data) {
      setPlayers(data);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('players').insert({
      first_name: firstName,
      last_name: lastName,
    });

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage('Joueur ajouté avec succès!');
      setFirstName('');
      setLastName('');
      loadPlayers();
    }

    setLoading(false);
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur?')) {
      return;
    }

    const { error } = await supabase.from('players').delete().eq('id', id);

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage('Joueur supprimé avec succès!');
      loadPlayers();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Joueurs</h2>
      </div>

      <form onSubmit={handleAddPlayer} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes('succès')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          {loading ? 'Ajout...' : 'Ajouter un Joueur'}
        </button>
      </form>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Liste des Joueurs ({players.length})
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-800">
                {player.first_name} {player.last_name}
              </span>
              <button
                onClick={() => handleDeletePlayer(player.id)}
                className="text-red-600 hover:text-red-700 transition-colors p-2"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {players.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun joueur enregistré. Ajoutez votre premier joueur ci-dessus.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Calendar, Users, Plus } from 'lucide-react';
import { supabase, Player } from '../lib/supabase';

export default function AdminCalendar() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchDate, setMatchDate] = useState('');
  const [match1Player1, setMatch1Player1] = useState('');
  const [match1Player2, setMatch1Player2] = useState('');
  const [match2Player1, setMatch2Player1] = useState('');
  const [match2Player2, setMatch2Player2] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!matchDate || !match1Player1 || !match1Player2 || !match2Player1 || !match2Player2) {
      setMessage('Tous les champs sont requis');
      setLoading(false);
      return;
    }

    if (match1Player1 === match1Player2 || match2Player1 === match2Player2) {
      setMessage('Un joueur ne peut pas jouer contre lui-même');
      setLoading(false);
      return;
    }

    const matches = [
      {
        match_date: matchDate,
        player1_id: match1Player1,
        player2_id: match1Player2,
      },
      {
        match_date: matchDate,
        player1_id: match2Player1,
        player2_id: match2Player2,
      },
    ];

    const { error } = await supabase.from('matches').insert(matches);

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage('Matchs créés avec succès!');
      setMatchDate('');
      setMatch1Player1('');
      setMatch1Player2('');
      setMatch2Player1('');
      setMatch2Player2('');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Calendrier des Matchs</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date du Match
          </label>
          <input
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Match 1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joueur 1
              </label>
              <select
                value={match1Player1}
                onChange={(e) => setMatch1Player1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un joueur</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joueur 2
              </label>
              <select
                value={match1Player2}
                onChange={(e) => setMatch1Player2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un joueur</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Match 2
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joueur 1
              </label>
              <select
                value={match2Player1}
                onChange={(e) => setMatch2Player1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un joueur</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joueur 2
              </label>
              <select
                value={match2Player2}
                onChange={(e) => setMatch2Player2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un joueur</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
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
          <Plus className="w-5 h-5" />
          {loading ? 'Création...' : 'Créer les Matchs'}
        </button>
      </form>
    </div>
  );
}

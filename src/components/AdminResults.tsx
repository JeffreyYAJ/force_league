import { useState, useEffect } from 'react';
import { Trophy, Save } from 'lucide-react';
import { supabase, Match, Player } from '../lib/supabase';

interface MatchWithPlayers extends Match {
  player1?: Player;
  player2?: Player;
}

export default function AdminResults() {
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const handleResetDatabase = async () => {
    if (!confirm('Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.')) return;
    setLoading(true);
    setMessage('');
    // Suppression des matchs
    const { error: matchesError } = await supabase.from('matches').delete().neq('id', '');
    // Suppression des joueurs
    const { error: playersError } = await supabase.from('players').delete().neq('id', '');
    // Si tu as une table "results", décommente la ligne suivante :
    // const { error: resultsError } = await supabase.from('results').delete().neq('id', '');

    if (matchesError || playersError /* || resultsError */) {
      setMessage('Erreur lors de la réinitialisation.');
    } else {
      setMessage('Base de données réinitialisée avec succès !');
      loadMatches();
    }
    setLoading(false);
  };

  const loadMatches = async () => {
    const { data: matchesData, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading matches:', error);
      return;
    }

    if (!matchesData) return;

    const playerIds = new Set<string>();
    matchesData.forEach((match) => {
      playerIds.add(match.player1_id);
      playerIds.add(match.player2_id);
    });

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .in('id', Array.from(playerIds));

    const playersMap = new Map(playersData?.map((p) => [p.id, p]) || []);

    const matchesWithPlayers = matchesData.map((match) => ({
      ...match,
      player1: playersMap.get(match.player1_id),
      player2: playersMap.get(match.player2_id),
    }));

    setMatches(matchesWithPlayers);
  };

  const handleScoreChange = (
    matchId: string,
    field: string,
    value: string
  ) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId ? { ...match, [field]: value ? parseFloat(value) : null } : match
      )
    );
  };

  const handleSave = async (matchId: string) => {
    setLoading(true);
    setMessage('');

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const r1p1 = match.round1_player1_score;
    const r1p2 = match.round1_player2_score;
    const r2p1 = match.round2_player1_score;
    const r2p2 = match.round2_player2_score;

    if (r1p1 !== null && r1p2 !== null && r1p1 + r1p2 !== 1) {
      setMessage('Ronde 1: Les scores doivent totaliser 1');
      setLoading(false);
      return;
    }

    if (r2p1 !== null && r2p2 !== null && r2p1 + r2p2 !== 1) {
      setMessage('Ronde 2: Les scores doivent totaliser 1');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('matches')
      .update({
        round1_player1_score: r1p1,
        round1_player2_score: r1p2,
        round2_player1_score: r2p1,
        round2_player2_score: r2p2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage('Résultats enregistrés avec succès!');
      loadMatches();
    }

    setLoading(false);
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return '-';
    return score.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Saisie des Résultats</h2>
        {/* <button
        onClick={handleResetDatabase}
        disabled={loading}
        className="mb-6 mr-6 w-48 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reset League
      </button> */}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('succès')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        {matches.map((match) => (
          <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-800">
                {new Date(match.match_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">
                    {match.player1?.first_name} {match.player1?.last_name}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium text-gray-700">
                    {match.player2?.first_name} {match.player2?.last_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ronde 1
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={getScoreDisplay(match.round1_player1_score)}
                        onChange={(e) =>
                          handleScoreChange(match.id, 'round1_player1_score', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="0.5">0.5</option>
                        <option value="0">0</option>
                      </select>
                      <select
                        value={getScoreDisplay(match.round1_player2_score)}
                        onChange={(e) =>
                          handleScoreChange(match.id, 'round1_player2_score', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="0.5">0.5</option>
                        <option value="0">0</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ronde 2
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={getScoreDisplay(match.round2_player1_score)}
                        onChange={(e) =>
                          handleScoreChange(match.id, 'round2_player1_score', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="0.5">0.5</option>
                        <option value="0">0</option>
                      </select>
                      <select
                        value={getScoreDisplay(match.round2_player2_score)}
                        onChange={(e) =>
                          handleScoreChange(match.id, 'round2_player2_score', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="0.5">0.5</option>
                        <option value="0">0</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSave(match.id)}
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun match trouvé. Créez d'abord des matchs dans le calendrier.
          </div>
        )}
      </div>
    </div>
  );
}

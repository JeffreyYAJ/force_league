import { useState, useEffect } from 'react';
import { Crown, TrendingUp } from 'lucide-react';
import { supabase, PlayerStats } from '../lib/supabase';

export default function Ranking() {
  const [rankings, setRankings] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    setLoading(true);

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*');

    if (matchesError) {
      console.error('Error loading matches:', matchesError);
      setLoading(false);
      return;
    }

    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error('Error loading players:', playersError);
      setLoading(false);
      return;
    }

    if (!matchesData || !playersData) {
      setLoading(false);
      return;
    }

    const stats = new Map<string, PlayerStats>();

    playersData.forEach((player) => {
      stats.set(player.id, {
        player_id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        total_points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        matches_played: 0,
      });
    });

    matchesData.forEach((match) => {
      const r1p1 = match.round1_player1_score;
      const r1p2 = match.round1_player2_score;
      const r2p1 = match.round2_player1_score;
      const r2p2 = match.round2_player2_score;

      if (r1p1 === null || r1p2 === null || r2p1 === null || r2p2 === null) {
        return;
      }

      const player1Stats = stats.get(match.player1_id);
      const player2Stats = stats.get(match.player2_id);

      if (!player1Stats || !player2Stats) return;

      const player1Total = r1p1 + r2p1;
      const player2Total = r1p2 + r2p2;

      player1Stats.total_points += player1Total;
      player2Stats.total_points += player2Total;

      player1Stats.matches_played += 1;
      player2Stats.matches_played += 1;

      [r1p1, r2p1].forEach((score) => {
        if (score === 1) player1Stats.wins += 1;
        else if (score === 0.5) player1Stats.draws += 1;
        else if (score === 0) player1Stats.losses += 1;
      });

      [r1p2, r2p2].forEach((score) => {
        if (score === 1) player2Stats.wins += 1;
        else if (score === 0.5) player2Stats.draws += 1;
        else if (score === 0) player2Stats.losses += 1;
      });
    });

    const sortedRankings = Array.from(stats.values())
      .filter((stat) => stat.matches_played > 0)
      .sort((a, b) => b.total_points - a.total_points);

    setRankings(sortedRankings);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Classement</h2>
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun résultat disponible. Les matchs doivent être complétés pour afficher le classement.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joueur</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Matchs</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">V</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">N</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">D</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Points
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((player, index) => (
                <tr
                  key={player.player_id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <span
                      className={`font-bold ${
                        index === 0
                          ? 'text-yellow-600 text-xl'
                          : index === 1
                          ? 'text-gray-500'
                          : index === 2
                          ? 'text-orange-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-800">
                      {player.first_name} {player.last_name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    {player.matches_played}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded font-medium text-sm">
                      {player.wins}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium text-sm">
                      {player.draws}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded font-medium text-sm">
                      {player.losses}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {player.total_points.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

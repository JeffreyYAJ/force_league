import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase, Match, Player } from '../lib/supabase';

interface MatchWithPlayers extends Match {
  player1?: Player;
  player2?: Player;
}

export default function RecentResults() {
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentMatches();
  }, []);

  const loadRecentMatches = async () => {
    setLoading(true);

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .not('round1_player1_score', 'is', null)
      .not('round2_player1_score', 'is', null)
      .order('match_date', { ascending: false })
      .limit(10);

    if (matchesError) {
      console.error('Error loading matches:', matchesError);
      setLoading(false);
      return;
    }

    if (!matchesData || matchesData.length === 0) {
      setLoading(false);
      return;
    }

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
    setLoading(false);
  };

  const getMatchResult = (match: MatchWithPlayers) => {
    const p1Total =
      (match.round1_player1_score ?? 0) + (match.round2_player1_score ?? 0);
    const p2Total =
      (match.round1_player2_score ?? 0) + (match.round2_player2_score ?? 0);

    return { p1Total, p2Total };
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
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Résultats Récents</h2>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun résultat disponible pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const { p1Total, p2Total } = getMatchResult(match);
            return (
              <div
                key={match.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    {new Date(match.match_date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-right">
                    <span className="font-semibold text-gray-800 block">
                      {match.player1?.first_name} {match.player1?.last_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <span
                      className={`text-2xl font-bold ${
                        p1Total > p2Total
                          ? 'text-green-600'
                          : p1Total < p2Total
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {p1Total.toFixed(1)}
                    </span>
                    <span className="text-gray-400 font-medium">-</span>
                    <span
                      className={`text-2xl font-bold ${
                        p2Total > p1Total
                          ? 'text-green-600'
                          : p2Total < p1Total
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {p2Total.toFixed(1)}
                    </span>
                  </div>

                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">
                      {match.player2?.first_name} {match.player2?.last_name}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">R1:</span>{' '}
                      {match.round1_player1_score} - {match.round1_player2_score}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">R2:</span>{' '}
                      {match.round2_player1_score} - {match.round2_player2_score}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

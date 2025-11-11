import { useState, useEffect } from 'react';
import * as playersService from '../api/players';
import type { PlayerProfile } from '../types';

interface UsePlayerReturn {
  player: PlayerProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single player by ID
 */
export const usePlayer = (playerId?: string | null): UsePlayerReturn => {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = async () => {
    // Validate playerId - don't fetch if undefined, null, or the string "undefined"
    if (!playerId || playerId === 'undefined' || playerId === 'null') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await playersService.getPlayerProfile(playerId);
      setPlayer(data as unknown as PlayerProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch player');
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [playerId]);

  return {
    player,
    loading,
    error,
    refetch: fetchPlayer,
  };
};

/**
 * Hook to fetch random players (for accordion/carousel)
 */
export const useRandomPlayers = (limit: number = 5): UsePlayerReturn & { players: PlayerProfile[] } => {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playersService.getRandomPlayers(limit);
      setPlayers(data as unknown as PlayerProfile[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch players');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [limit]);

  return {
    players,
    player: players[0] || null, // For backward compatibility
    loading,
    error,
    refetch: fetchPlayers,
  };
};


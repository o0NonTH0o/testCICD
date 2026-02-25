import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User } from '../types';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.get<User>('/users/me');
        setUser(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        // 401 Unauthorized = not logged in yet, not a real error
        if (!msg.toLowerCase().includes('unauthorized') && !msg.includes('401')) {
          console.error('Failed to fetch current user', err);
          setError('Failed to load user profile');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}

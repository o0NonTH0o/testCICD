import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = status ? `?status=${status}` : '';
      const data = await api.get<User[]>(`/users${query}`);
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const approveUser = async (id: string) => {
    try {
      await api.patch(`/users/${id}/approve`, {});
      // update local state
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    approveUser
  };
}

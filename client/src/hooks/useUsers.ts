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
      await api.fetch(`/users/${id}/approve`, { method: 'PATCH' });
      // Update local state to remove approved user ONLY if we are viewing pending list
      // But typically we might want to just refetch or update status
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'ACTIVE' } : u));
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

  const rejectUser = async (id: string) => {
    try {
      await api.fetch(`/users/${id}/reject`, { method: 'PATCH' });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'REJECTED' } : u));
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

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      await api.fetch(`/users/${id}`, { 
          method: 'PATCH',
          body: JSON.stringify(data)
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
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
    approveUser,
    rejectUser,
    updateUser
  };
}

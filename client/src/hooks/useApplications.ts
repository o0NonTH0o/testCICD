import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { AwardApplication, CreateApplicationInput } from '../types';

export function useApplications() {
  const [applications, setApplications] = useState<AwardApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = status ? `?status=${status}` : '';
      const data = await api.get<AwardApplication[]>(`/applications${query}`);
      setApplications(data);
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

  const createApplication = async (data: CreateApplicationInput) => {
    try {
      await api.post('/applications/apply', data);
      await fetchApplications(); // Refresh list
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

  const updateStatus = async (id: string, action: 'APPROVED'|'REJECTED'|'NEEDS_EDIT', comment?: string) => {
    try {
      await api.patch(`/applications/${id}/status`, { action, comment });
      await fetchApplications(); // Refresh list
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return false;
    }
  }

  // Auto fetch on mount (optional, can be disabled)
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateStatus
  };
}

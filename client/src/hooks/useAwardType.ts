import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AwardType } from '../types';

export interface AwardTypeData extends AwardType {
  scheduleFileUrl?: string;
  criteria?: string;
}

interface UseAwardTypeResult {
  awardType: AwardTypeData | null;
  loading: boolean;
  error: string;
}

export const useAwardType = (id: string): UseAwardTypeResult => {
  const [awardType, setAwardType] = useState<AwardTypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const response = await api.get<AwardTypeData>(`/master/award-types/${id}`);
        setAwardType(response);
      } catch (err) {
        setError('Failed to load award type data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { awardType, loading, error };
};

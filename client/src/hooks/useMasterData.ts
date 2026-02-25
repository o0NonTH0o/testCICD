import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useCurrentUser } from './useCurrentUser';

export interface AwardType {
  id: string;
  awardName: string;
  description?: string;
  iconUrl?: string;
  scheduleFileUrl?: string;
  criteria?: string;
  tags?: string[];
}

export interface ApplicationPeriod {
  id: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export function useMasterData() {
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [activePeriod, setActivePeriod] = useState<ApplicationPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const types = await api.get<AwardType[]>('/master/award-types');
        setAwardTypes(types);

        if (user?.campusId) {
            const period = await api.get<ApplicationPeriod>(`/master/active-period?campusId=${user.campusId}`);
            setActivePeriod(period);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if user is loaded or not needed for types? 
    // Ideally await user loading, but for now fetch types immediately
    fetchData();
  }, [user?.campusId]); 

  return { awardTypes, activePeriod, loading };
}

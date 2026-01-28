import { ReturnApiService, ReturnEligibility } from '@/lib/api/return.api';
import { useState, useEffect } from 'react';

export function useReturnEligibility(orderId: string | null) {
  const [eligibility, setEligibility] = useState<ReturnEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchEligibility = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ReturnApiService.checkReturnEligibility(orderId);
        setEligibility(result);
      } catch (err: any) {
        setError(err.message);
        setEligibility(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [orderId]);

  return { eligibility, loading, error };
}
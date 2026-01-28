import { CreateReturnRequest, ReturnApiService } from '@/lib/api/return.api';
import { useState } from 'react';
import { toast } from 'sonner';

export function useCreateReturn() {
  const [loading, setLoading] = useState(false);

  const createReturn = async (data: CreateReturnRequest) => {
    setLoading(true);
    try {
      const result = await ReturnApiService.createReturn(data);
      toast.success('Return request submitted successfully!');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create return request');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createReturn, loading };
}
import { useState } from 'react';
import { locationApi } from '../services/locationApi';
import { ServiceabilityResponse } from '../core/types/domain';

export const useLocationServiceability = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceability, setServiceability] = useState<ServiceabilityResponse | null>(null);

  /**
   * Verifies if the given coordinates are serviceable.
   * Returns a boolean indicating if it is serviceable.
   */
  const verifyLocation = async (latitude: number, longitude: number): Promise<boolean> => {
    setIsChecking(true);
    setError(null);
    try {
      const response = await locationApi.checkServiceability(latitude, longitude);
      setServiceability(response);
      return response.serviceable;
    } catch (err: any) {
      setError(err.message || 'Failed to check serviceability');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    error,
    serviceability,
    verifyLocation,
  };
};

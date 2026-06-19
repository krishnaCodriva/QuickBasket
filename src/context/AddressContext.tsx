import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { addressApi, Address, AddressPayload } from '../services/addressApi';
import { useAuth } from './AuthContext';

interface AddressContextType {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  fetchAddresses: () => Promise<void>;
  addAddress: (data: AddressPayload) => Promise<Address | null>;
  updateAddress: (id: string, data: Partial<AddressPayload>) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
  selectAddress: (id: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { isLoading: isAuthLoading, user } = useAuth();

  const fetchAddresses = useCallback(async () => {
    // Only fetch addresses if a user is logged in
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await addressApi.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
        
        // Auto-select an address if none is selected
        if (!selectedAddressId && response.data.length > 0) {
          const defaultAddr = response.data.find(a => a.isDefault) || response.data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedAddressId]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchAddresses();
    }
  }, [isAuthLoading, fetchAddresses]);

  const addAddress = async (data: AddressPayload) => {
    setIsLoading(true);
    try {
      const response = await addressApi.createAddress(data);
      if (response.success && response.data) {
        setAddresses(prev => [...prev, response.data]);
        setSelectedAddressId(response.data.id);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to add address:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (id: string, data: Partial<AddressPayload>) => {
    setIsLoading(true);
    try {
      const response = await addressApi.updateAddress(id, data);
      if (response.success && response.data) {
        setAddresses(prev => prev.map(a => a.id === id ? response.data : a));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update address:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await addressApi.deleteAddress(id);
      if (response.success) {
        setAddresses(prev => prev.filter(a => a.id !== id));
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete address:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddressId,
        isLoading,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        selectAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

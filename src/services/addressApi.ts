import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.endpoints';

export interface AddressPayload {
  fullName: string;
  mobile: string;
  flat: string;
  street?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: string; // "home", "work", etc.
  latitude?: number;
  longitude?: number;
}

export interface Address extends AddressPayload {
  id: string;
  isDefault: boolean;
  isSelected: boolean;
}

export const addressApi = {
  getAddresses: async () => {
    const response = await apiClient.get<{ success: boolean; data: Address[] }>(
      API_ENDPOINTS.ADDRESS.GET_ALL
    );
    return response.data;
  },

  createAddress: async (data: AddressPayload) => {
    const response = await apiClient.post<{ success: boolean; data: Address }>(
      API_ENDPOINTS.ADDRESS.CREATE,
      data
    );
    return response.data;
  },

  updateAddress: async (id: string, data: Partial<AddressPayload>) => {
    const response = await apiClient.put<{ success: boolean; message: string; data: Address }>(
      API_ENDPOINTS.ADDRESS.UPDATE(id),
      data
    );
    return response.data;
  },

  deleteAddress: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.ADDRESS.DELETE(id)
    );
    return response.data;
  },
};

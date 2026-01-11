import clientApiService from "./api.client.service";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: "SHIPPING" | "BILLING" | "BOTH";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressesResponse {
  success: boolean;
  data: Address[];
}

export interface AddressResponse {
  success: boolean;
  data: Address;
}

export interface CreateAddressDTO {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  type?: "SHIPPING" | "BILLING" | "BOTH";
  isDefault?: boolean;
}

export interface UpdateAddressDTO {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  type?: "SHIPPING" | "BILLING" | "BOTH";
  isDefault?: boolean;
}

class AddressApiService {
  /**
   * Get all addresses for the user
   */
  async getAddresses(): Promise<AddressesResponse> {
    const response = await clientApiService.api.get("/addresses");
    return response.data;
  }

  /**
   * Get default address
   */
  async getDefaultAddress(): Promise<AddressResponse> {
    const response = await clientApiService.api.get("/addresses/default");
    return response.data;
  }

  /**
   * Get a single address by ID
   */
  async getAddress(id: string): Promise<AddressResponse> {
    const response = await clientApiService.api.get(`/addresses/${id}`);
    return response.data;
  }

  /**
   * Create a new address
   */
  async createAddress(
    data: CreateAddressDTO
  ): Promise<{ success: boolean; message: string; data: Address }> {
    const response = await clientApiService.api.post("/addresses", data);
    return response.data;
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    id: string,
    data: UpdateAddressDTO
  ): Promise<{ success: boolean; message: string; data: Address }> {
    const response = await clientApiService.api.put(`/addresses/${id}`, data);
    return response.data;
  }

  /**
   * Set an address as default
   */
  async setAsDefault(
    id: string
  ): Promise<{ success: boolean; message: string; data: Address }> {
    const response = await clientApiService.api.put(
      `/addresses/${id}/set-default`
    );
    return response.data;
  }

  /**
   * Delete an address
   */
  async deleteAddress(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await clientApiService.api.delete(`/addresses/${id}`);
    return response.data;
  }
}

export const addressApi = new AddressApiService();

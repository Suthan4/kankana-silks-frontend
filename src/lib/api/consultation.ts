import { authService } from "./api.base.service";

export enum ConsultationPlatform {
  WHATSAPP = "WHATSAPP",
  ZOOM = "ZOOM",
  GOOGLE_MEET = "GOOGLE_MEET",
}

export enum ConsultationStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CreateConsultationRequest {
  productId?: string;
  categoryId?: string;
  platform: ConsultationPlatform;
  preferredDate: string; // ISO datetime string
  preferredTime: string; // HH:MM format
  isPurchaseConsultation?: boolean;
  consultationNotes?: string;
}

export interface Consultation {
  id: string;
  userId: string;
  productId?: string;
  categoryId?: string;
  platform: ConsultationPlatform;
  preferredDate: string;
  preferredTime: string;
  status: ConsultationStatus;
  meetingLink?: string;
  rejectionReason?: string;
  approvedBy?: string;
  isPurchaseConsultation: boolean;
  consultationNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface ConsultationsResponse {
  success: boolean;
  data: {
    consultations: Consultation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ConsultationResponse {
  success: boolean;
  message?: string;
  data: Consultation;
}

export interface QueryConsultationParams {
  page?: number;
  limit?: number;
  status?: ConsultationStatus;
  platform?: ConsultationPlatform;
  startDate?: string;
  endDate?: string;
  sortBy?: "preferredDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export const consultationApi = {
  // Create a new consultation
  createConsultation: async (
    data: CreateConsultationRequest
  ): Promise<ConsultationResponse> => {
    const response = await authService.api.post("/consultations", data);
    return response.data;
  },

  // Get user's consultations
  getUserConsultations: async (
    params?: QueryConsultationParams
  ): Promise<ConsultationsResponse> => {
    const response = await authService.api.get("/consultations/my-consultations", {
      params,
    });
    return response.data;
  },

  // Get a specific consultation
  getConsultation: async (id: string): Promise<ConsultationResponse> => {
    const response = await authService.api.get(`/consultations/${id}`);
    return response.data;
  },

  // Cancel a consultation
  cancelConsultation: async (id: string): Promise<ConsultationResponse> => {
    const response = await authService.api.post(`/consultations/${id}/cancel`);
    return response.data;
  },
};
import { authService } from "./api.base.service";

export enum ReturnReason {
  DEFECTIVE = "DEFECTIVE",
  WRONG_ITEM = "WRONG_ITEM",
  SIZE_ISSUE = "SIZE_ISSUE",
  COLOR_DIFFERENCE = "COLOR_DIFFERENCE",
  QUALITY_ISSUE = "QUALITY_ISSUE",
  NOT_AS_DESCRIBED = "NOT_AS_DESCRIBED",
  DAMAGED_IN_TRANSIT = "DAMAGED_IN_TRANSIT",
  CHANGED_MIND = "CHANGED_MIND",
  OTHER = "OTHER",
}

export enum ReturnStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PICKUP_SCHEDULED = "PICKUP_SCHEDULED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  RECEIVED = "RECEIVED",
  INSPECTED = "INSPECTED",
  REFUND_INITIATED = "REFUND_INITIATED",
  REFUND_COMPLETED = "REFUND_COMPLETED",
  CLOSED = "CLOSED",
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = "ORIGINAL_PAYMENT",
  STORE_CREDIT = "STORE_CREDIT",
  BANK_TRANSFER = "BANK_TRANSFER",
}

// Helper functions for display
export const getReturnReasonLabel = (reason: ReturnReason): string => {
  const labels: Record<ReturnReason, string> = {
    [ReturnReason.DEFECTIVE]: "Defective Product",
    [ReturnReason.WRONG_ITEM]: "Wrong Item Delivered",
    [ReturnReason.SIZE_ISSUE]: "Size Issue",
    [ReturnReason.COLOR_DIFFERENCE]: "Color Difference",
    [ReturnReason.QUALITY_ISSUE]: "Quality Issue",
    [ReturnReason.NOT_AS_DESCRIBED]: "Not As Described",
    [ReturnReason.DAMAGED_IN_TRANSIT]: "Damaged in Transit",
    [ReturnReason.CHANGED_MIND]: "Changed Mind",
    [ReturnReason.OTHER]: "Other",
  };
  return labels[reason];
};

export const getReturnStatusLabel = (status: ReturnStatus): string => {
  const labels: Record<ReturnStatus, string> = {
    [ReturnStatus.PENDING]: "Pending Review",
    [ReturnStatus.APPROVED]: "Approved",
    [ReturnStatus.REJECTED]: "Rejected",
    [ReturnStatus.PICKUP_SCHEDULED]: "Pickup Scheduled",
    [ReturnStatus.PICKED_UP]: "Picked Up",
    [ReturnStatus.IN_TRANSIT]: "In Transit",
    [ReturnStatus.RECEIVED]: "Received at Warehouse",
    [ReturnStatus.INSPECTED]: "Inspected",
    [ReturnStatus.REFUND_INITIATED]: "Refund Initiated",
    [ReturnStatus.REFUND_COMPLETED]: "Refund Completed",
    [ReturnStatus.CLOSED]: "Closed",
  };
  return labels[status];
};

export const getRefundMethodLabel = (method: RefundMethod): string => {
  const labels: Record<RefundMethod, string> = {
    [RefundMethod.ORIGINAL_PAYMENT]: "Original Payment Method",
    [RefundMethod.STORE_CREDIT]: "Store Credit",
    [RefundMethod.BANK_TRANSFER]: "Bank Transfer",
  };
  return labels[method];
};

// Check if return reason is free (no shipping deduction)
export const isFreeReturnReason = (reason: ReturnReason): boolean => {
  return [
    ReturnReason.DEFECTIVE,
    ReturnReason.WRONG_ITEM,
    ReturnReason.NOT_AS_DESCRIBED,
    ReturnReason.DAMAGED_IN_TRANSIT,
  ].includes(reason);
};

export interface ReturnEligibility {
  eligible: boolean;
  reason?: string;
  returnWindowHours: number;
  deliveredAt?: string;
  hoursRemaining?: number;
  daysRemaining?: number;
}

export interface CreateReturnRequest {
  orderId: string;
  orderItems: Array<{
    orderItemId: string;
    quantity: number;
    reason: ReturnReason;
  }>;
  reasonDetails: string;
  images?: string[];
  refundMethod: RefundMethod;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
}

export class ReturnApiService {
  /**
   * ✅ Check if order is eligible for return (24-hour window)
   * Call this before showing return button
   */
  static async checkReturnEligibility(
    orderId: string
  ): Promise<ReturnEligibility> {
    const response = await authService.api.get(
      `/returns/eligibility/${orderId}`
    );
    return response.data.data;
  }

  /**
   * Create return request
   */
  static async createReturn(data: CreateReturnRequest) {
    const response = await authService.api.post('/returns', data);
    return response.data.data;
  }

  /**
   * Get user's returns
   */
  static async getUserReturns(params?: {
    page?: number;
    limit?: number;
    status?: ReturnStatus;
  }) {
    const response = await authService.api.get('/returns/my-returns', { params });
    return response.data.data;
  }

  /**
   * Get return details
   */
  static async getReturn(returnId: string) {
    const response = await authService.api.get(`/returns/${returnId}`);
    return response.data.data;
  }

  /**
   * Track return shipment
   */
  static async trackReturnShipment(returnId: string) {
    const response = await authService.api.get(`/returns/${returnId}/track`);
    return response.data.data;
  }
}
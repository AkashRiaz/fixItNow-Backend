export interface IBookingCreatePayload {
  slotStart: string;
  slotEnd: string;
  notes?: string;
  customerAddress: string;
  serviceId: string;
}

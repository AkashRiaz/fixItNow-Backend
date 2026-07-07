export interface IBookingCreatePayload {
    bookingDate: Date;
    notes?: string;
    customerAddress: string;
    serviceId: string;
}
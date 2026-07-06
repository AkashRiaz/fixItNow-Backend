export interface ITechnicianUpdatePayload {
  bio?: string;
  experience?: string;
  location?: string;
  hourlyRate?: number;
}
export interface ITechnicianAvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
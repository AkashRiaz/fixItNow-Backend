import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";

export interface ITechnicianUpdatePayload {
  bio?: string;
  experience?: string;
  location?: string;
  hourlyRate?: number;
  profilePhoto?: string;
}
export interface ITechnicianAvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface IServiceQuery extends TechnicianProfileWhereInput {
  searchTerm?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IBecomeTechnicianPayload {
  bio?: string;
  experience?: string;
  location?: string;
  hourlyRate?: number;
  profilePhoto?: string;
}

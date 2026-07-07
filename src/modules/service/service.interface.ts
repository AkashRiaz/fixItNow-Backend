import { ServiceWhereInput } from "../../../generated/prisma/models";

export interface IServiceCreatePayload {
    title: string;
    description?: string;
    price: number;
    duration: number;
    categoryId: string;
}

export interface IServiceQuery extends ServiceWhereInput {

    searchTerm?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
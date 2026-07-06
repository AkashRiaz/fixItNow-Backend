import { Role } from "../../../generated/prisma/enums";


export interface IUserRegisteredPayload {
    name: string;
    email: string;
    password: string;
    phone? : string;
    role?: Role;
}
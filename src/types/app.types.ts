import { User } from "../db";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export interface JWTPayload {
    userId: number;
    wallet: string;
}

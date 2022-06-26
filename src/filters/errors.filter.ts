import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.response) {
        return res.status(err.response?.status || 500).send(err.response?.data);
    }
    res.status(err.status || 500).send(composeErrorObject(err));
}

function composeErrorObject(err: { name: any; message: any; details?: any }) {
    const response: any = {
        error: err.name,
        message: err.message,
    };

    if (err.details) {
        response.details = err.details;
    }
    return response;
}

export class ApiError extends Error {
    public status: any;

    constructor(clazz, message: string, status: number) {
        super(message);
        this.name = clazz.name;
        this.status = status;
        Error.captureStackTrace(this, clazz);
    }
}

export class DatabaseError extends ApiError {
    public details: any;

    constructor(details?: any) {
        super(DatabaseError, "Database error", 500);
        this.details = details;
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(NotFoundError, message, 404);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(ForbiddenError, message, 403);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(UnauthorizedError, message, 401);
    }
}

export class ValidationError extends ApiError {
    public details: any;

    constructor(message: string, details?: any) {
        super(ValidationError, message, 400);
        this.details = details;
    }
}

export class TimeoutError extends ApiError {
    constructor(message: string) {
        super(TimeoutError, message, 504);
    }
}

export class ConflictError extends ApiError {
    public details: any;

    constructor(message: string, details?: any) {
        super(ConflictError, message, 409);
        this.details = details;
    }
}

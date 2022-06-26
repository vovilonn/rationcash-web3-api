import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validationPipe(req: Request, res: Response, next: NextFunction) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        next();
    } catch (err) {
        next(err);
    }
}

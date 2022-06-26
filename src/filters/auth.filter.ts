import { JWTPayload } from "./../types/app.types";
import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "./errors.filter";
import fs from "fs";
import path from "path";
import { verify } from "jsonwebtoken";
import { User } from "../db";

const jwrPrivateKey = fs.readFileSync(path.resolve("./JWT-RSA.key"));

export async function authorizationPipe(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization;

        if (!token) {
            throw new UnauthorizedError("Bearer authorization required");
        }

        const decoded = verify(token?.split("Bearer ")[1], jwrPrivateKey, { algorithms: ["RS512"] }) as JWTPayload;

        if (!decoded.userId) {
            throw new UnauthorizedError(`Invalid payload`);
        }

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            throw new UnauthorizedError(`User with id ${decoded.userId} does not exist`);
        }

        req.user = user;

        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return next(new UnauthorizedError(err.message));
        }
        next(err);
    }
}

import { NextFunction, Request, Response } from "express";
import { MetamaskLogin } from "metamask-node-auth";
import NodeCache from "node-cache";
import { v4 } from "uuid";
import fs from "fs";
import { UnauthorizedError } from "../filters";
import path from "path";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";
import { User } from "../db";
import { ethers } from "ethers";

const cache = new NodeCache();

const jwrPrivateKey = fs.readFileSync(path.resolve("./JWT-RSA.key"));

function sign(payload: JWTPayload) {
    return jwt.sign(
        {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        jwrPrivateKey,
        { algorithm: "RS512" }
    );
}

export async function getMsgToSign(req: Request, res: Response, next: NextFunction) {
    try {
        const wallet = req.query.wallet as string;

        const message = `Ration cash auth nonce: ${v4()}`;

        cache.set<string>(wallet, message, 30000000000);

        res.send({ message });
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const wallet = req.body.wallet as string;
        const sig = req.body.signature;
        const msg: string = cache.get(wallet);

        if (!msg) {
            throw new UnauthorizedError("Invalid wallet or signature expired");
        }

        if (!MetamaskLogin.verifySignature(msg, wallet, sig)) {
            throw new UnauthorizedError("Invalid signature");
        }

        let user = await User.findOne({ where: { wallet } });

        if (!user) {
            user = await User.create({ wallet });
        }

        const authToken = sign({
            userId: +user.ID,
            wallet,
        });

        cache.del(wallet);

        res.json({ authToken });
    } catch (err) {
        next(err);
    }
}

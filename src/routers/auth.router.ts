import express from "express";
import { body, query } from "express-validator";
import { validationPipe } from "../filters";
import { getMsgToSign, login } from "../services/auth.service";

const router = express.Router();

router.get(
    "/msg-to-sign",
    query("wallet")
        .not()
        .isEmpty()
        .withMessage("Must be provided")
        .isEthereumAddress()
        .withMessage("Must be a valid ethereum address")
        .toLowerCase(),
    validationPipe,
    getMsgToSign
);

router.post(
    "/login",
    body("wallet")
        .not()
        .isEmpty()
        .withMessage("Must be provided")
        .isEthereumAddress()
        .withMessage("Must be a valid ethereum address")
        .toLowerCase(),
    body("signature")
        .not()
        .isEmpty()
        .withMessage("Must be provided")
        .isHexadecimal()
        .withMessage("Must be a valid hexadecimal string"),
    validationPipe,
    login
);

export const authRouter = router;

import express from "express";
import { body, query } from "express-validator";
import { validationPipe } from "../filters";
import { depositTokens, getOffchainBalance, getOnchainBalance, withdrawTokens } from "../services/payments.service";
import { authorizationPipe } from "../filters/auth.filter";

const router = express.Router();

router.get("/balance/offchain", authorizationPipe, getOffchainBalance);

router.get("/balance/onchain", authorizationPipe, getOnchainBalance);

router.get("/wallet-recipient", (req, res) => res.json({ wallet: process.env.RECIPIENT_WALLET }));

router.post(
    "/deposit",
    body("txHash")
        .not()
        .isEmpty()
        .withMessage("Must be a provided")
        .isHexadecimal()
        .withMessage("Must be a valid hexadecimal string"),
    authorizationPipe,
    validationPipe,
    depositTokens
);

router.post(
    "/withdraw",
    body("amount").not().isEmpty().withMessage("Must be a provided").isNumeric().withMessage("Must be a numeric"),
    authorizationPipe,
    validationPipe,
    withdrawTokens
);

export const paymentsRouter = router;

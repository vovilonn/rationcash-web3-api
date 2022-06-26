import { config } from "dotenv";
import { ethers } from "ethers";
import { NextFunction, Request, Response } from "express";
import { Web3Payments } from "web3-payments";
import { rpcUrl } from "../constants";
import { sequelize, User, Web3Payments as Web3PaymentsModel } from "../db";
import { ConflictError, NotFoundError, ValidationError } from "../filters";
import abi from "../ABI.json";
import { formatUnits, parseUnits } from "ethers/lib/utils";

config();

async function checkPaymentAvialability(tx: ethers.providers.TransactionResponse) {
    try {
        const count = await Web3PaymentsModel.count({ where: { txHash: tx.hash } });
        return !count;
    } catch (err) {
        console.error(err);
    }
}

const web3Payments = new Web3Payments({
    recipientWallet: process.env.RECIPIENT_WALLET,
    rpcProviderUrl: rpcUrl,
    checkPaymentAvialability,
    abi,
});

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, web3Payments.provider);

export async function getOffchainBalance(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({ balance: req.user.balance });
    } catch (err) {
        next(err);
    }
}

export async function getOnchainBalance(req: Request, res: Response, next: NextFunction) {
    try {
        const balance = await contract.balanceOf(req.user.wallet);
        res.json({ balance: formatUnits(balance, 9) });
    } catch (err) {
        next(err);
    }
}

export async function depositTokens(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
        const txHash = req.body.txHash;
        const result = await web3Payments.verifyPayment(txHash, 30000);

        if (!result) {
            next(new NotFoundError("Transaction not found or being processed"));
        }

        if (!result.sucess) {
            next(new ConflictError("Transaction failed"));
        }

        const depositAmount = formatUnits(result.decodedData?.amount, 9);
        await Web3PaymentsModel.create({ txHash }, { transaction });
        await User.incrementBalance(+depositAmount, req.user.ID, transaction);
        await transaction.commit();

        res.sendStatus(204);
    } catch (err) {
        await transaction.rollback();
        if (err.code === "INVALID_ARGUMENT") {
            return next(new ValidationError("Invalid txHash"));
        }
        if (err.code === "TIMEOUT") {
            return next(new NotFoundError("Transaction not found or being processed"));
        }
        if (err.details?.errCode === "CONFLICT_ADDR" || err.details?.errCode === "UNAVAILABLE") {
            return next(new ConflictError(err.message));
        }
        next(err);
    }
}

export async function withdrawTokens(req: Request, res: Response, next: NextFunction) {
    try {
        const withdrawalAmount = req.body.amount;

        const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY);

        if (req.user.balance - withdrawalAmount < 0) {
            throw new ConflictError("Insufficient funds to withdraw");
        }

        await contract
            .connect(wallet.connect(web3Payments.provider))
            .transfer(req.user.wallet, parseUnits(withdrawalAmount.toString(), 9));

        await User.decrementBalance(withdrawalAmount, req.user.ID);

        res.sendStatus(204);
    } catch (err) {
        console.log(err);

        next(err);
    }
}

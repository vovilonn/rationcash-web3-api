import { config } from "dotenv";
config();

const isProduction = process.env.NODE_ENV === "production";

export const rpcUrl = isProduction
    ? "https://bsc-dataseed1.binance.org/"
    : "https://data-seed-prebsc-2-s1.binance.org:8545/";

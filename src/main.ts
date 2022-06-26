import { paymentsRouter } from "./routers/payments.router";
import express from "express";
import { connectToDb } from "./db";
import { errorHandler } from "./filters";
import { authRouter } from "./routers/auth.router";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/payments", paymentsRouter);

app.use(errorHandler);

app.listen(3000, "0.0.0.0", () => {
    console.log("Started on http://localhost:3000");
    connectToDb();
});

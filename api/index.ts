import express from "express";
import apiRouter from "../server/routes/api";
import { db } from "../src/db"; // Ensure db is imported if needed for initialization

const app = express();
app.use(express.json());

// Vercel routes everything under /api here based on vercel.json rewrite
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;

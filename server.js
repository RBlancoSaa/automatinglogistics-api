require("ts-node").register();
require("./src/index.ts");
import express from 'express';
import cors from 'cors';
import routes from './src/routes/index.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api', routes); // ⚠️ DIT IS BELANGRIJK

export default app;

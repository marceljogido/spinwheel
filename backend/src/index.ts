import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthcheck } from './db/pool.js';
import { prizesRouter } from './routes/prizes.js';

const app = express();

const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',').map(origin => origin.trim()).filter(Boolean) ?? ['http://localhost:5173'];

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  const dbIsHealthy = await healthcheck();
  res.json({ ok: true, database: dbIsHealthy });
});

app.use('/prizes', prizesRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message ?? 'Unexpected error' });
});

app.listen(port, () => {
  console.log(`Spinwheel API listening on http://localhost:${port}`);
});

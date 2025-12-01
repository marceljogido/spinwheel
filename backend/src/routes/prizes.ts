import { Request, Router } from 'express';
import { PoolClient } from 'pg';
import { mapPrizeRow, query, withTransaction } from '../db/pool';
import { prizeInputSchema } from '../utils/validation';
import { requireAuth } from './auth';
import type { Server as SocketIOServer } from 'socket.io';

const router = Router();

const emitPrizesUpdated = (req: Request) => {
  const io = req.app.get('socketio') as SocketIOServer | undefined;
  if (io) {
    io.emit('prizes_updated');
  }
};

router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM prizes ORDER BY sort_index ASC, created_at ASC');
    res.json({ prizes: result.rows.map(mapPrizeRow) });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = prizeInputSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO prizes (name, color, quota, won, win_percentage, image_url, sort_index)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, (SELECT COALESCE(MAX(sort_index) + 1, 0) FROM prizes)))
       RETURNING *`,
      [parsed.name, parsed.color, parsed.quota, parsed.won ?? 0, parsed.winPercentage, parsed.image ?? null, parsed.sortIndex ?? null]
    );
    emitPrizesUpdated(req);
    res.status(201).json({ prize: mapPrizeRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const parsed = prizeInputSchema.partial({ won: true, sortIndex: true }).parse(req.body);
    const imageProvided = Object.prototype.hasOwnProperty.call(req.body, 'image');
    const imageValue = parsed.image ?? null;
    const { rows } = await query(
      `UPDATE prizes
         SET name = COALESCE($2, name),
             color = COALESCE($3, color),
             quota = COALESCE($4, quota),
             won = COALESCE($5, won),
             win_percentage = COALESCE($6, win_percentage),
             image_url = CASE WHEN $8 THEN $7 ELSE image_url END,
             sort_index = COALESCE($9, sort_index),
             updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        parsed.name ?? null,
        parsed.color ?? null,
        parsed.quota ?? null,
        parsed.won ?? null,
        parsed.winPercentage ?? null,
        imageValue,
        imageProvided,
        parsed.sortIndex ?? null
      ]
    );

    if (!rows[0]) {
      res.status(404).json({ message: 'Prize not found' });
      return;
    }

    emitPrizesUpdated(req);
    res.json({ prize: mapPrizeRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM prizes WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      res.status(404).json({ message: 'Prize not found' });
      return;
    }
    emitPrizesUpdated(req);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/win', async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE prizes
         SET won = CASE
           WHEN won < quota THEN won + 1
           ELSE won
         END,
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (!rows[0]) {
      res.status(404).json({ message: 'Prize not found' });
      return;
    }

    if (rows[0].won > rows[0].quota) {
      res.status(409).json({ message: 'Prize quota exceeded' });
      return;
    }

    emitPrizesUpdated(req);
    res.json({ prize: mapPrizeRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post('/reset', requireAuth, async (req, res, next) => {
  try {
    await query('UPDATE prizes SET won = 0, updated_at = NOW()');
    const { rows } = await query('SELECT * FROM prizes ORDER BY sort_index ASC, created_at ASC');
    emitPrizesUpdated(req);
    res.json({ prizes: rows.map(mapPrizeRow) });
  } catch (error) {
    next(error);
  }
});

router.post('/reorder', requireAuth, async (req, res, next) => {
  const updates: Array<{ id: string; sortIndex: number }> = req.body?.order;
  if (!Array.isArray(updates) || updates.some(update => typeof update.id !== 'string' || typeof update.sortIndex !== 'number')) {
    res.status(400).json({ message: 'Invalid order payload' });
    return;
  }

  try {
    await withTransaction(async (client: PoolClient) => {
      for (const update of updates) {
        await client.query('UPDATE prizes SET sort_index = $2, updated_at = NOW() WHERE id = $1', [update.id, update.sortIndex]);
      }
    });

    const { rows } = await query('SELECT * FROM prizes ORDER BY sort_index ASC, created_at ASC');
    emitPrizesUpdated(req);
    res.json({ prizes: rows.map(mapPrizeRow) });
  } catch (error) {
    next(error);
  }
});

export const prizesRouter = router;

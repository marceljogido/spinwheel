import { z } from 'zod';

const imageSchema = z
  .union([z.string().url(), z.literal(''), z.null()])
  .optional()
  .transform(value => {
    if (value === null) return null;
    if (typeof value === 'undefined') return undefined;
    if (typeof value === 'string') {
      return value.length === 0 ? undefined : value;
    }
    return undefined;
  });

export const prizeInputSchema = z.object({
  name: z.string().min(1).max(120),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  quota: z.coerce.number().int().min(0),
  won: z.coerce.number().int().min(0).optional().default(0),
  winPercentage: z.coerce.number().min(0).max(100),
  image: imageSchema,
  sortIndex: z.coerce.number().int().min(0).optional()
});

export type PrizeInput = z.infer<typeof prizeInputSchema>;

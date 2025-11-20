import { z } from 'zod';

export const generateShareSchema = z.strictObject({
  fileId: z.coerce.number().int().positive(),
  expiryHours: z.coerce.number().int().positive().min(1)
});

export const shareTokenSchema = z.strictObject({
  token: z.string().trim().min(1, 'Invalid share token')
});

export const revokeShareSchema = z.strictObject({
  fileId: z.coerce.number().int().positive()
});

export type GenerateShareInput = z.infer<typeof generateShareSchema>;
export type ShareTokenInput = z.infer<typeof shareTokenSchema>;
export type RevokeShareInput = z.infer<typeof revokeShareSchema>;

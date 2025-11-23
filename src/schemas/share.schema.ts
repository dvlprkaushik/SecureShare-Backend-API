import { z } from 'zod';

export const generateShareSchema = z.object({
  fileId: z.coerce.number().int().positive(),
  expiryValue: z.coerce.number().int().positive().min(1),
  expiryUnit: z.enum(["day", "min"])
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

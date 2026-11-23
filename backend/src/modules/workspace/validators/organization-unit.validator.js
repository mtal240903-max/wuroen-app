import { z } from 'zod';

export const UnitTypeEnum = z.enum([
  'DEPARTMENT',
  'TEAM',
  'GROUP',
  'PROJECT',
  'COMMITTEE',
  'CELL',
  'COMMISSION',
  'REGION',
  'BRANCH'
]);

export const createOrganizationUnitSchema = z.object({
  organizationId: z.string().min(1, "L'identifiant de l'organisation est requis."),
  parentId: z.string().nullable().optional(),
  name: z.string().min(2, "Le nom de l'unité doit contenir au moins 2 caractères."),
  slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères."),
  type: UnitTypeEnum.optional().default('DEPARTMENT'),
  inheritPermissions: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional().default({}),
});
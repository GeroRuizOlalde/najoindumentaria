import { z } from "zod";

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  group: z.string().default("general"),
});

export const settingsUpdateSchema = z.record(z.string(), z.string());

export type SettingFormData = z.infer<typeof settingSchema>;

import { z } from "zod";

export const optionalDateStringSchema = z
  .string()
  .optional()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Please enter a valid date."
  });

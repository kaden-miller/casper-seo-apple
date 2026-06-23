import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  businessDescription: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export const websiteSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name: z.string().min(1, "Website name is required"),
  url: z.string().min(1, "URL is required").url("Enter a valid URL"),
  cmsType: z.string().optional(),
  primaryLocation: z.string().optional(),
  serviceAreas: z.string().optional(),
  targetServices: z.string().optional(),
  notes: z.string().optional(),
});

export const keywordSchema = z.object({
  websiteId: z.string().min(1),
  keyword: z.string().min(1, "Keyword is required"),
  targetUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  device: z.enum(["DESKTOP", "MOBILE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  notes: z.string().optional(),
});

export const competitorSchema = z.object({
  websiteId: z.string().min(1),
  name: z.string().min(1, "Competitor name is required"),
  domain: z.string().min(1, "Domain is required"),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
export type WebsiteFormValues = z.infer<typeof websiteSchema>;
export type KeywordFormValues = z.infer<typeof keywordSchema>;
export type CompetitorFormValues = z.infer<typeof competitorSchema>;

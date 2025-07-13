'use server';
/**
 * @fileOverview Validates a user's license from a Google Sheet.
 *
 * - validateLicense - A function that handles the license validation process.
 * - ValidateLicenseInput - The input type for the validateLicense function.
 * - ValidateLicenseOutput - The return type for the validateLicense function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ValidateLicenseInputSchema = z.object({
  licenseSheetId: z.string().describe('The ID of the Google Sheet containing license data.'),
  email: z.string().email().describe("The user's email address to validate."),
});
export type ValidateLicenseInput = z.infer<typeof ValidateLicenseInputSchema>;

const ValidateLicenseOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the license is valid.'),
  expiryDate: z.string().optional().describe('The license expiry date in YYYY-MM-DD format if valid.'),
  reason: z.string().optional().describe('The reason for invalidity.'),
});
export type ValidateLicenseOutput = z.infer<typeof ValidateLicenseOutputSchema>;

export async function validateLicense(input: ValidateLicenseInput): Promise<ValidateLicenseOutput> {
  return validateLicenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateLicensePrompt',
  input: { schema: ValidateLicenseInputSchema },
  output: { schema: ValidateLicenseOutputSchema },
  prompt: `You are a license validation service. Your task is to check a user's license from a Google Sheet.
The current date is ${new Date().toISOString().split('T')[0]}.

The Google Sheet at '{{{licenseSheetId}}}' contains license information in three columns:
- Column A: Email
- Column B: Status
- Column C: Expiry Date (YYYY-MM-DD)

To be valid, a license must meet all the following criteria:
1. The user's email address '{{{email}}}' must exist in Column A.
2. The 'Status' in Column B for that user's row must be exactly 'active'.
3. The 'Expiry Date' in Column C must be today or in the future.

If the user's email is not found, the status is not 'active', or the expiry date has passed, the license is invalid.

Check the license for '{{{email}}}' and return the result.
If valid, set isValid to true and return the expiryDate.
If invalid, set isValid to false and provide a brief reason.`,
});


const validateLicenseFlow = ai.defineFlow(
  {
    name: 'validateLicenseFlow',
    inputSchema: ValidateLicenseInputSchema,
    outputSchema: ValidateLicenseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

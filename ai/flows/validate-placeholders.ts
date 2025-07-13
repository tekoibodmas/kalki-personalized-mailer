'use server';

/**
 * @fileOverview Validates placeholders in email content against a list of authorized placeholders.
 *
 * - validatePlaceholders - A function to validate placeholders in email content.
 * - ValidatePlaceholdersInput - The input type for the validatePlaceholders function.
 * - ValidatePlaceholdersOutput - The return type for the validatePlaceholders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidatePlaceholdersInputSchema = z.object({
  content: z.string().describe('The email content to validate.'),
  authorizedPlaceholders: z.array(z.string()).describe('The list of authorized placeholders.'),
});
export type ValidatePlaceholdersInput = z.infer<typeof ValidatePlaceholdersInputSchema>;

const ValidatePlaceholdersOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the content contains only authorized placeholders.'),
  invalidPlaceholders: z.array(z.string()).describe('The list of invalid placeholders found in the content.'),
});
export type ValidatePlaceholdersOutput = z.infer<typeof ValidatePlaceholdersOutputSchema>;

export async function validatePlaceholders(input: ValidatePlaceholdersInput): Promise<ValidatePlaceholdersOutput> {
  return validatePlaceholdersFlow(input);
}

const validatePlaceholdersPrompt = ai.definePrompt({
  name: 'validatePlaceholdersPrompt',
  input: {schema: ValidatePlaceholdersInputSchema},
  output: {schema: ValidatePlaceholdersOutputSchema},
  prompt: `You are a placeholder validator.

You will receive email content and a list of authorized placeholders.
Your task is to determine if the content contains only authorized placeholders.
If the content contains any unauthorized placeholders, return them in the invalidPlaceholders array.

Content: {{{content}}}
Authorized Placeholders: {{#each authorizedPlaceholders}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
`,
});

const validatePlaceholdersFlow = ai.defineFlow(
  {
    name: 'validatePlaceholdersFlow',
    inputSchema: ValidatePlaceholdersInputSchema,
    outputSchema: ValidatePlaceholdersOutputSchema,
  },
  async input => {
    const placeholderRegex = /\{([^\}]+)\}/g;
    const usedPlaceholders = [];
    let match;
    while ((match = placeholderRegex.exec(input.content)) !== null) {
      usedPlaceholders.push(match[1]);
    }

    const invalidPlaceholders = usedPlaceholders.filter(
      placeholder => !input.authorizedPlaceholders.includes(placeholder)
    );

    const isValid = invalidPlaceholders.length === 0;

    return {
      isValid: isValid,
      invalidPlaceholders: invalidPlaceholders,
    };
  }
);

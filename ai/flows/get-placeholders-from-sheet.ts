'use server';
/**
 * @fileOverview Retrieves placeholder values from a Google Sheet and replaces them in email content.
 *
 * - getPlaceholders - A function that retrieves placeholder values from a Google Sheet.
 * - GetPlaceholdersInput - The input type for the getPlaceholders function.
 * - GetPlaceholdersOutput - The return type for the getPlaceholders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPlaceholdersInputSchema = z.object({
  googleSheetId: z.string().describe('The ID of the Google Sheet containing placeholder data.'),
  subject: z.string().describe('The subject of the email, which may contain placeholders.'),
  body: z.string().describe('The body of the email, which may contain placeholders.'),
});
export type GetPlaceholdersInput = z.infer<typeof GetPlaceholdersInputSchema>;

const GetPlaceholdersOutputSchema = z.object({
  populatedSubject: z.string().describe('The subject with placeholders replaced.'),
  populatedBody: z.string().describe('The body with placeholders replaced.'),
});
export type GetPlaceholdersOutput = z.infer<typeof GetPlaceholdersOutputSchema>;

export async function getPlaceholders(input: GetPlaceholdersInput): Promise<GetPlaceholdersOutput> {
  return getPlaceholdersFlow(input);
}

const getPlaceholdersPrompt = ai.definePrompt({
  name: 'getPlaceholdersPrompt',
  input: {schema: GetPlaceholdersInputSchema},
  output: {schema: GetPlaceholdersOutputSchema},
  prompt: `You are a helpful assistant designed to replace placeholders in email content with data from a Google Sheet.

  The Google Sheet ID is: {{{googleSheetId}}}
  The email subject is: {{{subject}}}
  The email body is: {{{body}}}

  Populate the subject and body with data from the sheet, and return the populated subject and body.
  Ensure that only allowed placeholders are used, and return an error if unauthorized placeholders are found.
  Allowed placeholders are: {Name}, {Company}, {Offer}, {InvoiceID}, {OrderID}, {GUID}, {CustomerID}, {ProductID}, {TrackingNumber}, {ConfirmationCode}, {ReferenceNumber}, {TicketID}, {BookingID}, {UserID}, {SubscriptionID}, {PaymentID}, {TransactionID}, {SessionID}, {RequestID}, {CorrelationID}, {BatchID}, {ShipmentID}, {DiscountCode}, {VoucherCode}, {SerialNumber}, {LicenseKey}
  If a value for a placeholder is not found in the Google Sheet, leave the placeholder as is.
  `,
});

const getPlaceholdersFlow = ai.defineFlow(
  {
    name: 'getPlaceholdersFlow',
    inputSchema: GetPlaceholdersInputSchema,
    outputSchema: GetPlaceholdersOutputSchema,
  },
  async input => {
    const {output} = await getPlaceholdersPrompt(input);
    return output!;
  }
);

'use server';

import { getPlaceholders, GetPlaceholdersOutput } from '@/ai/flows/get-placeholders-from-sheet';
import { validatePlaceholders } from '@/ai/flows/validate-placeholders';
import { validateLicense, ValidateLicenseOutput } from '@/ai/flows/validate-license';
import { z } from 'zod';
import { getUser, setUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const authorizedPlaceholders = [
  'Name',
  'Company',
  'Offer',
  'InvoiceID',
  'OrderID',
  'GUID',
  'CustomerID',
  'ProductID',
  'TrackingNumber',
  'ConfirmationCode',
  'ReferenceNumber',
  'TicketID',
  'BookingID',
  'UserID',
  'SubscriptionID',
  'PaymentID',
  'TransactionID',
  'SessionID',
  'RequestID',
  'CorrelationID',
  'BatchID',
  'ShipmentID',
  'DiscountCode',
  'VoucherCode',
  'SerialNumber',
  'LicenseKey',
];

const processEmailSchema = z.object({
  subject: z.string().min(1, 'Subject cannot be empty.'),
  body: z.string().min(1, 'Body cannot be empty.'),
  recipients: z.string().min(1, 'Recipients cannot be empty.'),
});

export type MailerFormState = {
  data: GetPlaceholdersOutput | null;
  error: string | null;
  license: ValidateLicenseOutput | null;
  fieldErrors?: {
    subject?: string[];
    body?: string[];
    recipients?: string[];
  };
};

export async function generatePreviewAction(
  prevState: MailerFormState,
  formData: FormData
): Promise<MailerFormState> {
  const placeholderSheetId = process.env.PLACEHOLDER_SHEET_ID;
  const user = await getUser();

  if (!user) {
    return {
      data: null,
      error: 'User not authenticated. Please log in again.',
      license: null,
    };
  }
  
  const licenseResult: ValidateLicenseOutput = {
    isValid: true,
    expiryDate: user.expiryDate,
  }

  if (!placeholderSheetId) {
    return {
      data: null,
      error: 'Placeholder Google Sheet ID is not configured. Please contact the administrator.',
      license: licenseResult,
    };
  }

  const rawData = {
    subject: formData.get('subject'),
    body: formData.get('body'),
    recipients: formData.get('recipients'),
  };

  const parsed = processEmailSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      data: null,
      error: 'Invalid input provided.',
      fieldErrors: parsed.error.flatten().fieldErrors,
      license: licenseResult,
    };
  }

  const { subject, body } = parsed.data;

  try {
    // 2. Validate Placeholders
    const validationResult = await validatePlaceholders({
      content: `${subject}\n${body}`,
      authorizedPlaceholders,
    });

    if (!validationResult.isValid) {
      return {
        data: null,
        error: `Unauthorized placeholders found: ${validationResult.invalidPlaceholders.join(', ')}. Please use only authorized placeholders.`,
        license: licenseResult,
      };
    }

    // 3. Populate Content
    const populatedContent = await getPlaceholders({
      googleSheetId: placeholderSheetId,
      subject,
      body,
    });

    return { data: populatedContent, error: null, license: licenseResult };
  } catch (e) {
    return {
      data: null,
      error: 'An unexpected error occurred while generating the preview.',
      license: null,
    };
  }
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export type LoginFormState = {
  error: string | null;
  fieldErrors?: {
    email?: string[];
  };
};

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const licenseSheetId = process.env.LICENSE_SHEET_ID;

  if (!licenseSheetId) {
    return {
      error: 'License Sheet ID is not configured. Please contact the administrator.',
    };
  }

  const parsed = loginSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return {
      error: 'Invalid input provided.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;

  try {
    const licenseResult = await validateLicense({
      licenseSheetId,
      email,
    });

    if (!licenseResult.isValid) {
      return {
        error: `Access Denied. ${licenseResult.reason || 'License is inactive or expired.'}`,
      };
    }
    
    await setUser({ email, expiryDate: licenseResult.expiryDate! });
    
  } catch (e) {
    return {
      error: 'An unexpected error occurred during license validation.',
    };
  }

  redirect('/dashboard');
}


export async function logoutAction() {
    await setUser(null);
    redirect('/');
}

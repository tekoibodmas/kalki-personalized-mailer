'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { generatePreviewAction, type MailerFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, Send, Users, ShieldCheck, ShieldOff } from 'lucide-react';
import EmailPreview from './email-preview';
import { SendLogTable } from './send-log-table';
import { useFormStatus } from 'react-dom';

const initialState: MailerFormState = {
  data: null,
  error: null,
  license: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Generate Preview
    </Button>
  );
}

export function MailerDashboard() {
  const [state, formAction] = useActionState(generatePreviewAction, initialState);
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<{ recipient: string; status: 'Sent' | 'Failed'; timestamp: string }[]>([]);
  const [recipients, setRecipients] = useState('');

  const { pending: isPreviewLoading } = useFormStatus();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  const previewData = useMemo(() => {
    return state.data ? state.data : { populatedSubject: '', populatedBody: '' };
  }, [state.data]);

  const recipientList = useMemo(() => {
    return recipients.split(/[\n,;]+/).map(email => email.trim()).filter(email => email);
  }, [recipients]);

  const handleSendEmails = () => {
    if (!state.data) {
      toast({
        variant: 'destructive',
        title: 'Cannot Send',
        description: 'Please generate a preview before sending emails.',
      });
      return;
    }
    if (recipientList.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Recipients',
        description: 'Please enter at least one recipient email address.',
      });
      return;
    }
    setIsSending(true);
    const newLogs: typeof logs = [];
    setTimeout(() => {
      recipientList.forEach(recipient => {
        newLogs.push({
          recipient,
          status: 'Sent',
          timestamp: new Date().toLocaleString(),
        });
      });
      setLogs(prevLogs => [...newLogs, ...prevLogs]);
      setIsSending(false);
      toast({
        title: 'Emails Sent',
        description: `Successfully sent ${recipientList.length} emails.`,
      });
    }, 2000);
  };
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Email Configuration</CardTitle>
          <CardDescription>Fill in the details to compose and send your personalized emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipients">
                <Users className="inline-block w-4 h-4 mr-1" />
                Recipients
              </Label>
              <Textarea
                id="recipients"
                name="recipients"
                placeholder="Paste email addresses here, separated by commas or new lines."
                className="min-h-[100px]"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                required
              />
              {state.fieldErrors?.recipients && <p className="text-sm font-medium text-destructive">{state.fieldErrors.recipients}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input id="subject" name="subject" placeholder="e.g., A Special {Offer} for {Company}" required />
              {state.fieldErrors?.subject && <p className="text-sm font-medium text-destructive">{state.fieldErrors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea id="body" name="body" placeholder="Hi {Name}, we have an exclusive offer for you..." className="min-h-[150px]" required />
              {state.fieldErrors?.body && <p className="text-sm font-medium text-destructive">{state.fieldErrors.body}</p>}
              <p className="text-xs text-muted-foreground">Allowed placeholders: {authorizedPlaceholders.map(p => `{${p}}`).join(', ')}.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentDocId">
                <FileText className="inline-block w-4 h-4 mr-1" />
                Attachment Google Doc ID (Optional)
              </Label>
              <Input id="attachmentDocId" name="attachmentDocId" placeholder="Enter Google Doc ID for PDF attachment" />
            </div>

            <div className="space-y-2">
              <Label>Sending Method</Label>
              <RadioGroup defaultValue="gmail" name="sendingMethod" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gmail" id="gmail" />
                  <Label htmlFor="gmail">Gmail API</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="smtp" id="smtp" />
                  <Label htmlFor="smtp">SMTP</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <SubmitButton />
              <Button type="button" variant="outline" onClick={handleSendEmails} disabled={isSending || !state.data || recipientList.length === 0}>
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Emails
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <EmailPreview subject={previewData.populatedSubject} body={previewData.populatedBody} loading={isPreviewLoading} />
        <SendLogTable logs={logs} />
      </div>
    </div>
  );
}

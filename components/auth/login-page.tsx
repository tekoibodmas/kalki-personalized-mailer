'use client';

import { useActionState, useEffect } from 'react';
import { loginAction, type LoginFormState } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, LogIn, Rocket } from 'lucide-react';

const initialState: LoginFormState = {
  error: null,
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
      Validate License & Sign In
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-4">
         <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary text-primary-foreground">
                <Rocket className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-center">
                KalKi Personalized Mailer
            </h1>
        </div>
        <Card>
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">License Validation</CardTitle>
              <CardDescription>
                Please enter your email address to validate your license and access the mailer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Failed</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                {state.fieldErrors?.email && (
                  <p className="text-sm font-medium text-destructive">
                    {state.fieldErrors.email}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
            Don't have a license? <a href="#" className="underline">Get one now</a>.
        </p>
      </div>
    </div>
  );
}

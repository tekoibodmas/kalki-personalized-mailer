import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";

type EmailPreviewProps = {
  subject: string;
  body: string;
  loading: boolean;
};

export default function EmailPreview({ subject, body, loading }: EmailPreviewProps) {
  const hasContent = subject || body;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Mail className="w-6 h-6 text-accent" />
          Email Preview
        </CardTitle>
        <CardDescription>
          This is how your email will look after placeholders are replaced.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : hasContent ? (
          <div className="p-4 border rounded-lg bg-background/50 space-y-2">
            <h3 className="font-bold text-lg">{subject}</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {body}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Generate a preview to see it here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

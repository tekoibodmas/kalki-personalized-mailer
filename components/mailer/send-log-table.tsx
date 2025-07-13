import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

type LogEntry = {
  recipient: string;
  status: "Sent" | "Failed";
  timestamp: string;
};

type SendLogTableProps = {
  logs: LogEntry[];
};

export function SendLogTable({ logs }: SendLogTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <History className="w-6 h-6 text-accent" />
          Send Log
        </CardTitle>
        <CardDescription>
          A history of the emails you've sent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{log.recipient}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "Sent" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{log.timestamp}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No emails sent yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

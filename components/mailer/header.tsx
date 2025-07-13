import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/auth";
import { LogOut, Rocket, User as UserIcon, Calendar } from "lucide-react";

type MailerHeaderProps = {
  user: User;
};

export default function MailerHeader({ user }: MailerHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-card p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
          <Rocket className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl font-headline">
          KalKi Personalized Mailer
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground hidden sm:block">
            <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Expires: {user.expiryDate}</span>
            </div>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="icon">
            <LogOut className="w-4 h-4" />
            <span className="sr-only">Log Out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

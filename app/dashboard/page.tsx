import MailerHeader from "@/components/mailer/header";
import { MailerDashboard } from "@/components/mailer/mailer-dashboard";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MailerHeader user={user} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <MailerDashboard />
      </main>
    </div>
  );
}
